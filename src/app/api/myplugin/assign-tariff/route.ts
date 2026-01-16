import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string | undefined;

export async function POST(request: NextRequest) {
  try {
    if (!UPSTREAM_BASE) {
      return NextResponse.json(
        { error: "Missing UPSTREAM_BASE" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      user_id?: number;
      tariff_id?: number;
    };

    const basicUser = process.env.WC_CONSUMER_KEY;
    const basicPass = process.env.WC_CONSUMER_SECRET;

    if (!basicUser || !basicPass) {
      return NextResponse.json(
        { error: "Missing Basic Auth credentials" },
        { status: 500 }
      );
    }

    if (!Number.isFinite(body?.user_id) || (body.user_id as number) <= 0) {
      return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
    }
    if (!Number.isFinite(body?.tariff_id) || (body.tariff_id as number) <= 0) {
      return NextResponse.json({ error: "Invalid tariff_id" }, { status: 400 });
    }

    const authToken =
      "Basic " + Buffer.from(`${basicUser}:${basicPass}`).toString("base64");

    const upstreamRes = await fetch(
      `${UPSTREAM_BASE}/wp-json/myplugin/v1/assign-tariff`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

