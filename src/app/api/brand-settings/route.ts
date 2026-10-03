export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getMaxQueriesForPlan(plan?: string | null): number {
  if (plan === "STARTER" || plan === "GROWTH") return 30;
  if (plan === "PRO" || plan === "AGENCY" || plan === "ENTERPRISE") return 100;
  return 3; // Free Tier allows up to 3 audit queries
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, plan: true },
  });
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const maxQueries = getMaxQueriesForPlan(user.plan);
    const { searchParams } = new URL(request.url);
    const brandNameParam = searchParams.get("brandName")?.trim();

    let brand = null;
    if (brandNameParam) {
      brand = await prisma.brand.findFirst({
        where: {
          userId: user.id,
          name: { equals: brandNameParam, mode: "insensitive" },
        },
        include: {
          queries: {
            where: { isActive: true },
            orderBy: { id: "asc" },
          },
        },
      });
    }

    if (!brand) {
      brand = await prisma.brand.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          queries: {
            where: { isActive: true },
            orderBy: { id: "asc" },
          },
        },
      });
    }

    if (!brand) {
      return NextResponse.json({
        brand: null,
        queries: [],
        plan: user.plan,
        maxQueries,
      });
    }

    return NextResponse.json({
      brand: {
        id: brand.id,
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        competitors: brand.competitors,
      },
      queries: brand.queries.map((query) => ({
        id: query.id,
        queryText: query.queryText,
      })),
      plan: user.plan,
      maxQueries,
    });
  } catch (error) {
    console.error("Failed to load brand settings:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const maxQueries = getMaxQueriesForPlan(user.plan);
    const body = await request.json();
    const brandName = typeof body.brandName === "string" ? body.brandName.trim() : "";
    const websiteUrl = typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : "";
    const competitors = normalizeStringArray(body.competitors);
    const queries = normalizeStringArray(body.queries).slice(0, maxQueries);
    const resetOnIdentityChange = body.resetOnIdentityChange === true;

    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const existingBrand = await prisma.brand.findFirst({
      where: {
        userId: user.id,
        name: { equals: brandName, mode: "insensitive" },
      },
    });

    const identityChanged = Boolean(
      existingBrand &&
      existingBrand.websiteUrl &&
      websiteUrl &&
      existingBrand.websiteUrl.trim().replace(/\/$/, "").toLowerCase() !== websiteUrl.trim().replace(/\/$/, "").toLowerCase()
    );

    if (identityChanged && !resetOnIdentityChange) {
      return NextResponse.json(
        {
          error: "Changing brand name or website URL requires reset confirmation.",
          code: "IDENTITY_RESET_REQUIRED",
        },
        { status: 409 }
      );
    }

    const brand = await prisma.$transaction(async (tx) => {
      const savedBrand = existingBrand
        ? await tx.brand.update({
            where: { id: existingBrand.id },
            data: { name: brandName, websiteUrl, competitors },
          })
        : await tx.brand.create({
            data: { userId: user.id, name: brandName, websiteUrl, competitors },
          });

      if (identityChanged) {
        await tx.auditRun.deleteMany({ where: { brandId: savedBrand.id } });
      }

      await tx.trackedQuery.deleteMany({
        where: { brandId: savedBrand.id },
      });

      const queriesToSave = identityChanged ? [] : queries;
      if (queriesToSave.length > 0) {
        await tx.trackedQuery.createMany({
          data: queriesToSave.map((queryText) => ({
            brandId: savedBrand.id,
            queryText,
            isActive: true,
          })),
        });
      }

      return savedBrand;
    });

    const savedQueries = await prisma.trackedQuery.findMany({
      where: { brandId: brand.id, isActive: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      brand: {
        id: brand.id,
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        competitors: brand.competitors,
      },
      queries: savedQueries.map((query) => ({
        id: query.id,
        queryText: query.queryText,
      })),
    });
  } catch (error) {
    console.error("Failed to save brand settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
