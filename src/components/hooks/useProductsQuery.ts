"use client";
import { useQuery } from "@tanstack/react-query";
import {
  productsQuery,
  productQuery,
  productsWithFiltersQuery,
  newProductsQuery,
  bestSellingProductsQuery,
  saleProductsQuery,
  productsByCategoryQuery,
  productCategoriesQuery,
} from "../../lib/productsQueries";

export function useProductsQuery() {
  return useQuery(productsQuery());
}

export function useProductQuery(slugOrId: string) {
  return useQuery(productQuery(slugOrId));
}

export function useProductsWithFiltersQuery(filters: Record<string, unknown>) {
  return useQuery(productsWithFiltersQuery(filters));
}

export function useNewProductsQuery() {
  return useQuery(newProductsQuery());
}

export function useBestSellingProductsQuery() {
  return useQuery(bestSellingProductsQuery());
}

export function useSaleProductsQuery() {
  return useQuery(saleProductsQuery());
}

export function useProductsByCategoryQuery(categoryId: string) {
  return useQuery(productsByCategoryQuery(categoryId));
}

export function useProductCategoriesQuery() {
  return useQuery(productCategoriesQuery());
}
