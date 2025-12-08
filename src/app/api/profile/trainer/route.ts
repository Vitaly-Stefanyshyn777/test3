import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    let authHeader = req.headers.get("authorization") || "";
    if (!authHeader) {
      const jwt = process.env.WP_JWT_TOKEN;
      if (!jwt) {
        return NextResponse.json(
          {
            error:
              "Missing Authorization: provide Bearer token or set WP_JWT_TOKEN",
          },
          { status: 401 }
        );
      }
      authHeader = `Bearer ${jwt}`;
    }

    const targetId =
      typeof (body as Record<string, unknown>)?.id !== "undefined"
        ? String((body as Record<string, unknown>).id)
        : "me";
    const url = `${UPSTREAM_BASE}/wp-json/wp/v2/users/${targetId}`;

    const upstreamRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstreamRes.text();
    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("/api/profile/trainer PUT error", error);
    return NextResponse.json(
      { error: "trainer profile update error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  console.log("[PATCH /api/profile/trainer] Request received");
  try {
    // Отримуємо raw текст для обробки некоректних символів
    const rawText = await req.text();

    // Очищаємо некоректні control characters з JSON
    const cleanedText = rawText.replace(/[\x00-\x1F\x7F]/g, (match) => {
      // Екрануємо control characters
      const charCode = match.charCodeAt(0);
      if (charCode === 0x09) return "\\t"; // tab
      if (charCode === 0x0a) return "\\n"; // newline
      if (charCode === 0x0d) return "\\r"; // carriage return
      return ""; // Видаляємо інші control characters
    });

    let body;
    try {
      body = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "[PATCH /api/profile/trainer] JSON parse error:",
        parseError
      );
      console.error(
        "[PATCH /api/profile/trainer] Raw text (first 500 chars):",
        rawText.substring(0, 500)
      );
      return NextResponse.json(
        {
          error: "Invalid JSON format",
          details:
            parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    console.log("[PATCH /api/profile/trainer] Body:", body);

    // Отримуємо токен з заголовка або cookies
    let authHeader = req.headers.get("authorization") || "";

    // Якщо токен не в заголовку, перевіряємо cookies
    if (!authHeader) {
      // Спочатку перевіряємо адмінський токен (для редагування будь-якого користувача)
      const adminToken = req.cookies.get("bfb_admin_jwt")?.value;
      if (adminToken) {
        authHeader = `Bearer ${adminToken}`;
        console.log(
          "[PATCH /api/profile/trainer] Використовуємо адмінський токен з cookie"
        );
      } else {
        // Якщо немає адмінського токена, перевіряємо токен користувача
        const userToken = req.cookies.get("bfb_user_jwt")?.value;
        if (userToken) {
          authHeader = `Bearer ${userToken}`;
          console.log(
            "[PATCH /api/profile/trainer] Використовуємо токен користувача з cookie"
          );
        } else {
          // Якщо немає токена в cookies, використовуємо env токен
          const jwt = process.env.WP_JWT_TOKEN;
          if (!jwt) {
            return NextResponse.json(
              {
                error:
                  "Missing Authorization: provide Bearer token or set WP_JWT_TOKEN",
              },
              { status: 401 }
            );
          }
          authHeader = `Bearer ${jwt}`;
          console.log(
            "[PATCH /api/profile/trainer] Використовуємо токен з env"
          );
        }
      }
    }

    // WordPress API: користувач завжди редагує свій профіль, тому використовуємо "me"
    // Це дозволяє WordPress автоматично визначити користувача з токена
    // Якщо потрібно редагувати іншого користувача (як адмін), можна використати ID,
    // але для цього потрібен адмінський токен
    const bodyId = (body as Record<string, unknown>)?.id;
    const hasAdminToken = !!req.cookies.get("bfb_admin_jwt")?.value;

    let targetId: string;

    // Якщо є адмінський токен і передано ID, використовуємо ID
    // Інакше завжди використовуємо "me" (користувач редагує свій профіль)
    if (hasAdminToken && bodyId !== undefined) {
      const idStr = String(bodyId);
      if (!isNaN(Number(idStr)) && idStr.trim() !== "") {
        targetId = idStr;
        console.log(
          `[PATCH /api/profile/trainer] Адмін редагує користувача з ID: ${targetId}`
        );
      } else {
        console.error(
          `[PATCH /api/profile/trainer] Отримано slug замість числового ID: "${idStr}"`
        );
        return NextResponse.json(
          {
            error:
              "ID має бути числом, а не slug. Отримайте числовий ID з профілю перед відправкою.",
            receivedId: idStr,
          },
          { status: 400 }
        );
      }
    } else {
      // Звичайний користувач завжди редагує свій профіль через "me"
      targetId = "me";
      console.log(
        `[PATCH /api/profile/trainer] Використовуємо "me" для редагування власного профілю`
      );
    }

    const url = `${UPSTREAM_BASE}/wp-json/wp/v2/users/${targetId}`;
    console.log(`[PATCH /api/profile/trainer] Target URL: ${url}`);
    console.log(`[PATCH /api/profile/trainer] UPSTREAM_BASE: ${UPSTREAM_BASE}`);
    console.log(`[PATCH /api/profile/trainer] targetId: ${targetId}`);

    const upstreamRes = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    console.log(
      `[PATCH /api/profile/trainer] WordPress response status: ${upstreamRes.status}`
    );
    const text = await upstreamRes.text();
    console.log(
      `[PATCH /api/profile/trainer] WordPress response (first 200 chars): ${text.substring(
        0,
        200
      )}`
    );

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("/api/profile/trainer PATCH error", error);
    return NextResponse.json(
      { error: "trainer profile update error" },
      { status: 500 }
    );
  }
}
