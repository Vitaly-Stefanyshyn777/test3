import React from "react";
import styles from "./PaginationNav.module.css";
import { ArrowLeftIcon, ArrowRightIcon } from "../../Icons/Icons";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  buttonBgColor?: string;
}

export default function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
  onPrev,
  onNext,
  buttonBgColor = "var(--white)",
}: PaginationNavProps) {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
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
