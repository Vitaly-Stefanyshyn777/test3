"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./OurCoursesFilter.module.css";
import ButtonFilter from "@/components/ui/ButtonFilter/ButtonFilter";

import TrainingProgramsFilter from "../TrainingProgramsFilter/TrainingProgramsFilter";
import ManagementMarketingFilter from "../ManagementMarketingFilter/ManagementMarketingFilter";
import { fetchCourseCategories, WooCommerceCategory } from "@/lib/bfbApi";
interface FilterState {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  image: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stockStatus: string;
}

type OurCoursesFilterVariant = "default" | "modal";

interface ProductsFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  products: Product[];
  searchTerm: string;
  onApplyCategories?: (categoryIds: number[]) => void;
  variant?: OurCoursesFilterVariant;
  onApply?: () => void;
  onApplyRef?: React.MutableRefObject<(() => void) | null>;
}

const OurCoursesFilter = ({
  filters,
  onFiltersChange,
  onReset,
  onApplyCategories,
  variant = "default",
  onApply,
  onApplyRef,
}: ProductsFilterProps) => {
  const isModalVariant = variant === "modal";
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<WooCommerceCategory[]>([]);
  const [childrenByGroup, setChildrenByGroup] = useState<
    Record<number, WooCommerceCategory[]>
  >({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const cats = await fetchCourseCategories(); // parent=72
        setGroups(cats);

        const entries = await Promise.all(
          cats.map(async (g) => {
            const res = await fetch(
              `/api/wc/products/categories?parent=${g.id}&per_page=100`,
              { cache: "no-store" }
            );
            if (!res.ok) return [g.id, [] as WooCommerceCategory[]] as const;
            const json = (await res.json()) as WooCommerceCategory[];
            return [g.id, json] as const;
          })
        );
        setChildrenByGroup(Object.fromEntries(entries));
      } catch (e) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trainingProgramsGroupId = useMemo(() => {
    return (
      groups.find(
        (g) =>
          g.name?.trim().toLowerCase() ===
          "Прокачай свої тренування:".trim().toLowerCase()
      )?.id ?? groups[0]?.id
    );
  }, [groups]);

  const trainingProgramsOptions = useMemo(
    () => (childrenByGroup[trainingProgramsGroupId] || []).map((c) => c.name),
    [childrenByGroup, trainingProgramsGroupId]
  );
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | string[] | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleApply = useCallback(() => {
    if (!onApplyCategories) return;
    const children = childrenByGroup[trainingProgramsGroupId] || [];
    const selectedNames = Array.isArray(filters.sizes)
      ? (filters.sizes as string[])
      : [];
    const ids = children
      .filter((c) => selectedNames.includes(c.name))
      .map((c) => c.id);
    onApplyCategories(ids);
    // Викликаємо onApply якщо він переданий (для модалки)
    if (onApply) {
      onApply();
    }
  }, [
    filters.sizes,
    childrenByGroup,
    trainingProgramsGroupId,
    onApplyCategories,
    onApply,
  ]);

  // Зберігаємо handleApply в ref для доступу з модалки
  useEffect(() => {
    if (onApplyRef) {
      onApplyRef.current = handleApply;
    }
  }, [onApplyRef, handleApply]);

  return (
    <div
      className={`${styles.filterContainer} ${
        isModalVariant ? styles.modalVariant : ""
      }`}
    >
      <div className={styles.filterSidebar}>
        <TrainingProgramsFilter
          value={
            Array.isArray(filters.sizes) ? (filters.sizes as string[]) : []
          }
          onChange={(value) => handleFilterChange("sizes", value)}
          options={trainingProgramsOptions}
        />
        <ManagementMarketingFilter
          value={
            Array.isArray(filters.colors) ? (filters.colors as string[]) : []
          }
          onChange={(value) => handleFilterChange("colors", value)}
        />
      </div>
      {!isModalVariant && (
        <ButtonFilter
          onApply={handleApply}
          onReset={onReset}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OurCoursesFilter;
