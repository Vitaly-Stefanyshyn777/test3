import { NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function GET() {
  try {
    const normalize = (v?: string) => (v || "").replace(/^['"]|['"]$/g, "");
    const username = normalize(process.env.ADMIN_USER);
    const password = normalize(process.env.ADMIN_PASS);

    let freshToken: string | undefined;
    if (username && password) {
      const tokenRes = await fetch(
        `${UPSTREAM_BASE}/wp-json/jwt-auth/v1/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          cache: "no-store",
        }
      );

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        freshToken = tokenData?.token;
      }
    }

    const targetUrl = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/banner`);
    targetUrl.searchParams.set("_", Date.now().toString());

    const headers: Record<string, string> = {};

    if (freshToken) {
      headers["Authorization"] = `Bearer ${freshToken}`;
    }

    const upstreamRes = await fetch(targetUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      return NextResponse.json(
        { error: `Request failed ${upstreamRes.status}`, details: errorText },
        { status: upstreamRes.status }
      );
    }

    const data = await upstreamRes.json();
    const response = NextResponse.json(data);
    if (freshToken) {
      const isProd = process.env.NODE_ENV === "production";
      response.cookies.set("bfb_admin_jwt", freshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12,
      });
    }

    return response;
  } catch (error) {
    console.error("/api/banners error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch banners",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
