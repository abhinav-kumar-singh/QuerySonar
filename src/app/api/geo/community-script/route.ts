import { NextRequest, NextResponse } from "next/server";
import { generateLiveCommunityScript } from "@/lib/geo-engine/generators/geo-optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadTitle, subredditOrDomain, url, brandName, category, competitors } = body;

    if (!threadTitle || !brandName) {
      return NextResponse.json(
        { success: false, error: "threadTitle and brandName are required" },
        { status: 400 }
      );
    }

    const result = await generateLiveCommunityScript({
      threadTitle,
      subredditOrDomain: subredditOrDomain || "Reddit",
      url: url || "",
      brandName,
      category,
      competitors,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error in /api/geo/community-script:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate community script" },
      { status: 500 }
    );
  }
}
