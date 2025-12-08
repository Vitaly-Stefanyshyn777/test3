"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./TrainersCatalog.module.css";
import TrainersHeroSection from "../TrainersHeroSection/TrainersHeroSection";
import TrainersFilter from "../TrainersFilter/TrainersFilter";
import { useTrainers } from "@/components/hooks/useTrainers";
import FilterSortPanel, { type SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";
import TrainersCatalogContainer from "../TrainersCatalogContainer/TrainersCatalogContainer";
import { useCoachesQuery } from "@/components/hooks/useCoachesQuery";
import TrainersFilterModal from "@/components/ui/TrainersFilterModal/TrainersFilterModal";
import { FilterMobileIcon, SortArrowIcon } from "@/components/Icons/Icons";
import SortDropdown from "@/components/ui/FilterSortPanel/SortDropdown";
import { SORT_OPTIONS } from "@/components/ui/FilterSortPanel/FilterSortPanel";
import { sortItems } from "@/lib/sortUtils";

const TrainersCatalog = () => {
  const { filters, updateFilters, resetFilters } = useTrainers();
  const { data: coaches = [], isLoading, isError } = useCoachesQuery();
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("popular");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

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

  // Застосовуємо сортування та пагінацію
  const sortedAndPaginatedTrainers = useMemo(() => {
    const trainersList = filteredTrainers ?? coaches;
    const sorted = sortItems(trainersList as any[], sortBy);
    return sorted.slice(0, itemsPerPage);
  }, [filteredTrainers, coaches, sortBy, itemsPerPage]);

  const handleApplyFilters = () => {
    // Логіка застосування фільтрів вже в TrainersFilter через onTrainersChange
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    resetFilters();
    setFilteredTrainers(undefined);
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
                <SortDropdown
                  label="Сортування"
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={(value) => setSortBy(value as SortType)}
                />
              </div>
            </div>
          </div>
        ) : (
          <FilterSortPanel
            sortBy={sortBy}
            onSortChange={setSortBy}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
        <div className={styles.catalogContent}>
          <TrainersFilter
            filters={filters}
            onFiltersChange={(newFilters) => updateFilters(newFilters)}
            onReset={handleResetFilters}
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
            filteredPosts={sortedAndPaginatedTrainers}
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
          onReset={handleResetFilters}
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
