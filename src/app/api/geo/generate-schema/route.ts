export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateLiveSchema } from "@/lib/geo-engine/generators/geo-optimizer";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to generate schema markup." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { brandName, websiteUrl, category, targetLocation, products, description } = body;

    if (!brandName || !websiteUrl) {
      return NextResponse.json(
        { success: false, error: "brandName and websiteUrl are required" },
        { status: 400 }
      );
    }

    const result = await generateLiveSchema({
      brandName,
      websiteUrl,
      category,
      targetLocation,
      products,
      description,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error in /api/geo/generate-schema:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate JSON-LD schema" },
      { status: 500 }
    );
  }
}
