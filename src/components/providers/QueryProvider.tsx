"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthInit } from "@/components/hooks/useAuthInit";

let queryClient: QueryClient | null = null;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient();
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
