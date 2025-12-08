import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = process.env.UPSTREAM_BASE;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("faq_category");

    // Отримуємо всі FAQ (WordPress не підтримує фільтрацію за faq_category напряму)
    let url = `${UPSTREAM_BASE}/wp-json/wp/v2/faq`;
    
    // Мапінг наших категорій до реальних ID в WordPress
    // Реальні ID в WordPress: 93 (Головна), 94 (Борди), 95 (Курси)
    const categoryMapping: Record<number, number> = {
      69: 93, // Головна -> 93
      70: 94, // Борди -> 94
      90: 95, // Курси -> 95
      91: 95, // Навчання -> 95 (використовуємо Курси)
      92: 95, // Тренерство -> 95 (використовуємо Курси)
    };

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[FAQ API] ❌ WordPress API error:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `WordPress API error: ${response.status}` },
        { status: response.status }
      );
    }

    let data = await response.json();

    // Фільтруємо на сервері, якщо передано categoryId
    if (categoryId) {
      const categoryIdNum = parseInt(categoryId);
      // Мапимо нашу категорію до реального ID в WordPress
      const realCategoryId = categoryMapping[categoryIdNum] || categoryIdNum;
      
      // Фільтруємо FAQ, які мають цю категорію в faq_type
      data = data.filter((item: { faq_type?: number[]; faq_category?: number[] }) => {
        const faqTypes = item.faq_type || [];
        const faqCategories = item.faq_category || [];
        // Перевіряємо як реальний ID, так і оригінальний (для зворотної сумісності)
        return (
          faqTypes.includes(realCategoryId) ||
          faqTypes.includes(categoryIdNum) ||
          faqCategories.includes(realCategoryId) ||
          faqCategories.includes(categoryIdNum)
        );
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[FAQ API] ❌ Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
