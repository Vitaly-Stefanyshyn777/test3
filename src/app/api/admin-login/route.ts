import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  try {
    const normalize = (v?: string) => (v || "").replace(/^['"]|['"]$/g, "");
    const username = normalize(process.env.ADMIN_USER);
    const password = normalize(process.env.ADMIN_PASS);
    const upstreamBase = process.env.UPSTREAM_BASE;

    if (!username || !password || !upstreamBase) {
      return NextResponse.json(
        {
          error: "Missing env",
          details: {
            hasUser: !!username,
            passLen: password?.length || 0,
            hasBase: !!upstreamBase,
          },
        },
        { status: 500 }
      );
    }

    const res = await fetch(`${upstreamBase}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data?.token) {
      return NextResponse.json(
        { error: "WP auth failed", status: res.status, details: data },
        { status: res.status || 500 }
      );
    }

    const response = NextResponse.json({ ok: true });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("bfb_admin_jwt", data.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "admin-login error" }, { status: 500 });
  }
}
