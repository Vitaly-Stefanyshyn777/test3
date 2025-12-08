import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;
const WC_CONSUMER_KEY =
  process.env.WC_CONSUMER_KEY || "ck_fbd08d0a763d79d93aff6c3a56306214710ebb71";
const WC_CONSUMER_SECRET =
  process.env.WC_CONSUMER_SECRET ||
  "cs_871e6f287926ed84839018c2d7578ef9a71865c4";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${UPSTREAM_BASE}/wp-json/wc/v3/products`);
    const incoming = new URL(req.url);

    // Копіюємо всі параметри запиту
    incoming.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Додаємо авторизацію
    url.searchParams.set("consumer_key", WC_CONSUMER_KEY);
    url.searchParams.set("consumer_secret", WC_CONSUMER_SECRET);

    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      return NextResponse.json(
        { error: "WC v3 products error" },
        { status: upstreamRes.status }
      );
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
    return NextResponse.json(
      { error: "wc v3 products error" },
      { status: 500 }
    );
  }
}
