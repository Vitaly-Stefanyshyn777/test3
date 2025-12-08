/**
 * Нормалізує URL зображення, обробляючи випадки, коли воно може бути:
 * - рядком-масивом (JSON): "["https://..."]"
 * - масивом рядків: ["https://..."]
 * - масивом об'єктів: [{src: "https://..."}]
 * - звичайним рядком: "https://..."
 */
export function normalizeImageUrl(
  image: string | string[] | Array<{ src: string }> | undefined | null
): string {
  // Якщо немає зображення
  if (!image) {
    return "/placeholder.svg";
  }

  // Якщо це масив
  if (Array.isArray(image)) {
    if (image.length === 0) {
      return "/placeholder.svg";
    }
    const first = image[0];
    // Якщо елемент масиву - об'єкт з src
    if (typeof first === "object" && first !== null && "src" in first) {
      return normalizeImageUrl((first as { src: string }).src);
    }
    // Якщо елемент масиву - рядок
    if (typeof first === "string") {
      return normalizeImageUrl(first);
    }
    return "/placeholder.svg";
  }

  // Якщо це рядок
  if (typeof image === "string") {
    const trimmed = image.trim();
    
    // Якщо порожній рядок
    if (trimmed === "") {
      return "/placeholder.svg";
    }

    // Перевіряємо, чи це JSON-масив
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          // Може бути вкладений масив
          if (typeof first === "string" && first.trim().startsWith("[")) {
            return normalizeImageUrl(first);
          }
          // Якщо об'єкт з src
          if (typeof first === "object" && first !== null && "src" in first) {
            return normalizeImageUrl((first as { src: string }).src);
          }
          // Якщо звичайний рядок
          if (typeof first === "string") {
            return first;
          }
        }
        return "/placeholder.svg";
      } catch {
        // Якщо не вдалося розпарсити, повертаємо placeholder
        return "/placeholder.svg";
      }
    }

    // Перевіряємо, чи це валідний URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
      return trimmed;
    }

    // Якщо не валідний URL, повертаємо placeholder
    return "/placeholder.svg";
  }

  return "/placeholder.svg";
}

/**
 * Перевіряє, чи зображення є локальним (з папки public)
 * Локальні зображення потребують unoptimized prop на Vercel
 */
export function isLocalImage(src: string): boolean {
  if (!src) return false;
  // Локальні зображення починаються з / і не є повними URL
  return src.startsWith("/") && !src.startsWith("//");
}




