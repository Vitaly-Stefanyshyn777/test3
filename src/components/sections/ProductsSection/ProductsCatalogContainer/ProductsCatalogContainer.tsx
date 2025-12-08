"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./ProductsCatalogContainer.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import type SwiperType from "swiper";
import ProductsGrid from "../ProductsGrid/ProductsGrid";
import ProductsGridSkeleton from "../ProductsGrid/ProductsGridSkeleton";
import { useQuery } from "@tanstack/react-query";
import { productsWithFiltersQuery } from "@/lib/productsQueries";

interface Props {
  block: {
    subtitle: string;
    title: string;
  };
  filteredProducts: unknown[];
  isNoCertificationFilter?: boolean;
  selectedCertificationFilter?: string; // Вибраний фільтр сертифікації (78, 79, або undefined)
  isLoading?: boolean; // Стан завантаження з батьківського компонента
}

const ProductsCatalogContainer = ({
  filteredProducts,
  isNoCertificationFilter = false,
  selectedCertificationFilter,
  isLoading: parentIsLoading,
}: Props) => {
  // Якщо зовнішній фільтр не передано – отримуємо товари категорії "товари для спорту"
  const {
    data: sportsProducts = [],
    isLoading: localIsLoading,
    isError,
  } = useQuery(productsWithFiltersQuery({ category: "tovary-dlya-sportu" }));
  
  // Використовуємо isLoading з батьківського компонента, якщо передано, інакше локальний
  const isLoading = parentIsLoading !== undefined ? parentIsLoading : localIsLoading;

  // debug logs removed

  // Пріоритет: передані зверху filteredProducts → інакше беремо з запиту
  const products = (
    filteredProducts && filteredProducts.length
      ? filteredProducts
      : sportsProducts
  ) as unknown[];

  const [sortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  type ProductLike = {
    id: string | number;
    name: string;
    price: string | number;
    regularPrice?: string;
    salePrice?: string;
    onSale?: boolean;
    images?: Array<{ src: string }>;
    categories?: unknown;
    stockStatus?: string;
    dateCreated?: string;
  };
  const sortedProducts: ProductLike[] = useMemo(() => {
    const base: ProductLike[] = (filteredProducts ?? products) as ProductLike[];
    const copy = [...base];
    
    // Функція для визначення чи товар новий (30 днів – як у ProductCard)
    const isNewProduct = (product: ProductLike): boolean => {
      if (!product.dateCreated) return false;
      try {
        const createdDate = new Date(product.dateCreated);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdDate > thirtyDaysAgo;
      } catch {
        return false;
      }
    };
    
    // Сортуємо: спочатку нові товари, потім решта
    copy.sort((a, b) => {
      const aIsNew = isNewProduct(a);
      const bIsNew = isNewProduct(b);
      
      // Якщо один новий, а інший ні - новий першим
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      
      // Якщо обидва нові або обидва старі - сортуємо за поточним sortBy
      if (sortBy === "name")
        return String(a.name).localeCompare(String(b.name));
      if (sortBy === "price")
        return parseFloat(String(a.price)) - parseFloat(String(b.price));
      
      // За замовчуванням - за датою створення (новіші першими)
      if (a.dateCreated && b.dateCreated) {
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      }
      if (a.dateCreated) return -1;
      if (b.dateCreated) return 1;
      
      return 0;
    });
    
    return copy;
  }, [filteredProducts, products, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / itemsPerPage)
  );
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = sortedProducts.slice(start, start + itemsPerPage);

  const productsForGrid = pageData.map((product) => {
    type SnakeCaseFields = Partial<{
      regular_price: string;
      sale_price: string;
      on_sale: boolean;
      stock_status: string;
      images: Array<{ src: string; alt?: string }>;
      date_created?: string;
    }>;
    type CamelCaseFields = Partial<{
      dateCreated?: string;
    }>;
    const p = product as ProductLike & SnakeCaseFields & CamelCaseFields;
    const imagesArr =
      Array.isArray(p.images) && p.images.length > 0
        ? (p.images as Array<{ src: string; alt?: string }>).map((img) => ({
            src: img.src,
            alt: img.alt || product.name,
          }))
        : [{ src: product.images?.[0]?.src || "", alt: product.name }];

    // Отримуємо dateCreated з різних можливих джерел
    // mapProductToUi мапить date_created -> dateCreated, тому спочатку перевіряємо camelCase
    const dateCreatedValue =
      product.dateCreated ??
      (product as { date_created?: string }).date_created ??
      p.dateCreated ??
      p.date_created;

    return {
      id: Number(product.id),
      name: product.name,
      price: String(product.price ?? "0"),
      regular_price: String(p.regular_price ?? product.regularPrice ?? ""),
      sale_price: String(p.sale_price ?? product.salePrice ?? ""),
      on_sale: Boolean(p.on_sale ?? product.onSale),
      images: imagesArr,
      categories:
        (product.categories as Array<{
          id: number;
          name: string;
          slug: string;
        }>) || [],
      attributes: [],
      stock_status: String(p.stock_status ?? product.stockStatus ?? ""),
      date_created: dateCreatedValue,
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    swiperRef.current?.slideTo(0);
  }, [filteredProducts.length]); // Залежить тільки від довжини масиву

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.catalogContainer}>
      <div className={styles.mainContent}>
        {isError && (
          <div className={styles.error}>Не вдалося завантажити товари</div>
        )}
        {isLoading ? (
          <ProductsGridSkeleton />
        ) : (
          <ProductsGrid
            products={productsForGrid}
            isNoCertificationFilter={isNoCertificationFilter}
            selectedCertificationFilter={selectedCertificationFilter}
          />
        )}
        {sortedProducts.length > 16 && (
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

export default ProductsCatalogContainer;
