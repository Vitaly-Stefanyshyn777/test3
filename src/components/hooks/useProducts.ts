"use client";
import { useState } from "react";

interface ProductFilters {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string;
  workoutTypes: string[];
  category: string;
  search: string;
}

export const useProducts = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    priceMin: 0,
    priceMax: 100000,
    colors: [],
    sizes: [],
    certification: "",
    workoutTypes: [],
    category: "",
    search: "",
  });

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: 100000,
      colors: [],
      sizes: [],
      certification: "",
      workoutTypes: [],
      category: "",
      search: "",
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters,
  };
};
