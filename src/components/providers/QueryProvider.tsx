"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthInit } from "@/components/hooks/useAuthInit";

let queryClient: QueryClient | null = null;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Не робити refetch при поверненні фокусу на вкладку (щоб уникнути ERR_NETWORK_IO_SUSPENDED)
          refetchOnWindowFocus: false,
          // Не робити refetch при підключенні до мережі
          refetchOnReconnect: false,
          // Не робити refetch при монтуванні компонента
          refetchOnMount: true,
          // Retry логіка - не повторювати запити при мережевих помилках
          retry: (failureCount, error: any) => {
            // Не повторювати при ERR_NETWORK_IO_SUSPENDED або ERR_NETWORK_CHANGED
            if (
              error?.message?.includes("ERR_NETWORK_IO_SUSPENDED") ||
              error?.message?.includes("ERR_NETWORK_CHANGED") ||
              error?.name === "NetworkError"
            ) {
              return false;
            }
            // Для інших помилок - максимум 1 спроба
            return failureCount < 1;
          },
          // Час, протягом якого дані вважаються свіжими
          staleTime: 2 * 60 * 1000, // 2 хвилини
          // Час зберігання неактивних queries в кеші
          gcTime: 5 * 60 * 1000, // 5 хвилин
        },
      },
    });
  }
  return queryClient;
}

interface QueryProviderProps {
  children: React.ReactNode;
}

function AuthInitializer() {
  useAuthInit();
  return null;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
