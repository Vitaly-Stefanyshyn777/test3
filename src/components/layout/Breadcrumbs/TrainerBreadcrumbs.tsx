"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumbs.module.css";

interface TrainerBreadcrumbsProps {
  trainerName?: string;
}

const TrainerBreadcrumbs: React.FC<TrainerBreadcrumbsProps> = ({
  trainerName,
}) => {
  const pathname = usePathname();
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const isTrainerPage =
    pathname.includes("/trainers/") && pathname.split("/").length > 2;

  // Відстеження стану модалки InstructingSlider
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSliderState = () => {
      setIsSliderOpen(
        document.body.classList.contains("instructing-slider-open")
      );
    };

    checkSliderState();

    const observer = new MutationObserver(checkSliderState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!isTrainerPage) {
    return null;
  }

  // Приховуємо breadcrumbs, коли відкритий InstructingSlider
  if (isSliderOpen) {
    return null;
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Хлібні крихти">
      <div className={styles.breadcrumbsContainer}>
        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <Link href="/" className={styles.breadcrumbLink}>
              Головна
            </Link>
            <span className={styles.separator}>•</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <Link href="/trainers" className={styles.breadcrumbLink}>
              Знайди тренера
            </Link>
            <span className={styles.separator}>•</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <span className={`${styles.breadcrumbText} ${styles.active}`}>
              {trainerName || "Профіль тренера"}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
};

export default TrainerBreadcrumbs;
