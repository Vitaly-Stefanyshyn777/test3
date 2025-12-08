"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./ProductsShowcase.module.css";
import type { Product } from "@/lib/products";
import { PlusIcon } from "../Icons/Icons";
import { fetchWcCategories } from "@/lib/bfbApi";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import ProductsShowcaseSkeleton from "./ProductsShowcaseSkeleton";

interface ProductsShowcaseProps {
  title: string;
  products?: Product[];
  moreHref?: string;
  showNewBadge?: boolean;
}

export function ProductsShowcase({
  title,
  moreHref = "#",
}: ProductsShowcaseProps) {
  type InventoryCategory = {
    id: number;
    name: string;
    slug: string;
    image?: { src?: string };
    date_created?: string;
    date_created_gmt?: string;
    date_modified?: string;
    date_modified_gmt?: string;
  };

  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Вже встановлено в true
  const [showAll, setShowAll] = useState(false);
  const [hasNewInCategory, setHasNewInCategory] = useState<
    Record<number, boolean>
  >({});
  // Лише список категорій для навігації; вибір і фільтрація відбудуться на сторінці каталогу

  useEffect(() => {
    (async () => {
      try {
        // isLoading вже true з початкового стану, не потрібно встановлювати знову
        const cats = (await fetchWcCategories({
          parent: 85, // Інвентар
          per_page: 50,
        })) as InventoryCategory[];
        // Фільтруємо та сортуємо: найновіші категорії першими
        const filtered = (cats || []).filter(Boolean);
        const sorted = filtered.sort((a, b) => {
          // Використовуємо date_modified або date_created, якщо доступні
          const dateA =
            a.date_modified ||
            a.date_modified_gmt ||
            a.date_created ||
            a.date_created_gmt ||
            "";
          const dateB =
            b.date_modified ||
            b.date_modified_gmt ||
            b.date_created ||
            b.date_created_gmt ||
            "";

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1; // Категорії без дати в кінець
          if (!dateB) return -1;

          // Сортуємо від новіших до старіших
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        setCategories(sorted);
      } catch {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Визначаємо, чи є у категорії нові товари (дата створення за останні 14 днів)
  useEffect(() => {
    if (!categories.length) return;
    const controller = new AbortController();
    (async () => {
      try {
        const checks = await Promise.all(
          categories.map(async (cat) => {
            try {
              const res = await fetch(
                `/api/wc/v3/products?category=${cat.id}&per_page=1&orderby=date&order=desc`,
                { signal: controller.signal }
              );
              if (!res.ok) return [cat.id, false] as const;
              const data = (await res.json()) as Array<{
                date_created?: string;
              }>;
              const latest = Array.isArray(data) && data[0]?.date_created;
              if (!latest) return [cat.id, false] as const;
              const created = new Date(latest);
              const today = new Date();
              const msInDay = 1000 * 60 * 60 * 24;
              const days = Math.floor(
                (today.getTime() - created.getTime()) / msInDay
              );
              return [cat.id, days <= 30] as const;
            } catch {
              return [cat.id, false] as const;
            }
          })
        );
        const map: Record<number, boolean> = {};
        for (const [id, isNew] of checks) map[id] = isNew;
        setHasNewInCategory(map);
      } catch {}
    })();
    return () => controller.abort();
  }, [categories]);

  // прибрано локальне завантаження продуктів

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const displayedTitle = (() => {
    const map: Record<string, string> = {
      "inventory-boards": "Борди",
      "inventory-accessories": "Аксесуари",
      "30": "Товари для спорту",
    };
    if (!categoryParam) return title;
    return map[categoryParam] || title;
  })();

  const visibleCategories = (() => {
    if (!categories || categories.length === 0) return [] as InventoryCategory[];
    
    // Сортуємо: категорії з новинками першими
    const sorted = [...categories].sort((a, b) => {
      const aHasNew = hasNewInCategory[a.id] || false;
      const bHasNew = hasNewInCategory[b.id] || false;
      
      // Якщо одна категорія має новинку, а інша ні - та з новинкою першою
      if (aHasNew && !bHasNew) return -1;
      if (!aHasNew && bHasNew) return 1;
      
      // Якщо обидві мають або не мають новинку - зберігаємо поточний порядок (за датою)
      return 0;
    });
    
    if (!showAll && sorted.length > 6) return sorted.slice(0, 6);
    return sorted;
  })();

  const shouldShowMore = categories.length > 6 && !showAll;

  if (isLoading) {
    return <ProductsShowcaseSkeleton />;
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{displayedTitle}</h2>
      </div>

      <div className={styles.scroller}>
        {visibleCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={styles.card}
          >
            <div className={styles.thumb}>
              {hasNewInCategory[cat.id] && (
                <BadgeContainer>
                  <Badge variant="new" className={styles.badge} />
                </BadgeContainer>
              )}
              <Image
                src={cat.image?.src || "/images/inventory-placeholder.png"}
                alt={cat.name}
                fill
                sizes="(max-width: 600px) 50vw, 320px"
              />
            </div>
            <div className={styles.caption}>
              <span className={styles.name}>{cat.name}</span>
              <span className={styles.price}></span>
            </div>
          </Link>
        ))}
        {shouldShowMore && (
          <button
            type="button"
            className={`${styles.card} ${styles.moreCard}`}
            aria-label="Більше товарів"
            onClick={() => setShowAll(true)}
          >
            <div className={styles.moreInner}>
              <span className={styles.plus}>
                <PlusIcon />
              </span>
              <span className={styles.moreText}>Більше</span>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
