import React from "react";
import styles from "./PaginationNavSubscriptionCurrent.module.css";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons/Icons";

interface PaginationNavSubscriptionCurrentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  buttonBgColor?: string;
}

export default function PaginationNavSubscriptionCurrent({
  currentPage,
  totalPages,
  onPageChange,
  onPrev,
  onNext,
  buttonBgColor = "var(--white)",
}: PaginationNavSubscriptionCurrentProps) {
  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 3) {
      // Якщо всього 3 або менше сторінок - показуємо всі
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Завжди показуємо: 1, 2, 3, ..., останній номер
      pages.push(1);
      pages.push(2);
      pages.push(3);
      pages.push("..");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={styles.navContainer}>
      <button
        className={styles.leftBtn}
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Previous page"
        style={{ background: buttonBgColor }}
      >
        <ArrowLeftIcon />
      </button>

      <div className={styles.pagesBlock}>
        {visiblePages.map((page, idx) => (
          <span
            key={idx}
            className={`${styles.pageNumber} ${
              page === currentPage ? styles.activePage : ""
            } ${page === "..." ? styles.ellipsis : ""}`}
            onClick={() => typeof page === "number" && onPageChange(page)}
          >
            {page}
          </span>
        ))}
      </div>

      <button
        className={styles.rightBtn}
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        style={{ background: buttonBgColor }}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
}
