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

    // Для "overview" просто скролимо на самий верх
    if (section === "overview") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(() => {
        setIsUserClick(false);
      }, 500);
      return;
    }

    // Плавний перехід з урахуванням фіксованого хедера
    let element = document.getElementById(section);
    
    // Якщо клікнули на locations, але є контакти, скролимо до контактів
    if (section === "locations") {
      const contactsElement = document.getElementById("contacts");
      if (contactsElement) {
        element = contactsElement;
      }
    }
    
    if (element) {
      const headerHeight = 120; // Висота фіксованого хедера
      const additionalOffset = section === "gallery" ? 40 : 20; // Зменшую відступ для галереї
      // Використовуємо getBoundingClientRect для точнішого позиціонування
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - headerHeight - additionalOffset;

      window.scrollTo({
        top: Math.max(0, targetPosition),
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
      const favoriteExerciseElement =
        document.getElementById("favorite-exercise");
      const galleryElement = document.getElementById("gallery");
      const locationsElement = document.getElementById("locations");
      const contactsElement = document.getElementById("contacts");

      if (
        !favoriteExerciseElement ||
        !galleryElement ||
        !locationsElement
      )
        return;

      const scrollPosition = window.scrollY + HEADER_OFFSET;
      const currentScrollY = window.scrollY;

      const favoriteExerciseTop =
        favoriteExerciseElement.getBoundingClientRect().top + window.scrollY;
      const galleryTop =
        galleryElement.getBoundingClientRect().top + window.scrollY;
      const locationsTop =
        locationsElement.getBoundingClientRect().top + window.scrollY;
      // Якщо є контакти, використовуємо їх позицію замість locations
      const contactsTop = contactsElement
        ? contactsElement.getBoundingClientRect().top + window.scrollY
        : locationsTop;

      if (isUserClick) return;

      // Перевіряємо секції від низу до верху для правильного визначення активної
      // Перевіряємо контакти перед locations, якщо вони є
      if (contactsElement && scrollPosition >= contactsTop - LOCATIONS_EARLY) {
        if (activeSection !== "locations") setActiveSection("locations");
        return;
      }

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

      // Якщо скрол на самому верху (менше 200px) або до favorite-exercise, активуємо overview
      if (currentScrollY < 200 || scrollPosition < favoriteExerciseTop - 150) {
        if (activeSection !== "overview") setActiveSection("overview");
        return;
      }

      // За замовчуванням overview
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
          <Overview trainer={trainer} />
        </div>
      </div>

      <TrainerMap trainer={trainer} />
    </div>
  );
};
export default TrainerProfile;
