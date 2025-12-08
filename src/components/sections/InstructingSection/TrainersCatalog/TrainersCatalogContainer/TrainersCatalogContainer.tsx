"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./TrainersCatalogContainer.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import TrainersGrid from "../TrainersGrid/TrainersGrid";
import { useCoachesQuery } from "@/components/hooks/useCoachesQuery";
import TrainersCatalogContainerSkeleton from "./TrainersCatalogContainerSkeleton";

interface Props {
  block: {
    subtitle: string;
    title: string;
  };
  // Якщо undefined → показуємо усіх тренерів; якщо масив (навіть порожній) → показуємо саме його
  filteredPosts?: unknown[];
}

const TrainersCatalogContainer = ({ filteredPosts }: Props) => {
  const { data: coaches = [], isLoading, isError } = useCoachesQuery();

  const [sortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(16);

  // Джерело даних: або передані відфільтровані, або повний список з бекенду
  type CoachLike = {
    id: string | number;
    name: string;
    location: string;
    specialization?: string;
    image?: string;
  };
  const sourceCoaches: CoachLike[] = useMemo(() => {
    if (Array.isArray(filteredPosts)) return filteredPosts as CoachLike[];
    return coaches as CoachLike[];
  }, [filteredPosts, coaches]);

  const sortedCoaches = useMemo(() => {
    const copy = [...sourceCoaches];
    if (sortBy === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "location")
      copy.sort((a, b) => a.location.localeCompare(b.location));
    return copy;
  }, [sourceCoaches, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedCoaches.length / itemsPerPage)
  );
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = sortedCoaches.slice(start, start + itemsPerPage);

  const trainersForGrid = pageData.map((c) => ({
    id: String(c.id),
    name: c.name,
    location: c.location,
    specialization: c.specialization ?? "",
    image: c.image ?? "",
  }));

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    setCurrentPage(1);
  }, [filteredPosts]);

  // pagination handled via SliderNav

  if (isLoading) {
    return <TrainersCatalogContainerSkeleton />;
  }

  return (
    <div className={styles.catalogContainer}>
      <div className={styles.mainContent}>
        {isError && (
          <div className={styles.error}>Не вдалося завантажити тренерів</div>
        )}
        {!isError && <TrainersGrid trainers={trainersForGrid} />}
        {totalPages > 1 && (
          <SliderNav
            activeIndex={activeIndex}
            dots={totalPages}
            onPrev={() => {
              const prev = Math.max(1, currentPage - 1);
              setCurrentPage(prev);
              setActiveIndex(prev - 1);
            }}
            onNext={() => {
              const next = Math.min(totalPages, currentPage + 1);
              setCurrentPage(next);
              setActiveIndex(next - 1);
            }}
            onDotClick={(i) => {
              const page = i + 1;
              setCurrentPage(page);
              setActiveIndex(i);
            }}
          />
        )}

        {/* Removed extra bottom pagination; SliderNav controls paging */}
      </div>
    </div>
  );
};

export default TrainersCatalogContainer;
