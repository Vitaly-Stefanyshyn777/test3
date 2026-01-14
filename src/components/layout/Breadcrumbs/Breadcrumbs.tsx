"use client";

import React, { useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import styles from "./Breadcrumbs.module.css";
import { useProductQuery } from "@/components/hooks/useProductsQuery";
import { useCourseQuery } from "@/lib/coursesQueries";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [is404Page, setIs404Page] = useState(false);

  // Якщо ми на сторінці продукту /products/[slug] — підтягнемо назву
  const productSlugMatch = pathname.match(/^\/products\/(.+)$/);
  const productSlug = productSlugMatch?.[1] || "";
  // Викликаємо useProductQuery тільки якщо є slug (не порожній)
  const { data: productData } = useProductQuery(productSlug || "skip");

  // Якщо ми на сторінці курсу /courses/[slug] — підтягнемо назву
  const courseSlugMatch = pathname.match(/^\/courses\/(.+)$/);
  const courseSlug = courseSlugMatch?.[1] || "";
  // Викликаємо useCourseQuery тільки якщо є slug (не порожній)
  const { data: courseData } = useCourseQuery(courseSlug || "skip");

  // Перевіряємо чи це 404 сторінка
  React.useEffect(() => {
    const checkFor404Page = () => {
      if (typeof window !== "undefined" && document.querySelector('[data-page="404"]')) {
        setIs404Page(true);
      } else {
        setIs404Page(false);
      }
    };

    checkFor404Page();
    const timeoutId = setTimeout(checkFor404Page, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Обробка кліку на breadcrumb item
  const handleBreadcrumbClick = (item: BreadcrumbItem, e: React.MouseEvent) => {
    // Якщо це "Інвентар" і ми на сторінці products - скидаємо фільтри та перенаправляємо на категорію "30"
    if (item.label === "Інвентар" && pathname.startsWith("/products")) {
      e.preventDefault();
      // Перенаправляємо на /products?category=30 (Товари для спорту)
      router.push("/products?category=30");
    }
    // Для інших випадків використовуємо стандартну навігацію через Link
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({ label: "Головна", href: "/" });

    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      let label = segment;

      if (segment === "trainers") {
        label = "Знайди тренера";
      } else if (segment === "#LearningFormats" || segment === "#LearningMobileFormats") {
        label = "Навчання B.F.B";
      } else if (segment === "courses-landing") {
        label = "Інструкторство BFB";
      } else if (segment === "courses") {
        label = "Онлайн тренування";
      } else if (segment === "course") {
        label = "Основи тренерства BFB";
      } else if (segment === "our-courses") {
        label = "Навчальні програми";
      } else if (segment === "inventory" || segment === "products") {
        label = "Інвентар";
      } else if (segment === "workshops") {
        label = "Воркшопи";
      } else if (segment === "about") {
        label = "Про нас";
      } else if (segment === "about-bfb") {
        label = "Про B.F.B";
      } else if (segment === "oferta") {
        label = "Договір (оферта)";
      } else if (segment === "privacy-policy") {
        label = "Політика конфіденційності";
      } else if (segment === "contact" || segment === "contacts") {
        label = "Контакти";
      } else if (segments[0] === "products" && index === 1) {
        // Сторінка продукту: замінити slug/ID на назву товару
        // Декодуємо segment, якщо він encoded
        let decodedSegment = segment;
        try {
          decodedSegment = decodeURIComponent(segment);
        } catch {
          // Якщо не вдалося декодувати, використовуємо як є
        }

        // Використовуємо назву продукту, якщо вона доступна
        if (productData?.name) {
          label = productData.name;
        } else {
          // Якщо назва недоступна, використовуємо декодований segment
          label = decodedSegment;
        }
      } else if (segments[0] === "courses" && index === 1) {
        // Сторінка курсу: замінити slug/ID на назву курсу
        // Декодуємо segment, якщо він encoded
        let decodedSegment = segment;
        try {
          decodedSegment = decodeURIComponent(segment);
        } catch {
          // Якщо не вдалося декодувати, використовуємо як є
        }

        // Використовуємо назву курсу, якщо вона доступна
        if (courseData?.name) {
          label = courseData.name;
        } else {
          // Якщо назва недоступна, використовуємо декодований segment
          label = decodedSegment;
        }
      }
      const isActive = index === segments.length - 1;

      breadcrumbs.push({
        label,
        href: isActive ? undefined : currentPath,
        isActive,
      });
    });

    return breadcrumbs;
  };

  let breadcrumbs = generateBreadcrumbs();

  // Спеціальна логіка для сторінки 404
  if (typeof window !== "undefined" && document.querySelector('[data-page="404"]')) {
    breadcrumbs = [
      { label: "Головна", href: "/" },
      { label: "404", isActive: true }
    ];
  }

  // Додаємо дочірню категорію Інвентар у /products?category=...
  if (pathname === "/products") {
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const map: Record<string, string> = {
        "30": "Товари для спорту",
        "inventory-boards": "Борди",
        "inventory-accessories": "Аксесуари",
        girya: "Гантелі",
      };
      const label = map[categorySlug];
      if (label) {
        // Робимо /products неактивним посиланням та додаємо активну категорію
        if (breadcrumbs.length > 0) {
          const last = breadcrumbs[breadcrumbs.length - 1];
          last.isActive = false;
          last.href = "/products";
          // Змінюємо назву з "Інвентар" на "Інвентар"
          last.label = "Інвентар";
        }
        breadcrumbs.push({ label, isActive: true });
      } else {
        // Якщо категорія не знайдена в мапі, змінюємо назву останнього елемента
        if (breadcrumbs.length > 0) {
          const last = breadcrumbs[breadcrumbs.length - 1];
          last.label = "Інвентар";
        }
      }
    } else {
      // Якщо немає category параметра, змінюємо назву з "Інвентар" на "Інвентар"
      if (breadcrumbs.length > 0) {
        const last = breadcrumbs[breadcrumbs.length - 1];
        last.label = "Інвентар";
      }
    }
  }

  // Визначення мобільної версії - використовуємо useLayoutEffect для швидшого оновлення
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  // Відстеження стану модалки InstructingSlider - використовуємо useLayoutEffect
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const checkSliderState = () => {
      const hasClass = document.body.classList.contains(
        "instructing-slider-open"
      );
      setIsSliderOpen(hasClass);
    };

    // Перевіряємо одразу
    checkSliderState();

    // Спостерігаємо за змінами
    const observer = new MutationObserver(checkSliderState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: false,
    });

    // Також перевіряємо через інтервал для надійності
    const interval = setInterval(checkSliderState, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Відстеження стану модалки EventsSection - використовуємо useLayoutEffect
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const checkEventsModalState = () => {
      const hasClass = document.body.classList.contains("events-modal-open");
      setIsEventsModalOpen(hasClass);
    };

    // Перевіряємо одразу
    checkEventsModalState();

    // Спостерігаємо за змінами
    const observer = new MutationObserver(checkEventsModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: false,
    });

    // Також перевіряємо через інтервал для надійності
    const interval = setInterval(checkEventsModalState, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Перевірка безпосередньо в рендері для надійності
  const shouldHide =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1000px)").matches &&
    (document.body.classList.contains("instructing-slider-open") ||
      document.body.classList.contains("events-modal-open"));

  // Додаємо клас для приховування, коли модалка відкрита
  const isHidden =
    shouldHide || (isMobile && (isSliderOpen || isEventsModalOpen));
  const navRef = useRef<HTMLElement>(null);

  // Додаємо/видаляємо клас безпосередньо до DOM елемента
  useLayoutEffect(() => {
    if (!navRef.current) return;

    if (isHidden) {
      navRef.current.style.display = "none";
    } else {
      navRef.current.style.display = "";
    }
  }, [isHidden]);

  if (
    pathname === "/" ||
    pathname === "/order-success" ||
    pathname === "/checkout" ||
    pathname.startsWith("/profile") ||
    (pathname.includes("/trainers/") && pathname !== "/trainers")
  ) {
    return null;
  }

  const isTrainersList = pathname === "/trainers";
  const isOurCourses = pathname.startsWith("/our-courses");
  const isCoursesLanding =
    pathname.startsWith("/courses-landing") ||
    pathname.startsWith("/our-courses");
  const isAboutBfb = pathname === "/about-bfb";
  const isContacts = pathname === "/contacts" || pathname === "/contact";

  return (
    <nav
      ref={navRef}
      className={`${styles.breadcrumbs} ${
        isTrainersList ? styles.onTrainers : ""
      } ${isOurCourses ? styles.onOurCourses : ""} ${
        isCoursesLanding ? styles.onCoursesLanding : ""
      } ${isContacts ? styles.onContacts : ""} ${
        isAboutBfb ? styles.onAboutBfb : ""
      } ${is404Page ? styles.on404 : ""} ${
        isHidden ? styles.hidden : ""
      }`}
      aria-label="Хлібні крихти"
    >
      <div className={styles.breadcrumbsContainer}>
        <ol className={styles.breadcrumbList}>
          {breadcrumbs.map((item, index) => (
            <li key={index} className={styles.breadcrumbItem}>
              {item.href && !item.isActive ? (
                <Link
                  href={item.href}
                  className={styles.breadcrumbLink}
                  onClick={(e) => handleBreadcrumbClick(item, e)}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${styles.breadcrumbText} ${
                    item.isActive ? styles.active : ""
                  }`}
                >
                  {item.label}
                </span>
              )}

              {index < breadcrumbs.length - 1 && (
                <span className={styles.separator}>•</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
