import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/product`);
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => {
      url.searchParams.set(k, v);
    });

    console.log("[WP Products API] 🔍 Запит:", url.toString());

    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
    });
    const text = await upstreamRes.text();

    console.log("[WP Products API] ✅ Відповідь:", upstreamRes.status);

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("/api/wp/products error", error);
    return NextResponse.json({ error: "wp products error" }, { status: 500 });
  }
}
