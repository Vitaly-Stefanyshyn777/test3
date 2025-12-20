import { NextResponse } from "next/server";
import { getAllProducts, mapProductToUi } from "@/lib/products";

export async function GET() {
  try {
    const products = await getAllProducts();
    const mappedProducts = products.map(mapProductToUi);

    return NextResponse.json(mappedProducts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
