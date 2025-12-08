import { useEffect } from "react";

export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) {
      // Якщо модалка закрита, відновлюємо скрол
      const top = document.body.style.top;
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (top) {
        const y = parseInt(top, 10) * -1;
        window.scrollTo(0, isNaN(y) ? 0 : y);
      }
      return;
    }

    // Зберігаємо початкові значення
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyWidth = document.body.style.width;
    const prevBodyTop = document.body.style.top;

    const scrollY = window.scrollY;

    // Блокуємо скрол
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    // Cleanup функція для відновлення скролу
    return () => {
      const top = document.body.style.top;
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevHtmlOverflow || "";
      document.body.style.position = prevBodyPosition || "";
      document.body.style.width = prevBodyWidth || "";
      document.body.style.top = prevBodyTop || "";
      if (top) {
        const y = parseInt(top, 10) * -1;
        window.scrollTo(0, isNaN(y) ? 0 : y);
      }
    };
  }, [isOpen]);
}
