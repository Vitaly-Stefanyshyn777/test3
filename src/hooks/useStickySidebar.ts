"use client";
import { useState, useEffect } from "react";

export const useStickySidebar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [shouldStick, setShouldStick] = useState(true);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const headerHeight = 120;
          const offsetMargin = 20;

          const sidebar = document.querySelector(
            "[data-sidebar]"
          ) as HTMLElement;
          const mainContent = document.querySelector(
            "[data-main-content]"
          ) as HTMLElement;
          if (!sidebar || !mainContent) return;

          const sidebarRect = sidebar.getBoundingClientRect();
          const mainRect = mainContent.getBoundingClientRect();

          const atTop = sidebarRect.top <= headerHeight + offsetMargin;
          const atBottom = sidebarRect.bottom + offsetMargin >= mainRect.bottom;

          setIsSticky((prev) =>
            prev !== (atTop && !atBottom) ? atTop && !atBottom : prev
          );
          setShouldStick((prev) => (prev !== !atBottom ? !atBottom : prev));

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // ініціалізація
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isSticky, shouldStick };
};
