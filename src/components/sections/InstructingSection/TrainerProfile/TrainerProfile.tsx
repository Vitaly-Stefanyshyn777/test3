"use client";
import React, { useState, useEffect } from "react";
import styles from "./TrainerProfile.module.css";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchTrainer } from "./utils";
import type { TrainerUser } from "./types";
import Navigation from "./Navigation";
import Overview from "./Overview";
import TrainerMap from "./TrainerMap";
import TrainerBreadcrumbs from "@/components/layout/Breadcrumbs/TrainerBreadcrumbs";
import TrainerProfileSkeleton from "./TrainerProfileSkeleton";

interface TrainerProfileProps {
  trainerId?: string;
}

type SectionType = "overview" | "gallery" | "locations" | "favorite-exercise";

const TrainerProfile = ({ trainerId }: TrainerProfileProps) => {
  const [activeSection, setActiveSection] = useState<SectionType>("overview");
  const [isUserClick, setIsUserClick] = useState(false);
  const params = useParams();
  const idFromRoute =
    typeof params?.slug === "string" ? params.slug : undefined;

  const effectiveId = trainerId || idFromRoute || "";

  const {
    data: trainer,
    isLoading,
    isError,
    error,
  } = useQuery<TrainerUser>({
    queryKey: ["trainer", effectiveId],
    queryFn: () => fetchTrainer(effectiveId),
    enabled: Boolean(effectiveId),
  });

  const handleAnchorClick = (section: SectionType) => {
    setIsUserClick(true);
    setActiveSection(section);

    // Плавний перехід з урахуванням фіксованого хедера
    const element = document.getElementById(section);
    if (element) {
      const headerHeight = 120; // Висота фіксованого хедера
      const additionalOffset = section === "gallery" ? 40 : 20; // Зменшую відступ для галереї
      const targetPosition =
        element.offsetTop - headerHeight - additionalOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      setIsUserClick(false);
    }, 500); // Збільшую затримку для кращого відстеження
  };

  useEffect(() => {
    let ticking = false;

    const HEADER_OFFSET = 150;
    const GALLERY_EARLY = 200; // Зменшую для галереї
    const LOCATIONS_EARLY = 250; // Зменшую для локацій

    const evaluateActiveSection = () => {
      const overviewElement = document.getElementById("overview");
      const favoriteExerciseElement =
        document.getElementById("favorite-exercise");
      const galleryElement = document.getElementById("gallery");
      const locationsElement = document.getElementById("locations");

      if (
        !overviewElement ||
        !favoriteExerciseElement ||
        !galleryElement ||
        !locationsElement
      )
        return;

      const scrollPosition = window.scrollY + HEADER_OFFSET;

      const favoriteExerciseTop =
        favoriteExerciseElement.getBoundingClientRect().top + window.scrollY;
      const galleryTop =
        galleryElement.getBoundingClientRect().top + window.scrollY;
      const locationsTop =
        locationsElement.getBoundingClientRect().top + window.scrollY;

      if (isUserClick) return;

      if (scrollPosition >= locationsTop - LOCATIONS_EARLY) {
        if (activeSection !== "locations") setActiveSection("locations");
        return;
      }

      if (scrollPosition >= galleryTop - GALLERY_EARLY) {
        if (activeSection !== "gallery") setActiveSection("gallery");
        return;
      }

      if (scrollPosition >= favoriteExerciseTop - 150) {
        if (activeSection !== "favorite-exercise")
          setActiveSection("favorite-exercise");
        return;
      }

      if (activeSection !== "overview") setActiveSection("overview");
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          evaluateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    evaluateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", evaluateActiveSection);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", evaluateActiveSection);
    };
  }, [activeSection, isUserClick]);

  if (!effectiveId) {
    return (
      <div className={styles.error}>
        Не передано ідентифікатор тренера. Неможливо завантажити профіль.
      </div>
    );
  }

  if (isLoading) {
    return <TrainerProfileSkeleton />;
  }

  if (isError || !trainer) {
    return (
      <div className={styles.error}>
        Не вдалося завантажити профіль тренера
        {error && <p>Помилка: {(error as Error).message}</p>}
        <p>ID тренера: {effectiveId}</p>
      </div>
    );
  }

  return (
    <div className={styles.trainerProfileWrapper}>
      <TrainerBreadcrumbs trainerName={trainer.name} />

      <div className={styles.trainerProfile}>
        <div className={styles.sidebar}>
          <Navigation
            activeSection={activeSection}
            onSectionClick={handleAnchorClick}
          />
        </div>

        <div className={styles.mainContent}>
          <div id="overview">
            <Overview trainer={trainer} />
          </div>
        </div>
      </div>

      <TrainerMap trainer={trainer} />
    </div>
  );
};
export default TrainerProfile;
