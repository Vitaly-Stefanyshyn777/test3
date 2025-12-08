"use client";
import React, { useState, useEffect } from "react";
import styles from "./FilterSortPanel.module.css";
import { SortArrowIcon, FilterMobileIcon } from "../../Icons/Icons";
import FilterModal from "../FilterModal/FilterModal";

interface FilterState {
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  certification: string;
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

interface FilterSortPanelProps {
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  onReset?: () => void;
  products?: Product[];
  onApply?: () => void;
}

const FilterSortPanel: React.FC<FilterSortPanelProps> = ({
  filters = {
    priceMin: 0,
    priceMax: 100000,
    colors: [],
    sizes: [],
    certification: "",
  },
  onFiltersChange = () => {},
  onReset = () => {},
  products = [],
  onApply = () => {},
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
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

  return (
    <>
      <div className={styles.filterSortPanel}>
        <div className={styles.filterSortBar}>
          {isMobile ? (
            <>
              <button
                className={styles.filterMobileButton}
                onClick={() => setIsFilterModalOpen(true)}
              >
                <FilterMobileIcon className={styles.filterMobileIcon} />
                <span className={styles.filterMobileLabel}>Фільтр</span>
              </button>
              <div className={styles.sortSection}>
                <div className={styles.sortOptionWrapper}>
                  <span className={styles.sortOptionLabel}>Сортування</span>
                  <SortArrowIcon className={styles.sortIcon} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.filterSection}>
                <span className={styles.label}>Фільтр</span>
              </div>
              <div className={styles.sortSection}>
                <div className={styles.sortOptionWrapper}>
                  <span className={styles.sortOptionLabel}>Показати по</span>
                  <SortArrowIcon className={styles.sortIcon} />
                </div>
                <div className={styles.sortOptionWrapper}>
                  <span className={styles.sortOptionLabel}>Сортування</span>
                  <SortArrowIcon className={styles.sortIcon} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {isMobile && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onReset={onReset}
          products={products}
          onApply={() => {
            onApply();
            setIsFilterModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default FilterSortPanel;
