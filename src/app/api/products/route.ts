import { NextResponse } from "next/server";
import { getAllProducts, mapProductToUi } from "@/lib/products";

export async function GET() {
  try {
    const products = await getAllProducts();
    const mappedProducts = products.map(mapProductToUi);

    return NextResponse.json(mappedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
