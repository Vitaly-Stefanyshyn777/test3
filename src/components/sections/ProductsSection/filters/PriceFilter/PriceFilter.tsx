"use client";
import React from "react";
import styles from "./PriceFilter.module.css";

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

const PriceFilter = ({ minPrice, maxPrice, onChange }: PriceFilterProps) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange(value, maxPrice);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 100000;
    onChange(minPrice, value);
  };

  return (
    <div className={styles.priceFilter}>
      <h3 className={styles.filterTitle}>Фільтрувати за ціною</h3>
      <div className={styles.priceInputs}>
        <input
          type="number"
          value={minPrice}
          onChange={handleMinChange}
          placeholder="від"
          className={styles.priceInput}
        />
        <span className={styles.priceSeparator}>-</span>
        <input
          type="number"
          value={maxPrice}
          onChange={handleMaxChange}
          placeholder="до"
          className={styles.priceInput}
        />
      </div>
      <div className={styles.priceRange}>
        <input
          type="range"
          min="0"
          max="100000"
          value={minPrice}
          onChange={(e) => onChange(parseInt(e.target.value), maxPrice)}
          className={styles.rangeSlider}
        />
      </div>
    </div>
  );
};

export { PriceFilter };
