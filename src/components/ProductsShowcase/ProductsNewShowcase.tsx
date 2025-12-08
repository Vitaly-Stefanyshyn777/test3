"use client";
import React from "react";
import { ProductsShowcase } from "./ProductsShowcase";
import {
  useNewProductsQuery,
  useProductsQuery,
} from "../hooks/useProductsQuery";

export function ProductsNewShowcase() {
  const { data: newProducts = [], isLoading: isLoadingNew } =
    useNewProductsQuery();
  const { isLoading: isLoadingAll } = useProductsQuery();

  if (isLoadingNew || isLoadingAll) return null;

  const hasNew = Array.isArray(newProducts) && newProducts.length > 0;

  return (
    <ProductsShowcase
      title={hasNew ? "Новинки" : "Товари для спорту"}
      moreHref="/products"
      showNewBadge={hasNew}
    />
  );
}
