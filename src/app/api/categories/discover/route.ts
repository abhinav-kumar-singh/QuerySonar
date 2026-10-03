import { NextRequest, NextResponse } from "next/server";
import { discoverBrandCategories } from "@/lib/geo-engine/generators/query-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, websiteUrl, categoryHint, targetLocation } = body;

    if (!brandName || typeof brandName !== "string" || !brandName.trim()) {
      return NextResponse.json(
        { error: "Brand name is required to discover business categories" },
        { status: 400 }
      );
    }

    const discovery = await discoverBrandCategories(
      brandName.trim(),
      typeof websiteUrl === "string" ? websiteUrl.trim() : undefined,
      typeof categoryHint === "string" ? categoryHint.trim() : undefined,
      typeof targetLocation === "string" ? targetLocation.trim() : undefined
    );

    return NextResponse.json({
      success: true,
      data: discovery,
    });
  } catch (error) {
    console.error("Category discovery route error:", error);
    return NextResponse.json(
      { error: "Failed to discover business categories. Please try again." },
      { status: 500 }
    );
  }
}
