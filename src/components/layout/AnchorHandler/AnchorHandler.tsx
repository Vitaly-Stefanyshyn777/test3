"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnchorHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Перевіряємо, чи виконується код на клієнті
    if (typeof window === "undefined") return;

    // Функція для прокрутки до елемента
    const scrollToElement = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        // Динамічно отримуємо висоту хедера
        const header = document.querySelector('header') as HTMLElement ||
                      document.querySelector('.header') as HTMLElement;
        const headerHeight = header ? header.offsetHeight : 120; // fallback 120px

        const targetPosition = el.offsetTop - headerHeight;


        // Невелика затримка для мобільних пристроїв
        setTimeout(() => {
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth", // Плавна анімація
          });

          // Перевіряємо результат через 1 секунду
          setTimeout(() => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top >= headerHeight && rect.top <= window.innerHeight;

            if (!isVisible) {
              console.log(`⚠️ AnchorHandler: Element ${id} not properly positioned, adjusting...`);
              // Додаткова корекція для мобільних
              const correction = window.innerWidth <= 1000 ? 20 : 0;
              window.scrollTo({
                top: Math.max(0, targetPosition + correction),
                behavior: "smooth",
              });
            }
          }, 1000);
        }, 50);
        return true; // Успіх!
      }
      return false; // Елемент не знайдений
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
        const loadHandler = () => checkAndScroll();
        window.addEventListener("load", loadHandler, { once: true });
        // Також пробуємо через затримку на випадок, якщо load вже відбувся
        setTimeout(checkAndScroll, 300);
      }
    };

    // Обробляємо поточний хеш тільки на головній сторінці
    if (pathname === "/") {
      handleHash();
    }

    // Слухаємо зміни hash
    const handleHashChange = () => {
      if (pathname === "/") {
        handleHash();
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  return null;
}

