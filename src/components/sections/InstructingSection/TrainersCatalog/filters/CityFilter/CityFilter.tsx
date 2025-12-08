"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./CityFilter.module.css";
import { DandruffIcon, MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import { fetchTrainersWithLogging } from "@/lib/bfbApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CityFilterProps {
  value: string;
  selectedCities: string[];
  onCityChange: (value: string) => void;
  onToggleCity: (cities: string[]) => void;
  trainers?: { location?: string }[];
  searchTerm?: string;
}

export const CityFilter = ({
  value,
  selectedCities,
  onCityChange,
  onToggleCity,
}: CityFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  // Статичні міста як fallback
  const fallbackCities = useMemo(
    () => [
      "Київ",
      "Вінниця",
      "Дніпро",
      "Донецьк",
      "Житомир",
      "Запоріжжя",
      "Івано-Франківськ",
      "Київська область",
      "Кропивницький",
      "Луганськ",
      "Луцьк",
      "Львів",
      "Миколаїв",
      "Одеса",
      "Полтава",
      "Рівне",
      "Суми",
      "Тернопіль",
      "Ужгород",
      "Харків",
      "Херсон",
      "Хмельницький",
      "Черкаси",
      "Чернівці",
      "Чернігів",
    ],
    []
  );

  const loadCities = useCallback(async () => {
    try {
      setLoading(true);
      // Отримуємо тренерів без фільтрів щоб витягти унікальні міста
      const trainers = await fetchTrainersWithLogging({});

      // Витягуємо унікальні міста з тренерів
      const uniqueCities = [
        ...new Set(
          trainers
            .map((trainer) => trainer.acf?.location_city)
            .filter((city) => city && city.trim() !== "")
        ),
      ] as string[];

      if (uniqueCities.length > 0) {
        setCities(uniqueCities);
      } else {
        setCities(fallbackCities);
      }
    } catch (error) {
      setCities(fallbackCities);
    } finally {
      setLoading(false);
    }
  }, [fallbackCities]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const filteredCities = useMemo(() => {
    if (!value.trim()) {
      return cities;
    }
    return cities.filter((city) =>
      city.toLowerCase().includes(value.toLowerCase())
    );
  }, [cities, value]);

  const handleToggle = async (city: string) => {
    const newCities = selectedCities.includes(city)
      ? selectedCities.filter((c) => c !== city)
      : [...selectedCities, city];

    onToggleCity(newCities);
  };

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, filteredCities.length));
  };

  const hideAll = () => {
    setVisibleCount(4);
  };

  const visibleCities = filteredCities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCities.length;
  const showHideButton =
    visibleCount >= filteredCities.length && filteredCities.length > 4;

  return (
    <div
      className={`${styles.filterSection} ${
        isExpanded ? styles.expandedSection : styles.collapsed
      }`}
    >
      <div className={styles.sectionTitleContainer} onClick={toggleSection}>
        <h3 className={styles.sectionTitle}>Місто</h3>
        {isExpanded ? (
          <MinuswIcon className={styles.minusIcon} />
        ) : (
          <PlusIcon className={styles.plusIcon} />
        )}
      </div>

      <div
        className={`${styles.sectionContent} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        <div className={styles.cityInputContainer}>
          <DandruffIcon className={styles.inputIcon} />
          <input
            type="text"
            placeholder="Введіть назву міста"
            value={value}
            onChange={(e) => onCityChange(e.target.value)}
            className={styles.cityInput}
          />
        </div>

        {loading ? (
          <div className={styles.checkboxGroup}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Skeleton width={20} height={20} borderRadius={3} />
                <Skeleton width={120} height={16} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.checkboxGroup}>
            {visibleCities.map((city) => (
              <label key={city} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCities.includes(city)}
                  onChange={() => {
                    handleToggle(city);
                  }}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxText}>{city}</span>
              </label>
            ))}
          </div>
        )}

        <div className={styles.buttonsContainer}>
          {hasMore && (
            <button className={styles.showMoreBtn} onClick={showMore}>
              Показати ще
            </button>
          )}

          {showHideButton && (
            <button className={styles.hideBtn} onClick={hideAll}>
              Сховати
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
