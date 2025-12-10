import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json(
        { error: "URL параметр не надано" },
        { status: 400 }
      );
    }

    // Декодуємо URL, якщо він був закодований
    try {
      videoUrl = decodeURIComponent(videoUrl);
    } catch {
      // Якщо декодування не вдалося, використовуємо оригінальний URL
    }

    // Базова валідація URL (перевіряємо тільки формат, без перевірки доменів)
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { error: "Недопустимий формат URL" },
        { status: 400 }
      );
    }

    // Валідація URL - перевіряємо, чи URL не обрізаний (але не блокуємо, якщо це може бути валідний URL)
    // Прибираємо строгу валідацію, щоб не блокувати валідні URL, які можуть не мати розширення в кінці

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
          details:
            fetchError instanceof Error ? fetchError.message : "Unknown error",
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
