"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./CourseCatalogContainer.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import type SwiperType from "swiper";
import ProductsGrid from "../CoursesGrid/CoursesGrid";

interface Props {
  block: {
    subtitle: string;
    title: string;
  };
  filteredProducts: unknown[];
  isLoading?: boolean;
  hasFilters?: boolean; // Чи є активні фільтри
}

// Тип для курсу з useFilteredCourses
type Course = {
  id: string | number;
  name: string;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
  rating?: number;
  reviewsCount?: number;
  requirements?: string;
  courseData?: unknown;
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
}: Props) => {
  // Component state
  const [sortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Використовуємо ТІЛЬКИ відфільтровані курси - якщо порожній, показуємо порожній список
  const sourceProducts: Course[] = (filteredProducts as Course[]) || [];

  const sortedProducts = useMemo(() => {
    const copy = [...sourceProducts];
    if (sortBy === "name") {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "price") {
      copy.sort((a, b) => {
        const priceA =
          typeof a.price === "string" ? parseFloat(a.price) || 0 : a.price || 0;
        const priceB =
          typeof b.price === "string" ? parseFloat(b.price) || 0 : b.price || 0;
        return priceA - priceB;
      });
    }
    return copy;
  }, [sourceProducts, sortBy]);

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
            name: course.name,
            image: course.image || "",
            price:
              typeof course.price === "string"
                ? parseFloat(course.price) || 0
                : course.price || 0,
            rating: course.rating || 0,
            reviewsCount: course.reviewsCount || 0,
            requirements: course.requirements,
            courseData: course.courseData as { excerpt?: { rendered: string } } | undefined,
          }))}
          isLoading={isLoading}
          hasFilters={hasFilters}
        />
        {sortedProducts.length > 12 && (
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
