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

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const isCheck = searchParams.get("check") === "true";

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

    let endpoint = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_wish_list`;
    if (isCheck && productId) {
      endpoint = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_wish_list/check/${productId}`;
    } else if (userId && !isCheck) {
      endpoint += `?user_id=${userId}`;
    }


    if (tokenToValidate && userId) {
      try {
        await fetch(`${UPSTREAM_BASE}/wp-json/wp/v2/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenToValidate}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
      } catch (sessionError) {
      }
    }

    const response = await fetch(endpoint, {
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
      { error: "Wishlist API error", details: error instanceof Error ? error.message : "Unknown error" },
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
    const { action, product_id } = body;
    const token = getAuthToken(req);
    const headers = buildHeaders(token);
    const tokenToValidate = token?.replace(/^Bearer\s+/i, "") || "";
    const userId = tokenToValidate ? await getUserIdFromToken(tokenToValidate) : null;

    if (userId) {
      headers["X-User-ID"] = String(userId);
      if (body && typeof body === "object") {
        body.user_id = userId;
      }
    }

    let wishlistUrl: string;
    let method = "POST";

    // Якщо action=remove, то це видалення товару
    if (action === "remove" && product_id) {
      wishlistUrl = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_wish_list/${product_id}`;
      if (userId) {
        wishlistUrl += `${wishlistUrl.includes("?") ? "&" : "?"}user_id=${userId}`;
      }
      method = "DELETE";

      // Створюємо новий body без action і product_id для upstream
      const cleanBody = { ...body };
      delete cleanBody.action;
      delete cleanBody.product_id;

      const response = await fetch(wishlistUrl, {
        method,
        headers,
        body: Object.keys(cleanBody).length > 0 ? JSON.stringify(cleanBody) : undefined,
        cache: "no-store",
      });

      const data = await response.text();

      return new NextResponse(data, {
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") || "application/json",
        },
      });
    }

    // Звичайне додавання в wishlist
    wishlistUrl = `${UPSTREAM_BASE}/wp-json/wp/v2/sl_wish_list${userId ? `?user_id=${userId}` : ""}`;


    const response = await fetch(wishlistUrl, {
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
      { error: "Wishlist API error", details: error instanceof Error ? error.message : "Unknown error" },
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
    const productId = searchParams.get("product_id");
    const isClear = searchParams.get("clear") === "true";

    const token = getAuthToken(req);
    const headers = buildHeaders(token);
    const tokenToValidate = token?.replace(/^Bearer\s+/i, "") || "";
    const userId = tokenToValidate ? await getUserIdFromToken(tokenToValidate) : null;

    if (userId) {
      headers["X-User-ID"] = String(userId);
    }

    let endpoint = isClear
      ? `${UPSTREAM_BASE}/wp-json/wp/v2/sl_wish_list/clear`
      : `${UPSTREAM_BASE}/wp-json/wp/v2/sl_wish_list/${productId}`;

    if (userId) {
      endpoint += `${endpoint.includes("?") ? "&" : "?"}user_id=${userId}`;
    }

    const response = await fetch(endpoint, {
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
      { error: "Wishlist API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
