export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runInstantScan } from "@/lib/geo-engine/scanner";
import { ALL_ENGINES } from "@/lib/geo-engine/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to run an AI audit." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { brandName, websiteUrl, query, queries, competitors, category, targetLocation } = body;

    const queryInput = queries && Array.isArray(queries) && queries.length > 0 
      ? queries 
      : query;

    if (!brandName || !queryInput) {
      return NextResponse.json(
        { error: "Brand name and at least one search query are required" },
        { status: 400 }
      );
    }

    const result = await runInstantScan(
      brandName,
      websiteUrl || "",
      queryInput,
      ALL_ENGINES,
      Array.isArray(competitors) ? competitors : undefined,
      typeof category === "string" ? category : undefined,
      typeof targetLocation === "string" ? targetLocation : undefined
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Audit run error:", error);
    return NextResponse.json(
      { error: "Audit failed. Please try again." },
      { status: 500 }
    );
  }
}
