import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
    } else {
      return NextResponse.json(
        { error: "Missing WC Basic Auth credentials" },
        { status: 500 }
      );
    }

    const upstreamBase = process.env.UPSTREAM_BASE as string;
    const response = await fetch(
      `${upstreamBase}/wp-json/wc/v3/payment_gateways`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "[WC Payment Gateways API] ❌ Помилка отримання платіжних методів:",
        data
      );
      return NextResponse.json(
        { error: "Failed to fetch payment gateways", details: data },
        { status: response.status }
      );
    }

    console.log(
      "[WC Payment Gateways API] ✅ Отримано платіжних методів:",
      data.length
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[WC Payment Gateways API] ❌ Внутрішня помилка сервера:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
