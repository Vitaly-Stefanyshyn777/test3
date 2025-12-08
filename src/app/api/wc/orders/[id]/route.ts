import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const basicUser = process.env.WC_CONSUMER_KEY;
    const basicPass = process.env.WC_CONSUMER_SECRET;
    const { id } = await params;

    if (!basicUser || !basicPass) {
      return NextResponse.json(
        { error: "Missing WooCommerce Basic Auth credentials" },
        { status: 500 }
      );
    }

    const url = new URL(`${UPSTREAM_BASE}/wp-json/wc/v3/orders/${id}`);

    const authHeader =
      "Basic " + Buffer.from(`${basicUser}:${basicPass}`).toString("base64");

    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Authorization: authHeader },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: "Order not found" },
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
    console.error("/api/wc/orders/[id] error", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

