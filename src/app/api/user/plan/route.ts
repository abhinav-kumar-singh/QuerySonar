import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Plan } from "@prisma/client";

function getMaxQueriesForPlan(plan?: string | null): number {
  if (plan === "STARTER" || plan === "GROWTH") return 30;
  if (plan === "PRO" || plan === "AGENCY" || plan === "ENTERPRISE") return 100;
  return 3; // Free Tier allows up to 3 queries
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        plan: "FREE",
        maxQueries: 3,
        demo: true,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({
        plan: "FREE",
        maxQueries: 3,
        demo: true,
      });
    }

    return NextResponse.json({
      plan: user.plan || "FREE",
      maxQueries: getMaxQueriesForPlan(user.plan),
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json({ plan: "FREE", maxQueries: 3, demo: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const planInput = typeof body.plan === "string" ? body.plan.toUpperCase() : "FREE";

    const validPlans: Record<string, Plan> = {
      FREE: Plan.FREE,
      GROWTH: Plan.GROWTH,
      STARTER: Plan.GROWTH,
      ENTERPRISE: Plan.ENTERPRISE,
      PRO: Plan.ENTERPRISE,
    };

    const targetPlan = validPlans[planInput] || Plan.FREE;

    const session = await auth();
    if (session?.user?.id) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: session.user.id },
          data: { plan: targetPlan },
          select: { id: true, plan: true },
        });

        return NextResponse.json({
          success: true,
          plan: updatedUser.plan,
          maxQueries: getMaxQueriesForPlan(updatedUser.plan),
        });
      } catch (dbErr) {
        console.warn("Prisma user update error in plan switcher:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      plan: targetPlan,
      maxQueries: getMaxQueriesForPlan(targetPlan),
      demo: true,
    });
  } catch (error) {
    console.error("Error updating user plan:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
