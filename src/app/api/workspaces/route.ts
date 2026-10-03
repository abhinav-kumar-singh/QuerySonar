export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getMaxBrandsForPlan(plan?: string | null): number {
  if (plan === "AGENCY" || plan === "ENTERPRISE" || plan === "PRO") return 5;
  if (plan === "GROWTH" || plan === "STARTER") return 2;
  return 1; // Free tier allows 1 brand workspace
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        workspaces: [],
        plan: "FREE",
        maxWorkspaces: 1,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        plan: true,
        brands: {
          orderBy: { createdAt: "asc" },
          include: {
            queries: { where: { isActive: true }, select: { id: true, queryText: true } },
            auditRuns: {
              orderBy: { runDate: "desc" },
              take: 1,
              select: {
                id: true,
                overallScore: true,
                status: true,
                runDate: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        workspaces: [],
        plan: "FREE",
        maxWorkspaces: 1,
      });
    }

    const maxWorkspaces = getMaxBrandsForPlan(user.plan);

    const workspaces = user.brands.map((b) => ({
      id: b.id,
      name: b.name,
      websiteUrl: b.websiteUrl,
      competitors: b.competitors,
      queriesCount: b.queries.length,
      overallScore: b.auditRuns[0]?.overallScore ?? null,
      lastAuditDate: b.auditRuns[0]?.runDate ?? null,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({
      success: true,
      workspaces,
      plan: user.plan,
      maxWorkspaces,
    });
  } catch (error) {
    console.error("Failed to list workspaces:", error);
    return NextResponse.json(
      { error: "Failed to list workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const websiteUrl = typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : "";
    const targetLocation = typeof body.targetLocation === "string" ? body.targetLocation.trim() : undefined;
    const competitors = Array.isArray(body.competitors)
      ? body.competitors.filter((c: unknown): c is string => typeof c === "string" && Boolean(c.trim()))
      : [];

    if (!name) {
      return NextResponse.json({ error: "Workspace brand name is required" }, { status: 400 });
    }

    if (!session?.user?.id) {
      // Return workspace object for client-side storage
      return NextResponse.json({
        success: true,
        workspace: {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name,
          websiteUrl,
          targetLocation,
          competitors,
          queriesCount: 0,
          overallScore: null,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        plan: true,
        _count: { select: { brands: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const maxWorkspaces = getMaxBrandsForPlan(user.plan);
    if (user._count.brands >= maxWorkspaces) {
      return NextResponse.json(
        {
          error: `Workspace limit reached (${user._count.brands}/${maxWorkspaces}). Please upgrade your plan to add more brand workspaces.`,
          limitReached: true,
          currentCount: user._count.brands,
          maxWorkspaces,
        },
        { status: 403 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name,
        websiteUrl,
        competitors,
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: brand.id,
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        targetLocation,
        competitors: brand.competitors,
        queriesCount: 0,
        overallScore: null,
        createdAt: brand.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
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
    const workspaceId = searchParams.get("id");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const brand = await prisma.brand.findFirst({
      where: { id: workspaceId, userId: session.user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: "Workspace not found or unauthorized" }, { status: 404 });
    }

    await prisma.brand.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ success: true, deletedId: workspaceId });
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
