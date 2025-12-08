"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { СhevronIcon } from "../../Icons/Icons";
import styles from "./FAQSection.module.css";
import { fetchFAQByCategoryWithLogging, FaqItem } from "@/lib/bfbApi";
import { useQuery } from "@tanstack/react-query";
import FAQSectionSkeleton from "./FAQSectionSkeleton";

interface FAQSectionProps {
  /** ID категорії FAQ. Якщо не вказано, визначається автоматично на основі pathname */
  categoryId?: number;
}

const FAQSection: React.FC<FAQSectionProps> = ({ categoryId: propCategoryId }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [faqData, setFaqData] = useState<FaqItem[]>([]);

  // Визначаємо категорію FAQ на основі поточної сторінки або переданого пропса
  const getFaqCategoryId = (): number => {
    // Якщо категорія передана як пропс, використовуємо її
    if (propCategoryId !== undefined) {
      return propCategoryId;
    }

    // Інакше визначаємо на основі pathname
    if (pathname?.includes("/products")) {
      return 70; // Борди
    }
    if (pathname?.includes("/courses-landing")) {
      return 92; // Тренерство
    }
    if (pathname?.startsWith("/courses/")) {
      return 91; // Навчання (для конкретних курсів)
    }
    if (pathname?.includes("/courses")) {
      return 90; // Курси
    }
    return 69; // Головна (за замовчуванням)
  };

  const categoryId = getFaqCategoryId();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faq", categoryId],
    queryFn: () => fetchFAQByCategoryWithLogging(categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fallback до категорії 69 (Головна) якщо основна категорія порожня
  const { data: fallbackData } = useQuery({
    queryKey: ["faq", 69],
    queryFn: () => fetchFAQByCategoryWithLogging(69),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled:
      categoryId !== 69 &&
      data !== undefined &&
      Array.isArray(data) &&
      data.length === 0,
  });

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data) && data.length > 0) {
      // Фільтруємо FAQ - показуємо всі які мають title
      const validFaq = data.filter((item) => item.title?.rendered);

      setFaqData(validFaq);
    } else if (
      fallbackData &&
      Array.isArray(fallbackData) &&
      fallbackData.length > 0
    ) {
      // Використовуємо fallback дані з категорії 69 (Головна)
      const validFallback = fallbackData.filter((item) => item.title?.rendered);
      setFaqData(validFallback);
    } else {
      // Якщо немає даних навіть у fallback - показуємо порожній список
      setFaqData([]);
    }
  }, [data, fallbackData]);

  const toggleItem = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return <FAQSectionSkeleton />;
  }

  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.contentBlock}>
          <div className={styles.contentTextBlock}>
            <p className={styles.subtitle}>Відповіді від Ліки</p>
            <h2 className={styles.title}>Питання та відповіді</h2>
          </div>

          <div className={styles.content}>
            <div className={styles.leftColumn}>
              <div className={styles.titleContainer}></div>
              <div className={styles.imageContainer}>
                <Image
                  src="/images/Frame132131848543.png"
                  alt="Дівчина на балансборді"
                  width={562}
                  height={465}
                  className={styles.heroImage}
                  onLoad={() => {
                    // Image loaded
                  }}
                  onError={() => {
                    // Silent error handling
                  }}
                  priority={false}
                />
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.faqList}>
                {isError && (
                  <div className={styles.error}>
                    <p>Не вдалося завантажити FAQ</p>
                  </div>
                )}

                {!isLoading && faqData.length === 0 && !isError && (
                  <div className={styles.empty}>
                    <p>FAQ не знайдено</p>
                  </div>
                )}

                {faqData.map((item) => {
                  // Використовуємо нові поля: acf.answer та acf.question
                  const answerContent =
                    item.acf?.answer || item.content?.rendered || "";

                  const questionText =
                    item.acf?.question || item.title?.rendered || "Питання";

                  return (
                    <div
                      key={item.id}
                      className={`${styles.faqItem} ${
                        expandedItems.includes(item.id) ? styles.expanded : ""
                      }`}
                    >
                      <button
                        className={styles.faqButton}
                        onClick={() => toggleItem(item.id)}
                        aria-expanded={expandedItems.includes(item.id)}
                      >
                        <span className={styles.question}>
                          {questionText}
                        </span>
                        <span
                          className={`${styles.chevron} ${
                            expandedItems.includes(item.id)
                              ? styles.rotated
                              : ""
                          }`}
                        >
                          <СhevronIcon />
                        </span>
                      </button>

                      <div
                        className={`${styles.answerContainer} ${
                          expandedItems.includes(item.id) ? styles.open : ""
                        }`}
                      >
                        <div
                          className={styles.answer}
                          dangerouslySetInnerHTML={{
                            __html: answerContent,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
