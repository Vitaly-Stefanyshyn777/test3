import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let videoUrl = searchParams.get("url");

    console.log("[video-proxy] Request received:", {
      hasUrl: !!videoUrl,
      urlLength: videoUrl?.length,
      urlPreview: videoUrl ? videoUrl.substring(0, 100) : null,
    });

    if (!videoUrl) {
      console.error("[video-proxy] URL parameter missing");
      return NextResponse.json(
        { error: "URL параметр не надано" },
        { status: 400 }
      );
    }

    // Декодуємо URL, якщо він був закодований (може бути двічі закодований через encodeURIComponent)
    let decodedUrl = videoUrl;
    let decodeAttempts = 0;
    const maxDecodeAttempts = 3;

    while (decodeAttempts < maxDecodeAttempts) {
      try {
        const testDecode = decodeURIComponent(decodedUrl);
        if (testDecode === decodedUrl) {
          // URL вже не закодований
          break;
        }
        decodedUrl = testDecode;
        decodeAttempts++;
        console.log(`[video-proxy] URL decoded (attempt ${decodeAttempts}):`, {
          before: videoUrl.substring(0, 100),
          after: decodedUrl.substring(0, 100),
        });
      } catch (error) {
        console.warn(
          `[video-proxy] Failed to decode URL (attempt ${decodeAttempts}):`,
          error
        );
        break;
      }
    }

    videoUrl = decodedUrl;
    console.log("[video-proxy] Final decoded URL:", {
      url: videoUrl.substring(0, 150),
      decodeAttempts,
      hasCyrillic: /[а-яА-ЯіІїЇєЄ]/.test(videoUrl),
    });

    // Базова валідація URL (перевіряємо тільки формат, без перевірки доменів)
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(videoUrl);
      console.log("[video-proxy] URL validated:", {
        hostname: validatedUrl.hostname,
        pathname: validatedUrl.pathname.substring(0, 100),
        protocol: validatedUrl.protocol,
      });
    } catch (error) {
      console.error("[video-proxy] Invalid URL format:", {
        videoUrl: videoUrl.substring(0, 100),
        error,
      });
      return NextResponse.json(
        { error: "Недопустимий формат URL" },
        { status: 400 }
      );
    }

    // Валідація URL - перевіряємо, чи URL не обрізаний (але не блокуємо, якщо це може бути валідний URL)
    // Прибираємо строгу валідацію, щоб не блокувати валідні URL, які можуть не мати розширення в кінці

    // Завантажуємо відео з оригінального сервера
    console.log("[video-proxy] Fetching video from:", videoUrl);
    let response: Response;
    try {
      // Збільшуємо таймаут для великих відео файлів (230MB+)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 хвилин

      response = await fetch(videoUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VideoProxy/1.0)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[video-proxy] Fetch response:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
        ok: response.ok,
      });
    } catch (fetchError) {
      console.error("[video-proxy] Fetch error:", {
        error: fetchError,
        message:
          fetchError instanceof Error ? fetchError.message : "Unknown error",
        videoUrl: videoUrl.substring(0, 100),
      });
      return NextResponse.json(
        {
          error: "Не вдалося завантажити відео",
          details:
            fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("[video-proxy] Response error:", {
        status: response.status,
        statusText: response.statusText,
        videoUrl: videoUrl.substring(0, 100),
        headers: Object.fromEntries(response.headers.entries()),
      });
      return NextResponse.json(
        {
          error: `Не вдалося завантажити відео: ${response.status}`,
          statusText: response.statusText,
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
          contentType,
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
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
        "Access-Control-Expose-Headers":
          "Content-Length, Content-Range, Accept-Ranges",
        "Access-Control-Max-Age": "86400",
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
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Access-Control-Expose-Headers":
        "Content-Length, Content-Range, Accept-Ranges",
      "Access-Control-Max-Age": "86400",
    },
  });
}
