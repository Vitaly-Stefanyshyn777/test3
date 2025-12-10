"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HomeAnchorHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Перевіряємо, чи виконується код на клієнті
    if (typeof window === "undefined") return;

    // Функція для прокрутки до елемента
    const scrollToElement = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        const headerHeight = 120; // Висота фіксованого хедера
        const targetPosition = el.offsetTop - headerHeight;

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth",
        });
        return true;
      }
      return false;
    };

    // Функція для обробки хешу
    const handleHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const id = hash.substring(1);
      if (!id) return;

      // Спробуємо прокрутити одразу
      if (scrollToElement(id)) return;

      // Якщо елемент ще не завантажений, чекаємо на готовність DOM
      const checkAndScroll = () => {
        if (scrollToElement(id)) return;
        
        // Спробуємо ще раз через невелику затримку
        setTimeout(() => {
          scrollToElement(id);
        }, 200);
      };

      // Перевіряємо готовність DOM
      if (document.readyState === "complete") {
        checkAndScroll();
      } else {
        window.addEventListener("load", checkAndScroll, { once: true });
        // Також пробуємо через затримку на випадок, якщо load вже відбувся
        setTimeout(checkAndScroll, 300);
      }
    };

    // Обробляємо поточний хеш
    handleHash();

    // Слухаємо зміни hash
    const handleHashChange = () => {
      handleHash();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("load", handleHash);
    };
  }, [pathname]);

  return null;
}

