export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkspaceRole, MemberStatus } from "@prisma/client";
import { sendWorkspaceInviteEmail } from "@/lib/email";
import crypto from "crypto";

export interface TeamMemberResponse {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "invited";
  joinedAt: string;
  avatarUrl?: string;
  workspaceId: string;
}

// In-memory fallback cache for temporary/demo brand workspaces, strictly scoped by userId_workspaceId
const inMemoryFallback: Record<string, TeamMemberResponse[]> = {};

function getMaxSeatsForPlan(plan?: string | null): number {
  if (plan === "AGENCY" || plan === "ENTERPRISE" || plan === "PRO") return 15;
  if (plan === "GROWTH" || plan === "STARTER") return 5;
  return 3; // Free tier allows up to 3 seats (1 owner + 2 teammates)
}

function normalizeRole(roleStr: string): WorkspaceRole {
  const upper = roleStr.toUpperCase();
  if (upper === "ADMIN") return WorkspaceRole.ADMIN;
  if (upper === "VIEWER") return WorkspaceRole.VIEWER;
  if (upper === "OWNER") return WorkspaceRole.OWNER;
  return WorkspaceRole.EDITOR;
}

function roleToClient(role: WorkspaceRole): "owner" | "admin" | "editor" | "viewer" {
  switch (role) {
    case WorkspaceRole.OWNER:
      return "owner";
    case WorkspaceRole.ADMIN:
      return "admin";
    case WorkspaceRole.VIEWER:
      return "viewer";
    case WorkspaceRole.EDITOR:
    default:
      return "editor";
  }
}

// Helper: Find Brand workspace strictly belonging to or accessible by the authenticated user
async function findBrand(workspaceIdentifier: string, userId?: string, userEmail?: string) {
  if (!workspaceIdentifier || !userId) return null;

  try {
    // 1. Try finding by exact Brand ID if owned by user or user is a member
    const brandById = await prisma.brand.findFirst({
      where: {
        id: workspaceIdentifier,
        OR: [
          { userId },
          {
            members: {
              some: {
                OR: [
                  { userId },
                  ...(userEmail ? [{ email: userEmail.toLowerCase() }] : []),
                ],
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, plan: true },
        },
      },
    });

    if (brandById) return brandById;

    // 2. Try finding by user brands (or memberships) with slug/name matching
    const accessibleBrands = await prisma.brand.findMany({
      where: {
        OR: [
          { userId },
          {
            members: {
              some: {
                OR: [
                  { userId },
                  ...(userEmail ? [{ email: userEmail.toLowerCase() }] : []),
                ],
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, plan: true },
        },
      },
    });

    const targetSlug = workspaceIdentifier.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const found = accessibleBrands.find((b) => {
      const bSlug = b.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      return (
        b.id === workspaceIdentifier ||
        b.name.toLowerCase() === workspaceIdentifier.toLowerCase() ||
        bSlug === targetSlug
      );
    });

    return found || null;
  } catch (err) {
    console.warn("DB findBrand lookup failed:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "default";

    const userEmail = session.user.email || "";
    const userName = session.user.name || "Workspace Member";
    const userImage = session.user.image || undefined;

    let userPlan = "FREE";
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
      });
      if (dbUser?.plan) userPlan = dbUser.plan;
    } catch (err) {
      console.warn("Failed to query user plan from DB:", err);
    }

    const maxSeats = getMaxSeatsForPlan(userPlan);

    // Try finding Brand in database scoped to caller
    const brand = await findBrand(workspaceId, session.user.id, userEmail);

    if (brand) {
      try {
        // Fetch persisted workspace members from database
        const dbMembers = await prisma.workspaceMember.findMany({
          where: { brandId: brand.id },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { invitedAt: "asc" },
        });

        // Construct members list with Brand Owner at top
        const ownerEmail = brand.user?.email || userEmail;
        const ownerName = brand.user?.name || userName;
        const ownerImage = brand.user?.image || userImage;

        const members: TeamMemberResponse[] = [
          {
            id: `owner-${brand.userId}`,
            name: ownerName,
            email: ownerEmail,
            role: "owner",
            status: "active",
            joinedAt: brand.createdAt.toISOString(),
            avatarUrl: ownerImage || undefined,
            workspaceId: brand.id,
          },
        ];

        for (const m of dbMembers) {
          // Skip if same as owner email to prevent duplicates
          if (m.email.toLowerCase() === ownerEmail.toLowerCase()) continue;

          members.push({
            id: m.id,
            name: m.name || m.user?.name || m.email.split("@")[0],
            email: m.email,
            role: roleToClient(m.role),
            status: m.status === MemberStatus.ACTIVE ? "active" : "invited",
            joinedAt: (m.joinedAt || m.invitedAt).toISOString(),
            avatarUrl: m.user?.image || undefined,
            workspaceId: brand.id,
          });
        }

        const activeCount = members.filter((m) => m.status === "active").length;
        const pendingCount = members.filter((m) => m.status === "invited").length;

        return NextResponse.json({
          success: true,
          members,
          plan: userPlan,
          maxSeats,
          activeCount,
          pendingCount,
        });
      } catch (dbErr) {
        console.warn("Error reading workspace members from DB:", dbErr);
      }
    }

    // Fallback for demo / unpersisted workspace (strictly scoped to this user)
    const userFallbackKey = `${session.user.id}_${workspaceId}`;
    if (!inMemoryFallback[userFallbackKey]) {
      inMemoryFallback[userFallbackKey] = [
        {
          id: `mem-${session.user.id}`,
          name: userName,
          email: userEmail,
          role: "owner",
          status: "active",
          joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          avatarUrl: userImage,
          workspaceId,
        },
      ];
    }

    const members = inMemoryFallback[userFallbackKey];
    const activeCount = members.filter((m) => m.status === "active").length;
    const pendingCount = members.filter((m) => m.status === "invited").length;

    return NextResponse.json({
      success: true,
      members,
      plan: userPlan,
      maxSeats,
      activeCount,
      pendingCount,
    });
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const roleStr = typeof body.role === "string" ? body.role : "editor";
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "default";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    let userPlan = "FREE";
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
      });
      if (dbUser?.plan) userPlan = dbUser.plan;
    } catch (err) {
      console.warn("Failed to check user plan:", err);
    }

    const maxSeats = getMaxSeatsForPlan(userPlan);
    const brand = await findBrand(workspaceId, session.user.id, session.user.email || undefined);

    if (brand) {
      // Authorization check: User must be brand owner or active ADMIN member
      const isOwner = brand.userId === session.user.id;
      const isAdminMember = await prisma.workspaceMember.findFirst({
        where: {
          brandId: brand.id,
          OR: [
            { userId: session.user.id },
            ...(session.user.email ? [{ email: session.user.email.toLowerCase() }] : []),
          ],
          role: { in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] },
          status: MemberStatus.ACTIVE,
        },
      });

      if (!isOwner && !isAdminMember) {
        return NextResponse.json(
          { error: "Forbidden. Only workspace owners and admins can invite team members." },
          { status: 403 }
        );
      }

      try {
        // Check current members count in DB (1 owner + existing members)
        const existingMembersCount = await prisma.workspaceMember.count({
          where: { brandId: brand.id },
        });

        const totalSeatsUsed = existingMembersCount + 1; // +1 for workspace owner
        if (totalSeatsUsed >= maxSeats) {
          return NextResponse.json(
            {
              error: `Team seat limit reached (${totalSeatsUsed}/${maxSeats}). Upgrade your plan to invite more teammates.`,
              limitReached: true,
              maxSeats,
            },
            { status: 403 }
          );
        }

        // Check if email belongs to workspace owner
        if (brand.user?.email && brand.user.email.toLowerCase() === email) {
          return NextResponse.json(
            { error: "This email address is the owner of the workspace." },
            { status: 400 }
          );
        }

        // Check if member already exists in DB
        const existingMember = await prisma.workspaceMember.findUnique({
          where: {
            brandId_email: {
              brandId: brand.id,
              email,
            },
          },
        });

        if (existingMember) {
          return NextResponse.json(
            { error: "A team member with this email has already been invited or is active." },
            { status: 400 }
          );
        }

        // Check if invited user is already a registered user in DB
        const registeredUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, image: true },
        });

        const inviteToken = crypto.randomUUID();
        const newRole = normalizeRole(roleStr);

        const createdMember = await prisma.workspaceMember.create({
          data: {
            brandId: brand.id,
            userId: registeredUser?.id || null,
            email,
            name: registeredUser?.name || email.split("@")[0],
            role: newRole,
            status: registeredUser ? MemberStatus.ACTIVE : MemberStatus.INVITED,
            inviteToken,
            joinedAt: registeredUser ? new Date() : null,
          },
        });

        // Send actual invitation email via Resend / EmailService
        const emailResult = await sendWorkspaceInviteEmail({
          to: email,
          inviterName: session.user.name || brand.user?.name || "A team lead",
          brandName: brand.name,
          role: roleToClient(createdMember.role),
          inviteToken,
        });

        // If registered user exists, trigger a notification
        if (registeredUser?.id) {
          try {
            await prisma.notification.create({
              data: {
                userId: registeredUser.id,
                brandId: brand.id,
                type: "system",
                title: `Added to ${brand.name} Workspace`,
                message: `You have been added as ${newRole} to the "${brand.name}" workspace.`,
                link: "/dashboard",
              },
            });
          } catch (notifErr) {
            console.warn("Failed to create invite notification:", notifErr);
          }
        }

        const responseMember: TeamMemberResponse = {
          id: createdMember.id,
          name: createdMember.name || email.split("@")[0],
          email: createdMember.email,
          role: roleToClient(createdMember.role),
          status: createdMember.status === MemberStatus.ACTIVE ? "active" : "invited",
          joinedAt: (createdMember.joinedAt || createdMember.invitedAt).toISOString(),
          avatarUrl: registeredUser?.image || undefined,
          workspaceId: brand.id,
        };

        return NextResponse.json({
          success: true,
          member: responseMember,
          inviteUrl: emailResult.inviteUrl,
          message: `Invitation successfully sent to ${email}`,
        });
      } catch (dbErr) {
        console.warn("Database invite error, falling back to cache:", dbErr);
      }
    }

    // Fallback for user's personal session / unpersisted workspace
    const userFallbackKey = `${session.user.id}_${workspaceId}`;
    if (!inMemoryFallback[userFallbackKey]) {
      inMemoryFallback[userFallbackKey] = [
        {
          id: `mem-${session.user.id}`,
          name: session.user.name || "Workspace Owner",
          email: session.user.email || "owner@querysonar.com",
          role: "owner",
          status: "active",
          joinedAt: new Date().toISOString(),
          workspaceId,
        },
      ];
    }

    const currentMembers = inMemoryFallback[userFallbackKey];
    if (currentMembers.length >= maxSeats) {
      return NextResponse.json(
        {
          error: `Team seat limit reached (${currentMembers.length}/${maxSeats}). Upgrade your plan to invite more teammates.`,
          limitReached: true,
          maxSeats,
        },
        { status: 403 }
      );
    }

    if (currentMembers.some((m) => m.email.toLowerCase() === email)) {
      return NextResponse.json(
        { error: "A team member with this email has already been invited or is active." },
        { status: 400 }
      );
    }

    const inviteToken = crypto.randomUUID();
    const fallbackRole = normalizeRole(roleStr);

    const fallbackMember: TeamMemberResponse = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: email.split("@")[0],
      email,
      role: roleToClient(fallbackRole),
      status: "invited",
      joinedAt: new Date().toISOString(),
      workspaceId,
    };

    inMemoryFallback[userFallbackKey].push(fallbackMember);

    // Send email or log link in dev
    const emailResult = await sendWorkspaceInviteEmail({
      to: email,
      inviterName: session.user.name || "Workspace Lead",
      brandName: workspaceId.toUpperCase(),
      role: fallbackMember.role,
      inviteToken,
    });

    return NextResponse.json({
      success: true,
      member: fallbackMember,
      inviteUrl: emailResult.inviteUrl,
      message: `Invitation successfully sent to ${email}`,
    });
  } catch (error) {
    console.error("Failed to invite team member:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to invite team member" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const memberId = typeof body.memberId === "string" ? body.memberId.trim() : "";
    const roleStr = typeof body.role === "string" ? body.role : "editor";
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "default";

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    if (memberId.startsWith("owner-")) {
      return NextResponse.json({ error: "Cannot change the workspace owner's role" }, { status: 400 });
    }

    const newRole = normalizeRole(roleStr);

    // Try updating in Database with authorization checks
    try {
      const targetMember = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
        include: { brand: true },
      });

      if (targetMember) {
        // Authorization check: Is caller the brand owner or an active admin?
        const isOwner = targetMember.brand.userId === session.user.id;
        const isAdminMember = await prisma.workspaceMember.findFirst({
          where: {
            brandId: targetMember.brandId,
            OR: [
              { userId: session.user.id },
              ...(session.user.email ? [{ email: session.user.email.toLowerCase() }] : []),
            ],
            role: { in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] },
            status: MemberStatus.ACTIVE,
          },
        });

        if (!isOwner && !isAdminMember) {
          return NextResponse.json(
            { error: "Forbidden. Only workspace owners and admins can modify member roles." },
            { status: 403 }
          );
        }

        const updated = await prisma.workspaceMember.update({
          where: { id: memberId },
          data: { role: newRole },
        });

        return NextResponse.json({
          success: true,
          member: {
            id: updated.id,
            name: updated.name || updated.email.split("@")[0],
            email: updated.email,
            role: roleToClient(updated.role),
            status: updated.status === MemberStatus.ACTIVE ? "active" : "invited",
            joinedAt: (updated.joinedAt || updated.invitedAt).toISOString(),
            workspaceId: updated.brandId,
          },
        });
      }
    } catch {
      // Continue to fallback
    }

    // Fallback for memory store (scoped by user session)
    const userFallbackKey = `${session.user.id}_${workspaceId}`;
    const members = inMemoryFallback[userFallbackKey] || [];
    const targetIdx = members.findIndex((m) => m.id === memberId);

    if (targetIdx !== -1) {
      if (members[targetIdx].role === "owner") {
        return NextResponse.json({ error: "Cannot change the workspace owner's role" }, { status: 400 });
      }
      members[targetIdx].role = roleToClient(newRole);
      return NextResponse.json({ success: true, member: members[targetIdx] });
    }

    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to update member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const workspaceId = searchParams.get("workspaceId") || "default";

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    if (memberId.startsWith("owner-")) {
      return NextResponse.json({ error: "Cannot remove the workspace owner" }, { status: 400 });
    }

    // Try deleting from database with authorization checks
    try {
      const targetMember = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
        include: { brand: true },
      });

      if (targetMember) {
        // Authorization check: Is caller the brand owner, admin, or the member themselves leaving?
        const isOwner = targetMember.brand.userId === session.user.id;
        const isSelf =
          targetMember.userId === session.user.id ||
          (session.user.email &&
            targetMember.email.toLowerCase() === session.user.email.toLowerCase());
        const isAdminMember = await prisma.workspaceMember.findFirst({
          where: {
            brandId: targetMember.brandId,
            OR: [
              { userId: session.user.id },
              ...(session.user.email ? [{ email: session.user.email.toLowerCase() }] : []),
            ],
            role: { in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] },
            status: MemberStatus.ACTIVE,
          },
        });

        if (!isOwner && !isAdminMember && !isSelf) {
          return NextResponse.json(
            { error: "Forbidden. You do not have permission to remove this member." },
            { status: 403 }
          );
        }

        await prisma.workspaceMember.delete({
          where: { id: memberId },
        });

        return NextResponse.json({
          success: true,
          deletedId: memberId,
        });
      }
    } catch {
      // Continue to fallback
    }

    // Fallback for memory store (scoped by user session)
    const userFallbackKey = `${session.user.id}_${workspaceId}`;
    const members = inMemoryFallback[userFallbackKey] || [];
    const target = members.find((m) => m.id === memberId);

    if (!target) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (target.role === "owner") {
      return NextResponse.json({ error: "Cannot remove the workspace owner" }, { status: 400 });
    }

    inMemoryFallback[userFallbackKey] = members.filter((m) => m.id !== memberId);

    return NextResponse.json({
      success: true,
      deletedId: memberId,
    });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
