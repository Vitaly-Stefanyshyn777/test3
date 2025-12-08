import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

function getBasicAuth() {
  const ck = process.env.WC_CONSUMER_KEY;
  const cs = process.env.WC_CONSUMER_SECRET;
  if (ck && cs) return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
  const bu = process.env.WC_BASIC_USER;
  const bp = process.env.WC_BASIC_PASS;
  if (bu && bp) return "Basic " + Buffer.from(`${bu}:${bp}`).toString("base64");
  return "";
}

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.search;
    const url = `${UPSTREAM_BASE}/wp-json/wc/v3/products/reviews${qs || ""}`;
    const upstream = await fetch(url, {
      headers: {
        Authorization: req.headers.get("authorization") || getBasicAuth(),
      },
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "wc reviews get error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const url = `${UPSTREAM_BASE}/wp-json/wc/v3/products/reviews`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || getBasicAuth(),
      },
      body,
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "wc reviews post error" },
      { status: 500 }
    );
  }
}
