export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateLiveDisplacementAnalysis } from "@/lib/geo-engine/generators/geo-optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, competitorName, category, targetLocation, queries } = body;

    if (!brandName || !competitorName) {
      return NextResponse.json(
        { success: false, error: "brandName and competitorName are required" },
        { status: 400 }
      );
    }

    const result = await generateLiveDisplacementAnalysis({
      brandName,
      competitorName,
      category,
      targetLocation,
      queries,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error in /api/geo/displacement-analysis:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to run displacement analysis" },
      { status: 500 }
    );
  }
}
