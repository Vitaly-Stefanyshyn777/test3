import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const queryString = searchParams.toString();
  const wpApiUrl = `${apiUrl}/wp-json/wp/v2/product?${queryString}`;

  try {
    const response = await fetch(wpApiUrl, {
      // Cache-Control header to prevent caching during development
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch products from WordPress: ${response.status} ${response.statusText} - ${errorText}`
      );
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in WP product API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
