"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined") {
          return;
        }
        if (token) {
          const response = await fetch("/api/set-user-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          // Синхронізуємо токен у localStorage для клієнтських запитів axios
          try {
            localStorage.setItem("bfb_token", token);
            // лишаємо сумісність зі старими ключами
            localStorage.setItem("bfb_token_old", token);
          } catch {}
        }
      } catch (error) {
        // Silent error handling
      }
    })();
  }, [token]);

  return <>{children}</>;
}
