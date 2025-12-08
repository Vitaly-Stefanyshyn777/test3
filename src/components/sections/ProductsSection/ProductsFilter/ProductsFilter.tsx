"use client";
import React from "react";
import styles from "./ProductsFilter.module.css";
import { RangeInput } from "@/components/ui/RangeInput/RangeInput";
import { ColorFilter } from "../filters/ColorFilter/ColorFilter";
import { SizeFilter } from "../filters/SizeFilter/SizeFilter";
import { CertificationFilter } from "../filters/CertificationFilter/CertificationFilter";
import ButtonFilter from "@/components/ui/ButtonFilter/ButtonFilter";
import { useMemo } from "react";
import {
  useFilteredProducts,
  type ProductFilters,
} from "@/components/hooks/useFilteredProducts";

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

interface ProductsFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  products: Product[];
  searchTerm: string;
  onApply?: (params: Record<string, unknown>) => void;
  loading?: boolean;
}

const ProductsFilter = ({
  filters,
  onFiltersChange,
  onReset,
  products,
  onApply,
  loading = false,
}: ProductsFilterProps) => {
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | string[] | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (values: { min: number; max: number }) => {
    handleFilterChange("priceMin", values.min);
    handleFilterChange("priceMax", values.max);
  };

  // Build WC filter params for useFilteredProducts
  const wcFilters = useMemo(() => {
    const params: Partial<ProductFilters> = {};
    const categoryId = filters.certification && String(filters.certification);
    if (categoryId) {
      params.category = [categoryId];
    }
    if (filters.colors && filters.colors.length > 0) {
      params.attribute = params.attribute || [];
      params.attribute_term = params.attribute_term || [];
      filters.colors.forEach((termId) => {
        (params.attribute as string[]).push("pa_color");
        (params.attribute_term as string[]).push(String(termId));
      });
    }
    if (filters.sizes && filters.sizes.length > 0) {
      params.attribute = params.attribute || [];
      params.attribute_term = params.attribute_term || [];
      filters.sizes.forEach((slug) => {
        (params.attribute as string[]).push("pa_size");
        (params.attribute_term as string[]).push(slug);
      });
    }
    // Передаємо обмеження ціни тільки якщо користувач змінював діапазон,
    // інакше деякі variable-товари без явної ціни можуть випадати з вибірки
    if (typeof filters.priceMin === "number" && filters.priceMin > 0)
      params.min_price = filters.priceMin;
    if (
      typeof filters.priceMax === "number" &&
      filters.priceMax > 0 &&
      filters.priceMax < 100000
    )
      params.max_price = filters.priceMax;
    return params as Record<string, unknown>;
  }, [filters]);

  const { data: filteredProducts = [] } = useFilteredProducts(wcFilters);

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterSidebar}>
        <RangeInput
          min={0}
          max={100000}
          value={{ min: filters.priceMin, max: filters.priceMax }}
          onChange={handlePriceChange}
        />

        <ColorFilter
          selectedColors={filters.colors}
          onChange={(colors) => handleFilterChange("colors", colors)}
          products={products}
        />

        <SizeFilter
          selectedSizes={filters.sizes}
          onChange={(sizes) => handleFilterChange("sizes", sizes)}
        />

        <CertificationFilter
          value={filters.certification}
          onChange={(value) => handleFilterChange("certification", value)}
        />
      </div>
      <ButtonFilter
        onApply={() => {
          if (onApply) onApply(wcFilters);
        }}
        onReset={() => {
          onReset();
        }}
      />
    </div>
  );
};

export default ProductsFilter;
