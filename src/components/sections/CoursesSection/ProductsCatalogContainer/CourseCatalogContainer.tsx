"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./CourseCatalogContainer.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import type SwiperType from "swiper";
import ProductsGrid from "../CoursesGrid/CoursesGrid";
import { SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";

interface Props {
  block: {
    subtitle: string;
    title: string;
  };
  filteredProducts: unknown[];
  isLoading?: boolean;
  hasFilters?: boolean; // Чи є активні фільтри
  itemsPerPage?: number; // Кількість елементів на сторінці
  sortBy?: SortType;
}

type Course = {
  id: string | number;
  slug?: string; // Додаємо slug
  name: string;
  description?: string;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
  rating?: number;
  reviewsCount?: number;
  requirements?: string;
  dateCreated?: string;
  courseData?: unknown;
  wcProduct?: unknown;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

const CourseCatalogContainer = ({
  filteredProducts,
  isLoading,
  hasFilters,
  itemsPerPage = 12,
  sortBy,
}: Props) => {
  const effectiveSortBy = sortBy || "popular";

  const [currentPage, setCurrentPage] = useState(1);
  const sourceProducts: Course[] = (filteredProducts as Course[]) || [];

  // Спрощена функція розрахунку ціни з урахуванням знижки для авторизованих користувачів
  const getCoursePrice = (course: Course): number => {
    // Пріоритет цін: sale_price -> regular_price -> price
    let price: string | number | undefined =
      (course as any).wcProduct?.prices?.sale_price ||
      (course as any).wcProduct?.prices?.regular_price ||
      course.price;

    // Парсимо ціну, якщо вона рядок
    if (typeof price === "string") {
      const cleaned = price
        .replace(/\s/g, "")
        .replace(/[₴$€£]/g, "")
        .replace(",", ".");
      price = parseFloat(cleaned) || 0;
    } else if (typeof price !== "number") {
      price = 0;
    }

    // Застосовуємо знижку 20% для авторизованих користувачів
    return price * 0.8; // 20% знижка = множимо на 0.8
  };

  // Спрощена логіка сортування
  const sortedProducts = useMemo(() => {
    const copy = [...sourceProducts];

    switch (effectiveSortBy) {
      case "price_asc":
        return copy.sort((a, b) => getCoursePrice(b) - getCoursePrice(a)); // Спочатку великі ціни

      case "price_desc":
        return copy.sort((a, b) => getCoursePrice(a) - getCoursePrice(b)); // Спочатку маленькі ціни

      case "popular":
        return copy.sort((a, b) => {
          // Спочатку featured продукти
          const aFeatured = (a as any).featured === true ? 1 : 0;
          const bFeatured = (b as any).featured === true ? 1 : 0;
          if (aFeatured !== bFeatured) return bFeatured - aFeatured;

          // Потім за продажами
          const aSales = (a as any).total_sales || 0;
          const bSales = (b as any).total_sales || 0;
          return bSales - aSales;
        });

      case "new":
        return copy.sort((a, b) => {
          const aDate = new Date(
            (a as any).dateCreated || (a as any).date_created || 0
          );
          const bDate = new Date(
            (b as any).dateCreated || (b as any).date_created || 0
          );
          return bDate.getTime() - aDate.getTime();
        });

      case "sale":
        return copy.sort((a, b) => {
          // Спочатку акційні товари
          const aOnSale = (a as any).on_sale === true ? 1 : 0;
          const bOnSale = (b as any).on_sale === true ? 1 : 0;
          if (aOnSale !== bOnSale) return bOnSale - aOnSale;

          // Потім за датою
          const aDate = new Date(
            (a as any).dateCreated || (a as any).date_created || 0
          );
          const bDate = new Date(
            (b as any).dateCreated || (b as any).date_created || 0
          );
          return bDate.getTime() - aDate.getTime();
        });

      default:
        return copy;
    }
  }, [sourceProducts, effectiveSortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / itemsPerPage)
  );
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = sortedProducts.slice(start, start + itemsPerPage);

  // Products for grid

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setActiveIndex(0);
    swiperRef.current?.slideTo(0);
  }, [filteredProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.catalogContainer}>
      <div className={styles.mainContent}>
        <ProductsGrid
          courses={pageData.map((course: Course) => ({
            id: String(course.id),
            slug: course.slug,
            name: course.name,
            description: course.description || undefined,
            image: course.image || "",
            price:
              typeof course.price === "string"
                ? parseFloat(course.price) || 0
                : course.price || 0,
            originalPrice:
              typeof course.originalPrice === "string"
                ? parseFloat(course.originalPrice) || 0
                : course.originalPrice || 0,
            rating: course.rating || 0,
            reviewsCount: course.reviewsCount || 0,
            requirements: course.requirements,
            dateCreated: course.dateCreated,
            wcProduct: (course as any).wcProduct,
            courseData: course.courseData as
              | { excerpt?: { rendered: string } }
              | undefined,
          }))}
          isLoading={isLoading}
          hasFilters={hasFilters}
        />
        {sortedProducts.length > itemsPerPage && (
          <SliderNav
            activeIndex={activeIndex}
            dots={Math.ceil(sortedProducts.length / itemsPerPage)}
            onPrev={() => swiperRef.current?.slidePrev()}
            onNext={() => swiperRef.current?.slideNext()}
            onDotClick={(i) => swiperRef.current?.slideTo(i)}
          />
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            <div className={styles.paginationDots}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`${styles.paginationDot} ${
                      page === currentPage ? styles.activeDot : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  />
                )
              )}
            </div>

            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalogContainer;
