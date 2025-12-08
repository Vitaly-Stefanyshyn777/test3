import { useEffect } from "react";

export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyWidth = document.body.style.width;
    const prevBodyTop = document.body.style.top;

    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      const top = document.body.style.top;
      document.body.style.overflow = prevBodyOverflow || "unset";
      document.documentElement.style.overflow = prevHtmlOverflow || "unset";
      document.body.style.position = prevBodyPosition || "unset";
      document.body.style.width = prevBodyWidth || "unset";
      document.body.style.top = prevBodyTop || "unset";
      if (top) {
        const y = parseInt(top, 10) * -1;
        window.scrollTo(0, isNaN(y) ? 0 : y);
      }
    };
  }, [isOpen]);
}
