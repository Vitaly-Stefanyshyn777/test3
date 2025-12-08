"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./CountryFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import { fetchTrainersWithLogging } from "@/lib/bfbApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CountryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const CountryFilter = ({ value, onChange }: CountryFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

  // Статичні країни як fallback
  const fallbackCountries = useMemo(
    () => ["Україна", "Польща", "Німеччина", "Чехія", "Словаччина"],
    []
  );

  const loadCountries = useCallback(async () => {
    try {
      setLoading(true);

      // Отримуємо тренерів без фільтрів щоб витягти унікальні країни
      const trainers = await fetchTrainersWithLogging({});

      // Витягуємо унікальні країни з тренерів
      const uniqueCountries = [
        ...new Set(
          trainers
            .map((trainer) => trainer.acf?.location_country)
            .filter((country) => country && country.trim() !== "")
        ),
      ] as string[];

      if (uniqueCountries.length > 0) {
        setCountries(uniqueCountries);
      } else {
        setCountries(fallbackCountries);
      }
    } catch {
      setCountries(fallbackCountries);
    } finally {
      setLoading(false);
    }
  }, [fallbackCountries]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleCountryChange = (selectedCountry: string) => {
    onChange(selectedCountry);
  };

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${styles.filterSection} ${
        !isExpanded ? styles.collapsed : ""
      }`}
    >
      <div className={styles.sectionTitleContainer} onClick={toggleSection}>
        <h3 className={styles.sectionTitle}>Країна</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </div>

      <div
        className={`${styles.sectionContent} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {loading ? (
          <div className={styles.radioGroup}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Skeleton width={20} height={20} borderRadius={10} />
                <Skeleton width={120} height={16} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.radioGroup}>
            {countries.map((country) => {
              const isSelected = value === country;
              const inputId = `country-${country
                .toLowerCase()
                .replace(/\s+/g, "-")}`;
              return (
                <label
                  key={country}
                  htmlFor={inputId}
                  className={`${styles.radioLabel} ${
                    isSelected ? styles.selected : ""
                  }`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    name="country"
                    value={country}
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        handleCountryChange("");
                      } else {
                        handleCountryChange(country);
                      }
                    }}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCircle} aria-hidden="true" />

                  <span className={styles.radioText}>{country}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
