import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let authHeader = req.headers.get("authorization") || "";

    if (!authHeader) {
      const jwt = process.env.WP_JWT_TOKEN;
      if (jwt) {
        authHeader = `Bearer ${jwt}`;
      } else {
        const ck = process.env.WC_CONSUMER_KEY;
        const cs = process.env.WC_CONSUMER_SECRET;
        if (ck && cs) {
          authHeader = "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
        } else {
          const bu = process.env.WC_BASIC_USER;
          const bp = process.env.WC_BASIC_PASS;
          if (bu && bp) {
            authHeader =
              "Basic " + Buffer.from(`${bu}:${bp}`).toString("base64");
          } else {
            return NextResponse.json(
              {
                error:
                  "Missing auth: provide WP_JWT_TOKEN or WC_CONSUMER_KEY/SECRET or WC_BASIC_USER/PASS",
              },
              { status: 500 }
            );
          }
        }
      }
    }

    const url = `${UPSTREAM_BASE}/wp-json/applications/v2/training`;
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
    console.error("/api/applications/training POST error", error);
    return NextResponse.json(
      { error: "applications training error" },
      { status: 500 }
    );
  }
}
