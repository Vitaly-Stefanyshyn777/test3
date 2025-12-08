"use client";

import { useEffect } from "react";

export default function AdminAutoLogin() {
  useEffect(() => {
    const run = async () => {
      try {
        const probe = await fetch(
          "/api/proxy?path=" +
            encodeURIComponent("/wp-json/wp/v2/users?per_page=1"),
          {
            method: "GET",
            cache: "no-store",
            headers: { "x-internal-admin": "1" },
          }
        );

        if (probe.ok) {
          return;
        }

        // 1) Отримуємо admin JWT у httpOnly cookie
        await fetch("/api/admin-login", { method: "POST" });
        // 2) Також отримуємо wp_jwt у httpOnly cookie для WC ендпоінтів
        await fetch("/api/auth/wp-token", { method: "GET", cache: "no-store" });
        // Невелика пауза, щоб кукі застосувалися для подальших серверних хендлерів
        await new Promise((r) => setTimeout(r, 250));
      } catch {}
    };

    run();

    // Періодичне поновлення httpOnly токенів, щоб уникати 401/403
    // admin-login: maxAge ~= 12h; wp-token: ~= 24h — оновлюємо значно частіше
    const intervalMs = 10 * 60 * 1000; // кожні 10 хвилин
    const intervalId = setInterval(async () => {
      try {
        await fetch("/api/admin-login", { method: "POST" });
      } catch {}
      try {
        await fetch("/api/auth/wp-token", { method: "GET", cache: "no-store" });
      } catch {}
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return null;
}
