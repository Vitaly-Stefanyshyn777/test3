import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${UPSTREAM_BASE}/wp-json/wp/v2/product/${id}`;


    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const text = await upstreamRes.text();


    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "wp product error" }, { status: 500 });
  }
}
