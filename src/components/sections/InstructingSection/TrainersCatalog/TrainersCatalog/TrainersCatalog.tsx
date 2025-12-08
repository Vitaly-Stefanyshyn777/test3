"use client";
import React, { useState, useEffect } from "react";
import styles from "./TrainersCatalog.module.css";
import TrainersHeroSection from "../TrainersHeroSection/TrainersHeroSection";
import TrainersFilter from "../TrainersFilter/TrainersFilter";
import { useTrainers } from "@/components/hooks/useTrainers";
import FilterSortPanel from "@/components/ui/FilterSortPanel/FilterSortPanel";
import TrainersCatalogContainer from "../TrainersCatalogContainer/TrainersCatalogContainer";
import { useCoachesQuery } from "@/components/hooks/useCoachesQuery";
import TrainersFilterModal from "@/components/ui/TrainersFilterModal/TrainersFilterModal";
import { FilterMobileIcon, SortArrowIcon } from "@/components/Icons/Icons";

const TrainersCatalog = () => {
  const { filters, updateFilters, resetFilters } = useTrainers();
  const { data: coaches = [], isLoading, isError } = useCoachesQuery();
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

  const trainers = coaches.map((c) => ({ location: c.location }));
  const searchTerm = "";

  // Динамічно оновлюваний список тренерів після застосування фільтрів
  // undefined означає, що фільтри ще не застосовувались і слід показувати дефолтний список
  const [filteredTrainers, setFilteredTrainers] = useState<
    unknown[] | undefined
  >(undefined);

  const handleApplyFilters = () => {
    // Логіка застосування фільтрів вже в TrainersFilter через onTrainersChange
    setIsFilterModalOpen(false);
  };

  return (
    <div className={styles.trainersCatalog}>
      <TrainersHeroSection />

      <div className={styles.catalogContentBlock}>
        {isMobile ? (
          <div className={styles.filterSortPanel}>
            <div className={styles.filterSortBar}>
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
            </div>
          </div>
        ) : (
          <FilterSortPanel />
        )}
        <div className={styles.catalogContent}>
          <TrainersFilter
            filters={filters}
            onFiltersChange={(newFilters) => updateFilters(newFilters)}
            onReset={resetFilters}
            onTrainersChange={(items) =>
              setFilteredTrainers(items as unknown[])
            }
            trainers={trainers}
            searchTerm={searchTerm}
          />
          <TrainersCatalogContainer
            block={{
              subtitle: "Наші тренери",
              title: "Каталог тренерів",
            }}
            filteredPosts={filteredTrainers}
          />
          {isError && (
            <div className={styles.error}>Не вдалося завантажити тренерів</div>
          )}
          {isLoading && <div className={styles.loading}>Завантаження…</div>}
        </div>
      </div>
      {isMobile && (
        <TrainersFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onFiltersChange={(newFilters) => updateFilters(newFilters)}
          onReset={resetFilters}
          trainers={trainers}
          searchTerm={searchTerm}
          onApply={handleApplyFilters}
          onTrainersChange={(items) =>
            setFilteredTrainers(items as unknown[])
          }
        />
      )}
    </div>
  );
};

export default TrainersCatalog;
