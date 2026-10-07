export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MemberStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { inviteToken: token },
      include: {
        brand: {
          include: {
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!member || member.status !== MemberStatus.INVITED) {
      return NextResponse.json(
        { error: "This invitation link is invalid, expired, or has already been accepted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: member.id,
        email: member.email,
        role: member.role.toLowerCase(),
        brandName: member.brand.name,
        brandId: member.brand.id,
        websiteUrl: member.brand.websiteUrl,
        inviterName: member.brand.user?.name || "Workspace Owner",
        inviterEmail: member.brand.user?.email || "",
        inviterAvatar: member.brand.user?.image || undefined,
        invitedAt: member.invitedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to load invitation:", error);
    return NextResponse.json(
      { error: "Failed to load invitation details" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { inviteToken: token },
      include: {
        brand: true,
      },
    });

    if (!member || member.status !== MemberStatus.INVITED) {
      return NextResponse.json(
        { error: "This invitation link is invalid, expired, or has already been accepted." },
        { status: 404 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to your account before accepting this invitation." },
        { status: 401 }
      );
    }

    if (session.user.email && session.user.email.toLowerCase() !== member.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: `This invitation was issued to ${member.email}. You are currently signed in as ${session.user.email}. Please switch to ${member.email} to accept this invitation.`,
        },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const userName = session.user.name || member.name;

    // Accept invitation and mark member as ACTIVE
    const updated = await prisma.workspaceMember.update({
      where: { id: member.id },
      data: {
        userId,
        name: userName,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
        inviteToken: null, // Clear token upon acceptance
      },
    });

    return NextResponse.json({
      success: true,
      member: updated,
      brandName: member.brand.name,
      workspaceId: member.brand.id,
      message: `Successfully joined ${member.brand.name} workspace!`,
    });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
