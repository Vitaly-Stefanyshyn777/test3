"use client";
import { useQuery } from "@tanstack/react-query";
import {
  coachesQuery,
  coachQuery,
  coachesWithFiltersQuery,
} from "../../lib/queries";
import { fetchCases } from "../../lib/bfbApi";

export function useCoachesQuery() {
  return useQuery(coachesQuery());
}

export function useCoachQuery(id: string) {
  return useQuery(coachQuery(id));
}

export function useCoachesWithFiltersQuery(filters: Record<string, string>) {
  return useQuery(coachesWithFiltersQuery(filters));
}

// Cases
export function useCasesQuery() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
