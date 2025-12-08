import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function GET(req: NextRequest) {
  try {
    // 1) Отримуємо користувацький JWT із Authorization або cookie bfb_user_jwt
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const userJwt = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : req.cookies.get("bfb_user_jwt")?.value;
    if (!userJwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Дістаємо власний userId
    const meRes = await fetch(
      `${UPSTREAM_BASE}/wp-json/wp/v2/users/me?context=edit`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${userJwt}` },
        cache: "no-store",
      }
    );
    if (!meRes.ok) {
      const text = await meRes.text();
      return NextResponse.json(
        { error: "me fetch failed", status: meRes.status, details: text },
        { status: 502 }
      );
    }
    const me = (await meRes.json()) as { id?: number };
    const userId = me?.id;
    if (!userId) {
      return NextResponse.json({ error: "No user id" }, { status: 502 });
    }

    // 3) Отримуємо адмінський JWT через env (якщо доступні) або повертаємо 500
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;
    if (!adminUser || !adminPass) {
      return NextResponse.json(
        { error: "Missing ADMIN_USER/ADMIN_PASS" },
        { status: 500 }
      );
    }

    const tokenRes = await fetch(`${UPSTREAM_BASE}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: adminUser, password: adminPass }),
      cache: "no-store",
    });
    const tokenJson = await tokenRes.json();
    const adminJwt: string | undefined =
      tokenJson?.token || tokenJson?.data?.token;
    if (!tokenRes.ok || !adminJwt) {
      return NextResponse.json(
        {
          error: "Admin auth failed",
          status: tokenRes.status,
          details: tokenJson,
        },
        { status: 502 }
      );
    }

    // 4) Отримуємо повний профіль користувача як адмін і повертаємо лише аватар-мету
    const userRes = await fetch(
      `${UPSTREAM_BASE}/wp-json/wp/v2/users/${encodeURIComponent(
        String(userId)
      )}?context=edit`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${adminJwt}` },
        cache: "no-store",
      }
    );
    const bodyText = await userRes.text();
    if (!userRes.ok) {
      return NextResponse.json(
        {
          error: "Admin user fetch failed",
          status: userRes.status,
          details: bodyText,
        },
        { status: 502 }
      );
    }
    try {
      const data = JSON.parse(bodyText) as {
        id?: number;
        meta?: Record<string, unknown>;
      };
      const meta = data?.meta || {};
      const avatar = (meta as { img_link_data_avatar?: string })
        ?.img_link_data_avatar;
      return NextResponse.json({ id: data?.id, avatar });
    } catch {
      return NextResponse.json(
        { error: "Bad JSON", details: bodyText },
        { status: 502 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "avatar route error",
        details: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}

// DELETE: clear user's avatar (both top-level and meta) using admin privileges
export async function DELETE(req: NextRequest) {
  try {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const userJwt = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : req.cookies.get("bfb_user_jwt")?.value;
    if (!userJwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // resolve current user id from their JWT
    const meRes = await fetch(
      `${UPSTREAM_BASE}/wp-json/wp/v2/users/me?context=edit`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${userJwt}` },
        cache: "no-store",
      }
    );
    if (!meRes.ok) {
      return NextResponse.json(
        {
          error: "me fetch failed",
          status: meRes.status,
          details: await meRes.text(),
        },
        { status: 502 }
      );
    }
    const me = (await meRes.json()) as { id?: number };
    const userId = me?.id;
    if (!userId)
      return NextResponse.json({ error: "No user id" }, { status: 502 });

    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;
    if (!adminUser || !adminPass) {
      return NextResponse.json(
        { error: "Missing ADMIN_USER/ADMIN_PASS" },
        { status: 500 }
      );
    }

    const tokenRes = await fetch(`${UPSTREAM_BASE}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: adminUser, password: adminPass }),
      cache: "no-store",
    });
    const tokenJson = await tokenRes.json();
    const adminJwt: string | undefined =
      tokenJson?.token || tokenJson?.data?.token;
    if (!tokenRes.ok || !adminJwt) {
      return NextResponse.json(
        {
          error: "Admin auth failed",
          status: tokenRes.status,
          details: tokenJson,
        },
        { status: 502 }
      );
    }

    // clear both top-level and meta avatar fields
    const payload = {
      img_link_data_avatar: null,
      avatar: "",
      meta: { img_link_data_avatar: null },
    };
    const putRes = await fetch(
      `${UPSTREAM_BASE}/wp-json/wp/v2/users/${encodeURIComponent(
        String(userId)
      )}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
    const putText = await putRes.text();
    if (!putRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to clear avatar",
          status: putRes.status,
          details: putText,
        },
        { status: 502 }
      );
    }

    // Some WP setups ignore null for custom fields; try empty string as fallback
    const payloadEmpty = {
      img_link_data_avatar: "",
      avatar: "",
      meta: { img_link_data_avatar: "" },
    };
    await fetch(
      `${UPSTREAM_BASE}/wp-json/wp/v2/users/${encodeURIComponent(
        String(userId)
      )}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadEmpty),
        cache: "no-store",
      }
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "avatar delete route error",
        details: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
