import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${UPSTREAM_BASE}/wp-json/wc/v3/products/categories`);
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    // Авторизація: Bearer (пріоритет) або Basic
    const incomingAuth = req.headers.get("authorization") || "";
    const jwtFromHeader = incomingAuth.startsWith("Bearer ")
      ? incomingAuth
      : req.headers.get("x-wp-jwt")
      ? `Bearer ${req.headers.get("x-wp-jwt")}`
      : "";
    const jwtFromCookie = req.cookies.get("wp_jwt")?.value
      ? `Bearer ${req.cookies.get("wp_jwt")?.value}`
      : "";
    const jwtFromEnv = process.env.WP_JWT_TOKEN
      ? `Bearer ${process.env.WP_JWT_TOKEN}`
      : "";

    const basicUser = process.env.WC_CONSUMER_KEY;
    const basicPass = process.env.WC_CONSUMER_SECRET;

    let authHeader = "";
    // Використовуємо тільки Basic Auth
    if (basicUser && basicPass) {
      authHeader =
        "Basic " + Buffer.from(`${basicUser}:${basicPass}`).toString("base64");
      console.log("[Categories API] 🔐 Використовується Basic Auth");
    } else {
      return NextResponse.json(
        { error: "Missing WC Basic Auth credentials" },
        { status: 500 }
      );
    }

    console.log("[API] Запит до WooCommerce API:", url.toString());
    console.log(
      "[API] Використовується авторизація:",
      authHeader ? "✅" : "❌"
    );
    console.log(
      "[API] Auth header:",
      authHeader ? `${authHeader.substring(0, 20)}...` : "None"
    );

    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Authorization: authHeader },
    });

    console.log("[API] Статус відповіді:", upstreamRes.status);

    if (!upstreamRes.ok) {
      console.error(
        "[API] Помилка API:",
        upstreamRes.status,
        upstreamRes.statusText
      );
      const errorText = await upstreamRes.text();
      console.error("[API] Деталі помилки:", errorText);

      // Для 403 помилок повертаємо порожній масив замість помилки
      if (upstreamRes.status === 403) {
        console.log("[API] Повертаємо порожній масив для 403 помилки");
        return NextResponse.json([]);
      }

      return NextResponse.json(
        {
          error: "WooCommerce API error",
          status: upstreamRes.status,
          details: errorText,
        },
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
    console.error("/api/wc/products/categories error", error);
    return NextResponse.json(
      { error: "wc product categories error" },
      { status: 500 }
    );
  }
}
