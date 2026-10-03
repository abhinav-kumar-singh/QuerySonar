export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper to get authenticated user ID
async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

// GET /api/notifications - List user's notifications
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    let notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // If user has no notifications yet, seed starter notifications based on their brand/scans
    if (notifications.length === 0) {
      const userBrand = await prisma.brand.findFirst({
        where: { userId },
        include: {
          auditRuns: {
            orderBy: { runDate: "desc" },
            take: 1,
            include: {
              actions: { take: 2 },
              engineResponses: {
                take: 3,
                include: { citedSources: { take: 2 } },
              },
            },
          },
        },
      });

      const brandName = userBrand?.name || "Your Brand";
      const latestAudit = userBrand?.auditRuns?.[0];
      const score = Math.round(latestAudit?.overallScore ?? 84);

      const starterNotifications = [
        {
          userId,
          brandId: userBrand?.id || null,
          type: "visibility",
          title: "GEO Visibility Alert",
          message: `${brandName}'s AI share of voice is currently ${score}% across Perplexity, Gemini, and ChatGPT Search.`,
          link: "/dashboard",
          isRead: false,
        },
        {
          userId,
          brandId: userBrand?.id || null,
          type: "source",
          title: "New Citation Discovered",
          message: `High-impact citation detected on reddit.com boosting AI engine confidence.`,
          link: "/dashboard/sources",
          isRead: false,
        },
        {
          userId,
          brandId: userBrand?.id || null,
          type: "action",
          title: "Optimization Recommended",
          message: `Add Structured Schema markup to improve citation readiness in Claude & Gemini.`,
          link: "/dashboard/actions",
          isRead: false,
        },
        {
          userId,
          brandId: userBrand?.id || null,
          type: "system",
          title: "Engine Prober Ready",
          message: `AI visibility tracking is active for ${brandName}.`,
          link: "/dashboard",
          isRead: true,
        },
      ];

      try {
        await prisma.notification.createMany({
          data: starterNotifications,
        });

        notifications = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
      } catch {
        // Fallback if DB table hasn't been migrated yet
        return NextResponse.json({ notifications: starterNotifications });
      }
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ notifications: [] });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Missing id or markAll parameter" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, link, brandId } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        brandId: brandId || null,
        type: type || "system",
        title,
        message,
        link: link || "/dashboard",
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 });
  }
}
