import { ThemeSettingsPost } from "./bfbApi";

/**
 * Конвертує SVG атрибути з kebab-case в camelCase для React
 * Наприклад: stroke-width -> strokeWidth, fill-rule -> fillRule, clip-path -> clipPath
 */
export function convertSvgAttributesToCamelCase(svgString: string): string {
  if (!svgString) return svgString;
  
  // Список відомих SVG атрибутів, які потрібно конвертувати
  const attributeMap: Record<string, string> = {
    "stroke-width": "strokeWidth",
    "fill-rule": "fillRule",
    "clip-path": "clipPath",
    "clip-rule": "clipRule",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-miterlimit": "strokeMiterlimit",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "font-family": "fontFamily",
    "font-size": "fontSize",
    "font-weight": "fontWeight",
    "font-style": "fontStyle",
    "text-anchor": "textAnchor",
    "dominant-baseline": "dominantBaseline",
    "letter-spacing": "letterSpacing",
    "word-spacing": "wordSpacing",
    "text-decoration": "textDecoration",
    "xmlns:xlink": "xmlnsXlink",
    "xlink:href": "xlinkHref",
    "xlink:title": "xlinkTitle",
  };
  
  let result = svgString;
  
  // Замінюємо всі відомі атрибути
  for (const [kebabCase, camelCase] of Object.entries(attributeMap)) {
    // Замінюємо в атрибутах тегів (наприклад: stroke-width="2")
    const regex = new RegExp(`(${kebabCase})(\\s*=\\s*["'])`, "gi");
    result = result.replace(regex, (match, attr, equals) => {
      return camelCase + equals;
    });
  }
  
  // Також обробляємо загальний випадок для будь-яких kebab-case атрибутів
  result = result.replace(
    /(\w+)-(\w+)(\s*=\s*["'])/g,
    (match, p1, p2, p3) => {
      // Перевіряємо, чи це не вже оброблено
      const kebabAttr = `${p1}-${p2}`;
      if (attributeMap[kebabAttr]) {
        return match; // Вже оброблено вище
      }
      // Конвертуємо kebab-case в camelCase
      return p1 + p2.charAt(0).toUpperCase() + p2.slice(1) + p3;
    }
  );
  
  return result;
}

/**
 * Парсить графік роботи з input_text_schedule
 * Формат: "понеділок - пятниця: 09:00 - 22:00, \r\nсубота - неділя: 10:00 - 20:00"
 */
export function parseSchedule(schedule?: string | null): {
  weekdays: string;
  weekends: string;
} {
  if (!schedule) {
    return { weekdays: "", weekends: "" };
  }

  // Розділяємо по комі або \r\n
  const parts = schedule.split(/,\s*\r?\n?/).map((p) => p.trim());

  let weekdays = "";
  let weekends = "";

  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    if (
      lowerPart.includes("понеділок") ||
      lowerPart.includes("пятниця") ||
      lowerPart.includes("будні") ||
      lowerPart.includes("пн") ||
      lowerPart.includes("пт")
    ) {
      // Витягуємо час (формат HH:MM - HH:MM)
      const timeMatch = part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        weekdays = `${timeMatch[1]} - ${timeMatch[2]}`;
      }
    } else if (
      lowerPart.includes("субота") ||
      lowerPart.includes("неділя") ||
      lowerPart.includes("вихідні") ||
      lowerPart.includes("сб") ||
      lowerPart.includes("нд")
    ) {
      const timeMatch = part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        weekends = `${timeMatch[1]} - ${timeMatch[2]}`;
      }
    }
  }

  return { weekdays, weekends };
}

/**
 * Отримує контактні дані з theme_settings
 */
export function getContactData(
  themeSettings: ThemeSettingsPost | ThemeSettingsPost[] | undefined
): {
  phone: string;
  email: string;
  address: string;
  schedule: string;
  weekdays: string;
  weekends: string;
  socialLinks: Array<{
    name: string;
    link: string;
    icon?: string;
  }>;
} {
  // Нормалізуємо до одного об'єкта
  const settings: ThemeSettingsPost =
    Array.isArray(themeSettings) && themeSettings.length > 0
      ? themeSettings[0]
      : (themeSettings as ThemeSettingsPost) || ({} as ThemeSettingsPost);

  // Перевіряємо чи дані на верхньому рівні або в acf
  const phone =
    settings.input_text_phone ||
    settings.acf?.input_text_phone ||
    "";
  const email =
    settings.input_text_email ||
    settings.acf?.input_text_email ||
    "";
  const address =
    settings.input_text_address ||
    settings.acf?.input_text_address ||
    "";
  const schedule =
    settings.input_text_schedule ||
    settings.acf?.input_text_schedule ||
    "";

  const { weekdays, weekends } = parseSchedule(schedule);

  // Обробляємо соціальні мережі
  const socialContacts =
    settings.hl_data_contact || settings.acf?.hl_data_contact || [];
  const socialLinks = socialContacts
    .map((contact) => ({
      name: contact.hl_input_text_name || "",
      link: contact.hl_input_text_link || "",
      icon: contact.hl_img_svg_icon
        ? convertSvgAttributesToCamelCase(contact.hl_img_svg_icon)
        : undefined,
    }))
    .filter((link) => link.name && link.link);

  return {
    phone,
    email,
    address,
    schedule,
    weekdays,
    weekends,
    socialLinks,
  };
}

