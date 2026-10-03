export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateLiveContentBlueprint } from "@/lib/geo-engine/generators/geo-optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, brandName, category, targetLocation, competitors } = body;

    if (!query || !brandName) {
      return NextResponse.json(
        { success: false, error: "query and brandName are required" },
        { status: 400 }
      );
    }

    const result = await generateLiveContentBlueprint({
      query,
      brandName,
      category,
      targetLocation,
      competitors,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error in /api/geo/generate-content-blueprint:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate content blueprint" },
      { status: 500 }
    );
  }
}
