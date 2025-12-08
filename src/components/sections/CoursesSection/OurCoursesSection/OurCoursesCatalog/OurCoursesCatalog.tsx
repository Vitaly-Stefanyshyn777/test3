"use client";
import React, { useMemo, useState, useEffect } from "react";
import styles from "./OurCoursesCatalog.module.css";
import FilterSortPanel from "@/components/ui/FilterSortPanel/FilterSortPanel";
import ProductsCatalogContainer from "../../ProductsCatalogContainer/CourseCatalogContainer";
import { useProducts } from "@/components/hooks/useProducts";
import { useProductsQuery } from "@/components/hooks/useProductsQuery";
import OurCoursesFilter from "../filters/OurCoursesFilter/OurCoursesFilter";
import { useFilteredProducts } from "@/components/hooks/useFilteredProducts";
import OurCoursesFilterModal from "@/components/ui/OurCoursesFilterModal/OurCoursesFilterModal";
import { FilterMobileIcon, SortArrowIcon } from "@/components/Icons/Icons";

const OurCoursesCatalog = () => {
  const { filters, updateFilters, resetFilters } = useProducts();
  const { data: products = [], isLoading, isError } = useProductsQuery();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const filtersForQuery = useMemo(
    () => ({ category: selectedCategoryIds.map((id) => String(id)) }),
    [selectedCategoryIds]
  );
  const { data: filteredProducts = [] } = useFilteredProducts(filtersForQuery);

  const searchTerm = "";

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
  };

  return (
    <div className={styles.productsCatalog}>
      <div className={styles.catalogContentBlock}>
        <div className={styles.catalogContentContainer}>
          {isMobile ? (
            <div className={styles.filterSortPanel}>
              <div className={styles.filterSortBar}>
                <button
                  className={styles.filterMobileButton}
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  <FilterMobileIcon className={styles.filterMobileIcon} />
                  <span className={styles.filterMobileLabel}>Фільтр</span>
                </button>
                <div className={styles.sortSection}>
                  <div className={styles.sortOptionWrapper}>
                    <span className={styles.sortOptionLabel}>Сортування</span>
                    <SortArrowIcon className={styles.sortIcon} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <FilterSortPanel />
          )}
          <div className={styles.catalogContent}>
            <OurCoursesFilter
              filters={filters}
              onFiltersChange={(newFilters) => updateFilters(newFilters)}
              onReset={() => {
                resetFilters();
                setSelectedCategoryIds([]);
              }}
              products={products}
              searchTerm={searchTerm}
              onApplyCategories={(ids) => {
                setSelectedCategoryIds(ids);
              }}
            />

            <ProductsCatalogContainer
              block={{ subtitle: "Наші товари", title: "Каталог товарів" }}
              filteredProducts={
                selectedCategoryIds.length > 0 ? filteredProducts : products
              }
            />

            {isError && (
              <div className={styles.error}>Не вдалося завантажити товари</div>
            )}
            {isLoading && <div className={styles.loading}>Завантаження…</div>}
          </div>
        </div>
      </div>
      {isMobile && (
        <OurCoursesFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={{
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            colors: filters.colors,
            sizes: filters.sizes,
            certification: filters.certification || "",
          }}
          onFiltersChange={(newFilters) => {
            updateFilters({
              ...filters,
              priceMin: newFilters.priceMin,
              priceMax: newFilters.priceMax,
              colors: newFilters.colors,
              sizes: newFilters.sizes,
              certification: newFilters.certification,
            });
          }}
          onReset={() => {
            resetFilters();
            setSelectedCategoryIds([]);
          }}
          products={products}
          searchTerm={searchTerm}
          onApply={handleApplyFilters}
          onApplyCategories={(ids) => {
            setSelectedCategoryIds(ids);
          }}
        />
      )}
    </div>
  );
};

export default OurCoursesCatalog;
