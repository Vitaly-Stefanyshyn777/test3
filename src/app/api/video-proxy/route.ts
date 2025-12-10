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
    // Витягуємо кореневий домен для порівняння (наприклад, bfb.projection-learn.website)
    const getRootDomain = (hostname: string): string => {
      const parts = hostname.split('.');
      // Якщо домен має більше 2 частин, беремо останні 2-3 частини
      if (parts.length > 2) {
        // Для доменів типу www.api.bfb.projection-learn.website беремо bfb.projection-learn.website
        return parts.slice(-3).join('.');
      }
      return hostname;
    };

    const baseRootDomain = baseHostname ? getRootDomain(baseHostname) : '';
    const videoRootDomain = getRootDomain(videoHostname);

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
        baseHostname.endsWith(`.${videoHostname}`) ||
        // Додаємо перевірку кореневого домену
        (baseRootDomain && videoRootDomain === baseRootDomain) ||
        videoHostname.includes(baseRootDomain) ||
        baseHostname.includes(videoRootDomain));

    const isAllowed = startsWithAllowed || hostnameMatches;

    if (!isAllowed) {
      console.error("[video-proxy] Недопустимий URL:", {
        videoUrl,
        videoHostname,
        baseHostname,
        baseRootDomain,
        videoRootDomain,
        startsWithAllowed,
        hostnameMatches,
      });
      return NextResponse.json(
        { 
          error: "Недопустимий URL",
          details: {
            videoHostname,
            baseHostname,
            baseRootDomain,
            videoRootDomain,
          }
        }, 
        { status: 400 }
      );
    }

    // Валідація URL - перевіряємо, чи URL не обрізаний
    if (!videoUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i)) {
      console.error("[video-proxy] Обрізаний або невалідний URL відео:", videoUrl);
      return NextResponse.json(
        { 
          error: "Недопустимий формат URL відео (відсутнє розширення файлу)",
          videoUrl
        },
        { status: 400 }
      );
    }

    // Завантажуємо відео з оригінального сервера
    let response: Response;
    try {
      response = await fetch(videoUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VideoProxy/1.0)",
        },
      });
    } catch (fetchError) {
      console.error("[video-proxy] Помилка fetch:", fetchError);
      return NextResponse.json(
        { 
          error: "Не вдалося завантажити відео",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error"
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("[video-proxy] Помилка відповіді:", {
        status: response.status,
        statusText: response.statusText,
        videoUrl,
      });
      return NextResponse.json(
        { 
          error: `Не вдалося завантажити відео: ${response.status}`,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    // Отримуємо тип контенту
    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");
    
    // Перевіряємо, чи це дійсно відео
    if (!contentType.startsWith("video/")) {
      console.error("[video-proxy] Невалідний тип контенту:", contentType);
      return NextResponse.json(
        { 
          error: "Отримано невідео контент",
          contentType
        },
        { status: 400 }
      );
    }

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
