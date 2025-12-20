import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/product`);
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => {
      url.searchParams.set(k, v);
    });


    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
    });
    const text = await upstreamRes.text();


    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "wp products error" }, { status: 500 });
  }
}
