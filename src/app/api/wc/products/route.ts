import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${UPSTREAM_BASE}/wp-json/wc/v3/products`);
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => {
      url.searchParams.set(k, v);
    });

    // Авторизація: пріоритет Bearer з заголовку або env, fallback Basic
    const incomingAuth = req.headers.get("authorization") || "";
    const jwtFromHeader = incomingAuth.startsWith("Bearer ")
      ? incomingAuth
      : req.headers.get("x-wp-jwt")
      ? `Bearer ${req.headers.get("x-wp-jwt")}`
      : "";
    // Read token from cookie if exists
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
    } else {
      return NextResponse.json(
        { error: "Missing WC Basic Auth credentials" },
        { status: 500 }
      );
    }

    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Authorization: authHeader },
    });
    const text = await upstreamRes.text();

    // Спробуємо зібрати короткий summary відповіді
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const names = data.slice(0, 8).map((p) => p?.name);
        const categorySlugs = Array.from(
          new Set(
            data
              .flatMap((p) =>
                Array.isArray(p?.categories) ? p.categories : []
              )
              .map((c) => c?.slug)
              .filter(Boolean)
          )
        );
      }
    } catch (e) {
      // Пропускаємо помилку парсингу JSON
    }

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "wc products error" }, { status: 500 });
  }
}
