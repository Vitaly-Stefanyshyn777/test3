import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE as string;

export async function GET(request: NextRequest) {
  try {
    // Витягуємо можливий Bearer із заголовків або з env
    const incomingAuthHeader = request.headers.get("authorization") || "";
    const jwtFromHeader = incomingAuthHeader.startsWith("Bearer ")
      ? incomingAuthHeader.substring("Bearer ".length)
      : request.headers.get("x-wp-jwt") || "";
    const jwtFromEnv = process.env.WP_JWT_TOKEN || "";

    // Отримуємо WordPress базові креденшалі (fallback)
    const wpUser = process.env.WP_BASIC_USER || process.env.ADMIN_USER;
    const wpPass = process.env.WP_BASIC_PASS || process.env.ADMIN_PASS;

    if (!wpUser || !wpPass) {
      return NextResponse.json(
        { error: "WordPress credentials not configured" },
        { status: 500 }
      );
    }

    // Формуємо URL для WordPress Theme Settings API з параметром hl_data_gallery
    const url = new URL(`${UPSTREAM_BASE}/wp-json/wp/v2/theme_settings`);
    url.searchParams.set("hl_data_gallery", "1");
    

    // Визначаємо режим авторизації: Bearer (пріоритет) або Basic
    const bearerToken = jwtFromHeader || jwtFromEnv;
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


    // Робимо запит з WordPress авторизацією
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Theme Settings API] ❌ Помилка WordPress API:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `WordPress API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
