"use client";
import React, { useMemo, useState, useEffect } from "react";
import styles from "./OurCoursesCatalog.module.css";
import FilterSortPanel, { type SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";
import ProductsCatalogContainer from "../../ProductsCatalogContainer/CourseCatalogContainer";
import { useProducts } from "@/components/hooks/useProducts";
import OurCoursesFilter from "../filters/OurCoursesFilter/OurCoursesFilter";
import { useCoursesQuery } from "@/lib/coursesQueries";
import OurCoursesFilterModal from "@/components/ui/OurCoursesFilterModal/OurCoursesFilterModal";
import { FilterMobileIcon, SortArrowIcon } from "@/components/Icons/Icons";
import SortDropdown from "@/components/ui/FilterSortPanel/SortDropdown";
import { SORT_OPTIONS } from "@/components/ui/FilterSortPanel/FilterSortPanel";
import { mapSortTypeToWcParams } from "@/lib/sortMapping";

const OurCoursesCatalog = () => {
  const { filters, updateFilters, resetFilters } = useProducts();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("popular");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  
  const sortParams = useMemo(() => mapSortTypeToWcParams(sortBy), [sortBy]);

  const filtersForQuery = useMemo(
    () => ({
      ...(selectedCategoryIds.length > 0 && {
        category: selectedCategoryIds.map((id) => String(id)),
      }),
      orderby: sortParams.orderby as "date" | "price" | "popularity" | "rating" | "title" | undefined,
      order: sortParams.order as "asc" | "desc" | undefined,
      per_page: itemsPerPage,
      ...(sortParams.on_sale !== undefined && { on_sale: sortParams.on_sale }),
      _t: Date.now(),
    }),
    [selectedCategoryIds, sortParams, itemsPerPage]
  );

  const { data: coursesData = [], isLoading, isError } = useCoursesQuery(filtersForQuery);
  const coursesToDisplay = useMemo(() => {
    return coursesData.map((course: {
      id: string;
      slug?: string;
      name: string;
      description?: string;
      price: string;
      originalPrice?: string;
      image?: string;
      categories?: Array<{ id: number; name: string; slug: string }>;
      courseData?: {
        Course_themes?: string[];
        What_learn?: string[];
        Course_include?: string[];
        Course_program?: Array<unknown>;
        Date_start?: string | null;
        Duration?: string | null;
        Course_coach?: { ID: number } | null;
        Required_equipment?: string | null;
        Blocks?: unknown;
        Online_lessons?: unknown;
      };
      dateCreated?: string;
      rating?: number;
      reviewsCount?: number;
      requirements?: string;
      wcProduct?: {
        prices?: {
          price: string;
          regular_price: string;
          sale_price: string;
        };
        on_sale?: boolean;
        total_sales?: number;
        average_rating?: string;
        rating_count?: number;
        featured?: boolean;
      };
    }) => ({
      id: course.id,
      slug: course.slug,
      name: course.name,
      description: course.description,
      price: course.price,
      originalPrice: course.originalPrice,
      image: course.image,
      categories: course.categories,
      courseData: course.courseData,
      dateCreated: course.dateCreated,
      rating: course.rating,
      reviewsCount: course.reviewsCount,
      requirements: course.requirements,
      wcProduct: course.wcProduct,
    }));
  }, [coursesData]);

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
            <OurCoursesFilter
              filters={filters}
              onFiltersChange={(newFilters) => updateFilters(newFilters)}
              onReset={() => {
                resetFilters();
                setSelectedCategoryIds([]);
              }}
              products={coursesToDisplay}
              searchTerm={searchTerm}
              onApplyCategories={(ids) => {
                setSelectedCategoryIds(ids);
              }}
            />

            <ProductsCatalogContainer
              block={{ subtitle: "Наші курси", title: "Каталог курсів" }}
              filteredProducts={coursesToDisplay}
              isLoading={isLoading}
              hasFilters={selectedCategoryIds.length > 0}
              itemsPerPage={itemsPerPage}
              sortBy={sortBy}
            />

            {isError && (
              <div className={styles.error}>Не вдалося завантажити курси</div>
            )}
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
          products={coursesToDisplay}
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
