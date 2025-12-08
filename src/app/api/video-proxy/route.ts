import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json(
        { error: "URL параметр не надано" },
        { status: 400 }
      );
    }

    // Перевіряємо, чи URL належить до дозволених доменів (whitelist)
    const upstreamBase =
      process.env.UPSTREAM_BASE || process.env.NEXT_PUBLIC_UPSTREAM_BASE;
    if (!upstreamBase) {
      return NextResponse.json(
        { error: "UPSTREAM_BASE is not configured" },
        { status: 500 }
      );
    }

    // Нормалізуємо upstreamBase (прибираємо trailing slash)
    const normalizedBase = upstreamBase.endsWith("/")
      ? upstreamBase.slice(0, -1)
      : upstreamBase;

    // Витягуємо домен з upstreamBase для більш гнучкої перевірки
    let baseHostname = "";
    try {
      const baseUrl = new URL(normalizedBase);
      baseHostname = baseUrl.hostname;
    } catch {
      // Якщо не вдалося розпарсити, використовуємо як є
    }

    // Перевіряємо hostname URL відео
    let videoHostname = "";
    try {
      const videoUrlObj = new URL(videoUrl);
      videoHostname = videoUrlObj.hostname;
    } catch {
      return NextResponse.json(
        { error: "Недопустимий формат URL" },
        { status: 400 }
      );
    }

    // Перевіряємо, чи URL належить до дозволених доменів
    const allowedOrigins = [
      normalizedBase,
      `${normalizedBase}/`,
      // Додаємо dev-відео для тестування плеєра
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/",
    ];

    // Перевіряємо, чи URL починається з дозволеного домену
    const startsWithAllowed = allowedOrigins.some((origin) =>
      videoUrl.startsWith(origin)
    );

    // Перевіряємо, чи hostname відповідає базовому домену або його варіантам
    const hostnameMatches =
      baseHostname &&
      (videoHostname === baseHostname ||
        videoHostname === `www.${baseHostname}` ||
        videoHostname === `api.${baseHostname}` ||
        videoHostname === `www.api.${baseHostname}` ||
        baseHostname === `www.${videoHostname}` ||
        baseHostname === `api.${videoHostname}` ||
        baseHostname === `www.api.${videoHostname}` ||
        videoHostname.endsWith(`.${baseHostname}`) ||
        baseHostname.endsWith(`.${videoHostname}`));

    const isAllowed = startsWithAllowed || hostnameMatches;

    if (!isAllowed) {
      return NextResponse.json({ error: "Недопустимий URL" }, { status: 400 });
    }

    // Завантажуємо відео з оригінального сервера
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VideoProxy/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Не вдалося завантажити відео: ${response.status}` },
        { status: response.status }
      );
    }

    // Отримуємо тип контенту
    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");

    // Створюємо новий response з відео даними
    const videoBuffer = await response.arrayBuffer();

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": contentLength || videoBuffer.byteLength.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600", // Кешуємо на годину
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Range",
      },
    });
  } catch (error) {
    console.error("Помилка проксі відео:", error);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}

// Обробляємо OPTIONS запити для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
    },
  });
}
