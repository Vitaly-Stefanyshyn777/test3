import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const incomingAuthHeader = request.headers.get("authorization") || "";
    const jwtFromHeader = incomingAuthHeader.startsWith("Bearer ")
      ? incomingAuthHeader.substring("Bearer ".length)
      : request.headers.get("x-wp-jwt") || "";
    const jwtFromCookie = request.cookies.get("bfb_user_jwt")?.value || "";
    const adminCookie = request.cookies.get("bfb_admin_jwt")?.value || "";
    const jwtFromEnv = process.env.WP_JWT_TOKEN || "";

    const normalize = (v?: string) => (v || "").replace(/^['"]|['"]$/g, "");
    const wpUser =
      process.env.WP_BASIC_USER || normalize(process.env.ADMIN_USER);
    const wpPass =
      process.env.WP_BASIC_PASS || normalize(process.env.ADMIN_PASS);

    if (!wpUser || !wpPass) {
      return NextResponse.json(
        { error: "WordPress credentials not configured" },
        { status: 500 }
      );
    }

    const url = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/users`);

    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    if (!url.searchParams.has("per_page")) {
      url.searchParams.set("per_page", "100");
    }

    if (!url.searchParams.has("roles")) {
      url.searchParams.set("roles", "bfb_coach");
    }

    const wantsAdmin =
      request.headers.get("x-internal-admin") === "1" ||
      request.headers.get("X-Internal-Admin") === "1";

    let bearerToken =
      adminCookie || jwtFromHeader || jwtFromCookie || jwtFromEnv;

    let shouldSetAdminCookie = false;

    if (!bearerToken) {
      const upstreamBase = UPSTREAM_BASE;
      const username = process.env.ADMIN_USER;
      const password = process.env.ADMIN_PASS;

      if (username && password && upstreamBase) {
        try {
          const wpRes = await fetch(
            `${upstreamBase}/wp-json/jwt-auth/v1/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
              cache: "no-store",
            }
          );
          if (wpRes.ok) {
            const data = await wpRes.json();
            if (data?.token) {
              bearerToken = data.token as string;
              shouldSetAdminCookie = true;
            }
          }
        } catch {}
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    } else if (wpUser && wpPass) {
      headers.Authorization = `Basic ${Buffer.from(
        `${wpUser}:${wpPass}`
      ).toString("base64")}`;
    }

    let response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    // Auto-relogin and retry once on 401/403
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      try {
        const upstreamBase = process.env.UPSTREAM_BASE;
        const username = normalize(process.env.ADMIN_USER);
        const password = normalize(process.env.ADMIN_PASS);
        if (username && password && upstreamBase) {
          const wpRes = await fetch(
            `${upstreamBase}/wp-json/jwt-auth/v1/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
              cache: "no-store",
            }
          );
          if (wpRes.ok) {
            const data = await wpRes.json();
            if (data?.token) {
              headers.Authorization = `Bearer ${data.token as string}`;
              shouldSetAdminCookie = true;
              response = await fetch(url.toString(), {
                method: "GET",
                headers,
              });
            }
          }
          // If still forbidden, force Basic with ADMIN creds
          if (
            !response.ok &&
            (response.status === 401 || response.status === 403)
          ) {
            const basic = Buffer.from(`${username}:${password}`).toString(
              "base64"
            );
            const basicHeaders = {
              ...headers,
              Authorization: `Basic ${basic}`,
            };
            response = await fetch(url.toString(), {
              method: "GET",
              headers: basicHeaders,
            });
          }
        }
      } catch {}
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `WordPress API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Детальна перевірка координат у всіх тренерів
    if (Array.isArray(data) && data.length > 0) {
      let trainersWithCoords = 0;
      let trainersWithoutCoords = 0;

      data.forEach((trainer) => {
        const wloc = trainer.my_wlocation || [];
        if (wloc.length > 0) {
          let hasCoords = false;
          wloc.forEach((loc: unknown) => {
            const location = loc as Record<string, unknown>;
            const lat =
              location?.hl_input_text_coord_lat ||
              location?.coord_lat ||
              location?.latitude ||
              location?.lat;
            const lng =
              location?.hl_input_text_coord_ln ||
              location?.coord_lng ||
              location?.longitude ||
              location?.lng;

            if (lat && lng) {
              hasCoords = true;
            }
          });

          if (hasCoords) {
            trainersWithCoords++;
          } else {
            trainersWithoutCoords++;
          }
        } else {
          trainersWithoutCoords++;
        }
      });
    }

    const res = NextResponse.json(data);
    if (shouldSetAdminCookie && bearerToken) {
      const isProd = process.env.NODE_ENV === "production";
      res.cookies.set("bfb_admin_jwt", bearerToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 60 * 60 * 12,
      });
    }
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
