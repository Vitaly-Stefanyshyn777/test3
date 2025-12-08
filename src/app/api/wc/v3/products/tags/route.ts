import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const UPSTREAM_BASE = process.env.UPSTREAM_BASE;
    const upstreamUrl = `${UPSTREAM_BASE}/wp-json/wc/v3/products/tags${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch product tags" },
      { status: 500 }
    );
  }
}
