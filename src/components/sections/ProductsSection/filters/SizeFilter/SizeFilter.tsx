"use client";
import React, { useState } from "react";
import styles from "./SizeFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  useProductAttributesQuery,
  useAttributeTermsQuery,
} from "@/components/hooks/useWpQueries";

interface SizeFilterProps {
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
  loading?: boolean;
}

export const SizeFilter = ({ selectedSizes, onChange, loading }: SizeFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: attrs = [], isLoading, isError } = useProductAttributesQuery();
  
  const showSkeleton = loading || isLoading;
  const sizeAttr = (attrs || []).find((a) => {
    const slug = (a.slug || "").toLowerCase();
    const name = (a.name || "").toLowerCase();
    return (
      slug === "pa_size" ||
      slug.endsWith("_size") ||
      slug === "size" ||
      name === "size"
    );
  });
  const sizeAttrId = sizeAttr?.id ?? 0;
  const { data: termsData = [] } = useAttributeTermsQuery(
    sizeAttrId,
    !!sizeAttrId
  );

  // Обчислюємо terms на льоту без useEffect
  const terms = [...(termsData || [])].reverse() as Array<{
    id: number;
    name: string;
    slug: string;
  }>;

  const handleSizeToggle = (size: string) => {
    // Toggle behavior: if already selected, remove it; if not selected, add it
    if (selectedSizes.includes(size)) {
      // Second click: remove from selection
      onChange(selectedSizes.filter((s) => s !== size));
    } else {
      // First click: add to selection
      onChange([...selectedSizes, size]);
    }
  };

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${styles.filterSection} ${
        !isExpanded ? styles.collapsedSection : ""
      }`}
    >
      <div className={styles.sectionTitleContainer} onClick={toggleSection}>
        <h3 className={styles.sectionTitle}>Оберіть розмір</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </div>
      <div
        className={`${styles.sectionContent} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {showSkeleton ? (
          <div className={styles.sizeButtons}>
            {[...Array(3)].map((_, i) => {
              const widths = [90, 100, 85]; // Фіксовані ширини замість Math.random()
              return (
                <Skeleton key={i} width={widths[i]} height={40} borderRadius={8} />
              );
            })}
          </div>
        ) : isError ? (
          <div className={styles.error}>Помилка завантаження</div>
        ) : (
          <div className={styles.sizeButtons}>
            {terms.map((term) => (
              <button
                key={term.id}
                className={`${styles.sizeButton} ${
                  selectedSizes.includes(term.slug) ? styles.selected : ""
                }`}
                onClick={() => handleSizeToggle(term.slug)}
              >
                {term.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
