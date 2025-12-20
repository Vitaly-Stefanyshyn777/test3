import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Отримуємо продукт
    const productResponse = await fetch(`${process.env.NEXT_PUBLIC_UPSTREAM_BASE}/wp-json/wc/v3/products/${productId}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('ck_fbd08d0a763d79d93aff6c3a56306214710ebb71:cs_871e6f287926ed84839018c2d7578ef9a71865c4').toString('base64'),
        'Content-Type': 'application/json'
      }
    });

    if (!productResponse.ok) {
      throw new Error(`Product API error: ${productResponse.status}`);
    }

    const product = await productResponse.json();

    if (!product.variations?.length) {
      return NextResponse.json({
        product_id: product.id,
        product_name: product.name,
        type: product.type,
        variations: [],
        message: "Продукт не має варіацій"
      });
    }

    // Отримуємо перші 5 варіацій
    const variations = await Promise.all(
      product.variations.slice(0, 5).map(async (variationId: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_UPSTREAM_BASE}/wp-json/wc/v3/products/${productId}/variations/${variationId}`, {
          headers: {
            'Authorization': 'Basic ' + Buffer.from('ck_fbd08d0a763d79d93aff6c3a56306214710ebb71:cs_871e6f287926ed84839018c2d7578ef9a71865c4').toString('base64'),
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) return null;
        return response.json();
      })
    );

    const validVariations = variations.filter(Boolean);

    // Отримуємо унікальні розміри та кольори
    const sizes = Array.from(
      new Set(
        validVariations
          .flatMap(v => v.attributes || [])
          .filter(attr => attr.slug === 'pa_size')
          .map(attr => attr.option)
      )
    );

    const colors = Array.from(
      new Set(
        validVariations
          .flatMap(v => v.attributes || [])
          .filter(attr => attr.slug === 'pa_color')
          .map(attr => attr.option)
      )
    );

    return NextResponse.json({
      product_id: product.id,
      product_name: product.name,
      type: product.type,
      total_variations: product.variations.length,
      variations_loaded: validVariations.length,
      available_sizes: sizes,
      available_colors: colors,
      variations: validVariations.map(v => ({
        id: v.id,
        price: v.price,
        regular_price: v.regular_price,
        attributes: v.attributes
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to test product variations",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
