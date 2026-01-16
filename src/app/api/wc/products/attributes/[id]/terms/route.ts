import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(
      `${UPSTREAM_BASE}/wp-json/wc/v3/products/attributes/${id}/terms`
    );
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const incomingAuth = req.headers.get("authorization") || "";
    const jwtFromHeader = incomingAuth.startsWith("Bearer ")
      ? incomingAuth
      : req.headers.get("x-wp-jwt")
      ? `Bearer ${req.headers.get("x-wp-jwt")}`
      : "";
    const jwtFromCookie = req.cookies.get("wp_jwt")?.value
      ? `Bearer ${req.cookies.get("wp_jwt")?.value}`
      : "";
    const jwtFromAdminCookie = req.cookies.get("bfb_admin_jwt")?.value
      ? `Bearer ${req.cookies.get("bfb_admin_jwt")?.value}`
      : "";
    const jwtFromUserCookie = req.cookies.get("bfb_user_jwt")?.value
      ? `Bearer ${req.cookies.get("bfb_user_jwt")?.value}`
      : "";
    const jwtFromEnv = process.env.WP_JWT_TOKEN
      ? `Bearer ${process.env.WP_JWT_TOKEN}`
      : "";

    const basicUser = process.env.WC_CONSUMER_KEY;
    const basicPass = process.env.WC_CONSUMER_SECRET;

    let authHeader = "";
    // Пріоритет Bearer, фолбек Basic
    if (jwtFromHeader) authHeader = jwtFromHeader;
    else if (jwtFromAdminCookie) authHeader = jwtFromAdminCookie;
    else if (jwtFromCookie) authHeader = jwtFromCookie;
    else if (jwtFromUserCookie) authHeader = jwtFromUserCookie;
    else if (jwtFromEnv) authHeader = jwtFromEnv;
    else if (basicUser && basicPass)
      authHeader =
        "Basic " + Buffer.from(`${basicUser}:${basicPass}`).toString("base64");
    else
      return NextResponse.json(
        { error: "Missing WC auth (Bearer or Basic)" },
        { status: 500 }
      );

    const upstreamRes = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Authorization: authHeader },
    });

    if (!upstreamRes.ok) {
      return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        headers: {
          "content-type":
            upstreamRes.headers.get("content-type") || "application/json",
        },
      });
    }

    const terms = await upstreamRes.json();

    // WooCommerce API вже повертає ACF дані, але іноді як порожній масив []
    // Нормалізуємо ACF дані: конвертуємо масив в об'єкт для консистентності
    if (Array.isArray(terms)) {
      const normalizedTerms = terms.map((term: any) => ({
        ...term,
        // Якщо acf є масивом або відсутнє, встановлюємо порожній об'єкт
        acf:
          Array.isArray(term.acf) || !term.acf || typeof term.acf !== "object"
            ? {}
            : term.acf,
      }));

      return NextResponse.json(normalizedTerms);
    }

    return NextResponse.json(terms);
  } catch (error) {
    return NextResponse.json(
      { error: "wc product attribute terms error" },
      { status: 500 }
    );
  }
}
