import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Prefer incoming Authorization header (for local testing), fallback to server env
    let authHeader = req.headers.get("authorization") || "";
    if (!authHeader) {
      // ENV-ONLY: WC consumer key/secret must be set in server env
      const ck =
        process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
      const cs =
        process.env.WC_CONSUMER_SECRET ||
        process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
      if (!ck || !cs) {
        return NextResponse.json(
          { error: "Missing WC consumer key/secret in env" },
          { status: 500 }
        );
      }
      authHeader = "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
    }

    const url = `${UPSTREAM_BASE}/wp-json/applications/v2/question`;
    const upstreamRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await upstreamRes.text();

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("/api/applications/question POST error", error);
    return NextResponse.json(
      { error: "applications question error" },
      { status: 500 }
    );
  }
}
