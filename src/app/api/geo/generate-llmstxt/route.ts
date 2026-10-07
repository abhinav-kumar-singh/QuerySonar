export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateLiveLlmsTxt } from "@/lib/geo-engine/generators/geo-optimizer";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to generate llms.txt." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { brandName, websiteUrl, category, targetLocation, competitors, brandSummary } = body;

    if (!brandName || !websiteUrl) {
      return NextResponse.json(
        { success: false, error: "brandName and websiteUrl are required" },
        { status: 400 }
      );
    }

    const result = await generateLiveLlmsTxt({
      brandName,
      websiteUrl,
      category,
      targetLocation,
      competitors,
      brandSummary,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error in /api/geo/generate-llmstxt:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate llms.txt" },
      { status: 500 }
    );
  }
}
