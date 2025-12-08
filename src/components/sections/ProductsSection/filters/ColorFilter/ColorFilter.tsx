"use client";
import React, { useState } from "react";
import styles from "./ColorFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  useProductAttributesQuery,
  useAttributeTermsQuery,
} from "@/components/hooks/useWpQueries";

interface ColorFilterProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  products: Product[];
  loading?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  image: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stockStatus: string;
}

type Term = { id: number; name: string; slug: string; count?: number };

export const ColorFilter = ({ selectedColors, onChange, loading }: ColorFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: attrs = [], isLoading, isError } = useProductAttributesQuery();
  
  const showSkeleton = loading || isLoading;
  const colorAttr = (attrs || []).find((a) => {
    const slug = (a.slug || "").toLowerCase();
    const name = (a.name || "").toLowerCase();
    return (
      slug === "pa_color" ||
      slug.endsWith("_color") ||
      slug === "color" ||
      name === "color"
    );
  });
  const colorAttrId = colorAttr?.id ?? 0;
  const { data: termsData = [] } = useAttributeTermsQuery(
    colorAttrId,
    !!colorAttrId
  );
  // Обчислюємо terms на льоту без useEffect
  const terms = (termsData || []) as Term[];

  const handleColorToggle = (idOrSlug: string) => {
    // Toggle behavior: if already selected, remove it; if not selected, add it
    if (selectedColors.includes(idOrSlug)) {
      // Second click: remove from selection
      onChange(selectedColors.filter((c) => c !== idOrSlug));
    } else {
      // First click: add to selection
      onChange([...selectedColors, idOrSlug]);
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
        <h3 className={styles.sectionTitle}>Оберіть колір</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </div>
      <div
        className={`${styles.sectionContent} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {showSkeleton ? (
          <div className={styles.colorList}>
            {[...Array(3)].map((_, i) => {
              const widths = [120, 110, 100]; // Фіксовані ширини замість Math.random()
              return (
                <div key={i} className={styles.colorItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Skeleton width={24} height={24} borderRadius={8} />
                    <Skeleton width={widths[i]} height={16} />
                  </div>
                  <Skeleton width={30} height={16} />
                </div>
              );
            })}
          </div>
        ) : isError ? (
          <div className={styles.error}>Помилка завантаження</div>
        ) : (
          <div className={styles.colorList}>
            {terms.map((term) => {
              const slug = (term.slug || "").toLowerCase();
              const name = (term.name || "").toLowerCase();
              const colorHexByKey: Record<string, string> = {
                beige: "#F5F5DC",
                green: "#4CAF50",
                white: "#FFFFFF",
                red: "#F44336",
                blue: "#2196F3",
                black: "#000000",
                grey: "#9E9E9E",
                gray: "#9E9E9E",
                brown: "#795548",
                pink: "#E91E63",
                purple: "#9C27B0",
                yellow: "#FFEB3B",
                orange: "#FF9800",
              };
              const key = slug || name;
              const swatchColor = colorHexByKey[key] || "#EEEEEE";
              const isWhite = key === "white" || swatchColor === "#FFFFFF";

              const count: number | undefined = term.count;

              const inputId = `color-${term.id}`;
              return (
                <label
                  key={term.id}
                  htmlFor={inputId}
                  className={styles.colorItem}
                >
                  <input
                    type="checkbox"
                    id={inputId}
                    checked={selectedColors.includes(String(term.id))}
                    onChange={() => handleColorToggle(String(term.id))}
                    className={styles.colorCheckbox}
                    aria-label={`Обрати колір ${term.name}`}
                  />
                  <div
                    className={`${styles.colorSwatch} ${
                      selectedColors.includes(String(term.id))
                        ? styles.selected
                        : ""
                    } ${isWhite ? styles.whiteColor : ""}`}
                    style={{ backgroundColor: swatchColor }}
                  />
                  <span className={styles.colorName}>{term.name}</span>
                  {typeof count === "number" && (
                    <span className={styles.colorCount}>{count}</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
