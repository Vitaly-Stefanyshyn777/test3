"use client";
import React, { useEffect, useState } from "react";
import s from "./PageLoader.module.css";

const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    // Симуляція візуального прогресу, доки відео не готове
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (isVideoReady) {
          // Якщо вже прийшла подія з відео – більше не крутимо інтервал
          clearInterval(interval);
          return prev;
        }

        // Обмежуємо прогрес, щоб не доходив до 100%, поки відео не готове
        const maxBeforeVideoReady = 92;
        if (prev >= maxBeforeVideoReady) return prev;

        // Швидше на початку, повільніше наприкінці
        const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
        return Math.min(prev + increment, maxBeforeVideoReady);
      });
    }, 50);

    // Подія, коли завантажився відеоплеєр у HeroSection
    const handleHeroVideoReady = () => {
      setIsVideoReady(true);
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    };

    // Подія, коли відео не змогло завантажитися (помилка)
    const handleHeroVideoError = () => {
      setHasVideoError(true);
      // Даємо кілька секунд, щоб відобразити помилку відео, потім ховаємо лоадер
      setTimeout(() => {
        setProgress(100);
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener("hero-video-ready", handleHeroVideoReady);
    window.addEventListener("hero-video-error", handleHeroVideoError);

    return () => {
      clearInterval(interval);
      window.removeEventListener("hero-video-ready", handleHeroVideoReady);
      window.removeEventListener("hero-video-error", handleHeroVideoError);
    };
  }, [isVideoReady, hasVideoError]);

  if (!isVisible) return null;

  return (
    <div className={s.loader}>
      <div className={s.progressBar}>
        <div
          className={s.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PageLoader;

