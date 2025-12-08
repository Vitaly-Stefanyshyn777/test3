"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchThemeSettings,
  fetchEvents,
  fetchProductAttributes,
  fetchAttributeTerms,
  fetchInstructor,
  fetchWcPaymentGateways,
  fetchCourse,
} from "@/lib/bfbApi";
import api from "@/lib/api";

export const useThemeSettingsQuery = () =>
  useQuery({
    queryKey: ["theme_settings"],
    queryFn: fetchThemeSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useEventsQuery = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useProductAttributesQuery = () =>
  useQuery({
    queryKey: ["wc_attributes"],
    queryFn: fetchProductAttributes,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

export const useAttributeTermsQuery = (attributeId: number, enabled = true) =>
  useQuery({
    queryKey: ["wc_attribute_terms", attributeId],
    queryFn: () => fetchAttributeTerms(attributeId),
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

export const useWcCategoriesQuery = (parent?: number) =>
  useQuery({
    queryKey: ["wc_categories", parent ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeof parent === "number") params.set("parent", String(parent));
      params.set("per_page", "100");

      try {
        const { data } = await api.get(
          `/api/wc/products/categories?${params.toString()}`
        );
        return data as Array<{
          id: number;
          name: string;
          slug: string;
          parent: number;
        }>;
      } catch (error: unknown) {
        // Silent error handling

        // Якщо це 403 помилка, повертаємо порожній масив
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          error.response.status === 403
        ) {
          return [] as Array<{
            id: number;
            name: string;
            slug: string;
            parent: number;
          }>;
        }

        // Для інших помилок також повертаємо порожній масив
        return [] as Array<{
          id: number;
          name: string;
          slug: string;
          parent: number;
        }>;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 хвилин
    gcTime: 60 * 60 * 1000, // 1 година
    retry: false, // Не повторювати запити при помилці
    refetchOnWindowFocus: false, // Не перезавантажувати при фокусі вікна
    refetchOnMount: false, // Не перезавантажувати при монтуванні
  });

export const useInstructorQuery = (id: number) =>
  useQuery({
    queryKey: ["instructor", id],
    queryFn: () => fetchInstructor(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

// Extra WC helpers for Course page
import { fetchWcProducts, fetchWcCategories } from "@/lib/bfbApi";

export const useWcProductsQuery = (params?: Record<string, string | number>) =>
  useQuery({
    queryKey: ["wcProducts", params],
    queryFn: () => fetchWcProducts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useAllWcCategoriesQuery = (
  params?: Record<string, string | number>
) =>
  useQuery({
    queryKey: ["wcAllCategories", params],
    queryFn: () => fetchWcCategories(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

export const useWcPaymentGatewaysQuery = () =>
  useQuery({
    queryKey: ["wcPaymentGateways"],
    queryFn: fetchWcPaymentGateways,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

export const useFaqCategoriesQuery = () =>
  useQuery({
    queryKey: ["faq_categories"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
      const response = await fetch(`${baseUrl}/wp-json/wp/v2/faq_category`);
      if (!response.ok) {
        throw new Error("Failed to fetch FAQ categories");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

export const useCourseQuery = (courseIdOrSlug?: number | string) =>
  useQuery({
    queryKey: ["course", courseIdOrSlug],
    queryFn: () => fetchCourse(courseIdOrSlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!courseIdOrSlug, // Не виконуємо запит, якщо немає ID або slug
  });
