import { NextResponse } from "next/server";
import { checkProductsWithImageColors } from "@/lib/products";

export async function GET() {
  try {
    const productsWithImageColors = await checkProductsWithImageColors();

    return NextResponse.json({
      success: true,
      count: productsWithImageColors.length,
      products: productsWithImageColors
    });
  } catch (error) {
    console.error('Error checking image colors:', error);
    return NextResponse.json(
      { error: 'Failed to check image colors' },
      { status: 500 }
    );
  }
}
