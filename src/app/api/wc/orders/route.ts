import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Отримуємо токен з заголовків або з environment
    const authHeader = request.headers.get("authorization");
    const jwtFromCookie = request.cookies.get("jwt")?.value;
    const jwtFromEnv = process.env.WP_JWT_TOKEN;
    const basicUser = process.env.WC_CONSUMER_KEY;
    const basicPass = process.env.WC_CONSUMER_SECRET;

    let authToken = "";
    // Використовуємо тільки Basic Auth
    if (basicUser && basicPass) {
      authToken = `Basic ${Buffer.from(`${basicUser}:${basicPass}`).toString(
        "base64"
      )}`;
      console.log("[Orders API] 🔐 Використовується Basic Auth");
    } else {
      return NextResponse.json(
        { error: "Missing WC Basic Auth credentials" },
        { status: 500 }
      );
    }

    console.log("[WC Orders API] 🚀 Створюємо замовлення:", {
      paymentMethod: body.payment_method,
      billingEmail: body.billing?.email,
      lineItemsCount: body.line_items?.length || 0,
      lineItems: body.line_items,
      billing: body.billing,
      shipping: body.shipping,
    });

    const upstreamBase = process.env.UPSTREAM_BASE as string;
    const response = await fetch(`${upstreamBase}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WC Orders API] ❌ Помилка створення замовлення:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
        requestBody: body,
      });
      return NextResponse.json(
        { error: "Failed to create order", details: data },
        { status: response.status }
      );
    }

    console.log("[WC Orders API] ✅ Замовлення створено:", {
      orderId: data.id,
      status: data.status,
      total: data.total,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[WC Orders API] ❌ Помилка:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
