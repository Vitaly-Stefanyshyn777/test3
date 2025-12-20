import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    const response = await fetch(`${UPSTREAM_BASE}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const userData = await response.json();
      return userData?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  const userCookie = req.cookies.get("bfb_user_jwt")?.value;
  return auth || userCookie || null;
}

function buildHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  return headers;
}

export async function GET(req: NextRequest) {
  try {
    if (!UPSTREAM_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const headers = buildHeaders(token);
    const tokenToValidate = token.replace(/^Bearer\s+/i, "");
    const userId = await getUserIdFromToken(tokenToValidate);

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    const cartUrl = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart${userId ? `?user_id=${userId}` : ""}`;

    const response = await fetch(cartUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!UPSTREAM_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = await req.json();
    const token = getAuthToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No user authentication token provided" },
        { status: 401 }
      );
    }

    const headers = buildHeaders(token);
    const tokenToValidate = token.replace(/^Bearer\s+/i, "");
    const userId = await getUserIdFromToken(tokenToValidate);

    if (userId) {
      headers["X-User-ID"] = String(userId);
      if (body && typeof body === "object") {
        body.user_id = userId;
      }
    }

    const cartUrl = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart${userId ? `?user_id=${userId}` : ""}`;

    const response = await fetch(cartUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!UPSTREAM_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemKey = searchParams.get("cart_item_key");

    if (!cartItemKey) {
      return NextResponse.json({ error: "Missing cart_item_key parameter" }, { status: 400 });
    }

    const body = await req.json();
    const token = getAuthToken(req);
    const headers = buildHeaders(token);
    const tokenToValidate = token?.replace(/^Bearer\s+/i, "") || "";
    const userId = tokenToValidate ? await getUserIdFromToken(tokenToValidate) : null;

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    const cartUrl = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart/${cartItemKey}${userId ? `?user_id=${userId}` : ""}`;

    const response = await fetch(cartUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!UPSTREAM_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemKey = searchParams.get("cart_item_key");
    const isClear = searchParams.get("clear") === "true";

    const token = getAuthToken(req);
    const headers = buildHeaders(token);
    const tokenToValidate = token?.replace(/^Bearer\s+/i, "") || "";
    const userId = tokenToValidate ? await getUserIdFromToken(tokenToValidate) : null;

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    const endpoint = isClear
      ? `${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart/clear`
      : `${UPSTREAM_BASE}/wp-json/wp/v2/sl_cart/${cartItemKey}`;

    const finalUrl = userId ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}user_id=${userId}` : endpoint;

    const response = await fetch(finalUrl, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
