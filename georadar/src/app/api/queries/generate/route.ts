import { NextRequest, NextResponse } from "next/server";
import {
  generateBrandQueries,
  generateCategoryBuyerPrompts,
} from "@/lib/geo-engine/generators/query-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, websiteUrl, categoryHint, selectedCategories, targetLocation } = body;

    if (!brandName || typeof brandName !== "string" || !brandName.trim()) {
      return NextResponse.json(
        { error: "Brand name is required to generate buyer questions" },
        { status: 400 }
      );
    }

    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      const prompts = await generateCategoryBuyerPrompts(
        brandName.trim(),
        typeof websiteUrl === "string" ? websiteUrl.trim() : undefined,
        selectedCategories,
        typeof targetLocation === "string" ? targetLocation.trim() : undefined
      );

      return NextResponse.json({
        success: true,
        data: {
          brandName: brandName.trim(),
          prompts,
          suggestedQueries: prompts.map((p) => ({
            queryText: p.queryText,
            type: p.type,
            personaLabel: p.categoryTag || p.personaLabel,
            categoryTag: p.categoryTag,
          })),
        },
      });
    }

    const intel = await generateBrandQueries(
      brandName.trim(),
      typeof websiteUrl === "string" ? websiteUrl.trim() : undefined,
      typeof categoryHint === "string" ? categoryHint.trim() : undefined,
      typeof targetLocation === "string" ? targetLocation.trim() : undefined
    );

    return NextResponse.json({
      success: true,
      data: intel,
    });
  } catch (error) {
    console.error("Query generation route error:", error);
    return NextResponse.json(
      { error: "Failed to generate buyer queries. Please enter one manually or try again." },
      { status: 500 }
    );
  }
}
