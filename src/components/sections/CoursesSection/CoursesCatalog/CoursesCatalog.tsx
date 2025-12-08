"use client";
import React, { useMemo, useState, useEffect } from "react";
import styles from "./CoursesCatalog.module.css";
import ProductsFilter from "../CoursesFilters/CoursesFilters";
import { useProducts } from "@/components/hooks/useProducts";
import FilterSortPanel, {
  type SortType,
} from "@/components/ui/FilterSortPanel/FilterSortPanel";
import ProductsCatalogContainer from "../ProductsCatalogContainer/CourseCatalogContainer";
import { useFilteredCourses } from "@/lib/useFilteredCourses";
import FAQSection from "../../FAQSection/FAQSection";
import CoursesFilterModal from "@/components/ui/CoursesFilterModal/CoursesFilterModal";
import { FilterMobileIcon, SortArrowIcon } from "@/components/Icons/Icons";
import SortDropdown from "@/components/ui/FilterSortPanel/SortDropdown";
import { SORT_OPTIONS } from "@/components/ui/FilterSortPanel/FilterSortPanel";
import { mapSortTypeToWcParams } from "@/lib/sortMapping";

type CoursesUIFilters = {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string[];
  workoutTypes: string[];
  category: string;
  search: string;
};

const CoursesCatalog = () => {
  const { filters, updateFilters, resetFilters } = useProducts();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("popular");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Формуємо фільтри з сортуванням та пагінацією
  const sortParams = useMemo(() => mapSortTypeToWcParams(sortBy), [sortBy]);

  const filtersForQuery = useMemo(() => {
    const filters = {
      ...(selectedCategoryIds.length > 0 && {
        category: selectedCategoryIds.map((id) => String(id)),
      }),
      orderby: sortParams.orderby,
      order: sortParams.order,
      per_page: itemsPerPage,
      ...(sortParams.on_sale !== undefined && { on_sale: sortParams.on_sale }),
    };

    return filters;
  }, [selectedCategoryIds, sortParams, itemsPerPage]);

  const {
    data: coursesToDisplay = [],
    isLoading,
    isError,
  } = useFilteredCourses(filtersForQuery);

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
          <h1 className={styles.pageTitle}>Онлайн тренування</h1>
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
                  <SortDropdown
                    label="Сортування"
                    value={sortBy}
                    options={SORT_OPTIONS}
                    onChange={(value) => setSortBy(value as SortType)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <FilterSortPanel
              sortBy={sortBy}
              onSortChange={setSortBy}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
          <div className={styles.catalogContent}>
            {(() => {
              const uiFilters: CoursesUIFilters = {
                priceMin: filters.priceMin,
                priceMax: filters.priceMax,
                colors: filters.colors,
                sizes: filters.sizes,
                certification: filters.certification
                  ? [filters.certification]
                  : [],
                workoutTypes: filters.workoutTypes,
                category: filters.category,
                search: filters.search,
              };

              const handleUiFiltersChange = (
                newFilters: Partial<CoursesUIFilters>
              ) => {
                const nextCertificationArray =
                  newFilters.certification ?? uiFilters.certification;
                const nextCertification = Array.isArray(nextCertificationArray)
                  ? nextCertificationArray[0] ?? ""
                  : "";
                const nextWorkoutTypes =
                  newFilters.workoutTypes ?? uiFilters.workoutTypes;

                updateFilters({
                  priceMin: newFilters.priceMin,
                  priceMax: newFilters.priceMax,
                  colors: newFilters.colors,
                  sizes: newFilters.sizes,
                  certification: nextCertification,
                  workoutTypes: nextWorkoutTypes,
                  category: newFilters.category,
                  search: newFilters.search,
                });
              };

              return (
                <ProductsFilter
                  filters={uiFilters}
                  onFiltersChange={handleUiFiltersChange}
                  onReset={() => {
                    resetFilters();
                    setSelectedCategoryIds([]);
                  }}
                  products={coursesToDisplay}
                  searchTerm={searchTerm}
                  onApplyCategories={(categoryIds) => {
                    setSelectedCategoryIds(categoryIds);
                  }}
                />
              );
            })()}
            <ProductsCatalogContainer
              block={{
                subtitle: "Наші товари",
                title: "Каталог товарів",
              }}
              filteredProducts={coursesToDisplay}
              isLoading={isLoading}
              hasFilters={selectedCategoryIds.length > 0}
            />
          </div>
        </div>
        <FAQSection />
      </div>
      {isMobile && (
        <CoursesFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={{
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            colors: filters.colors,
            sizes: filters.sizes,
            certification: filters.certification ? [filters.certification] : [],
            workoutTypes: filters.workoutTypes,
          }}
          onFiltersChange={(newFilters) => {
            const nextCertificationArray = newFilters.certification ?? [];
            const nextCertification = Array.isArray(nextCertificationArray)
              ? nextCertificationArray[0] ?? ""
              : "";
            const nextWorkoutTypes = newFilters.workoutTypes ?? [];
            updateFilters({
              priceMin: newFilters.priceMin,
              priceMax: newFilters.priceMax,
              colors: newFilters.colors,
              sizes: newFilters.sizes,
              certification: nextCertification,
              workoutTypes: nextWorkoutTypes,
              category: filters.category,
              search: filters.search,
            });
          }}
          onReset={() => {
            resetFilters();
            setSelectedCategoryIds([]);
          }}
          products={coursesToDisplay}
          searchTerm={searchTerm}
          onApply={handleApplyFilters}
          onApplyCategories={(categoryIds) => {
            setSelectedCategoryIds(categoryIds);
          }}
        />
      )}
    </div>
  );
};

export default CoursesCatalog;
