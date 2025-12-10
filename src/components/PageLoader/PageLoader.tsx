"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./PageLoader.module.css";

const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Початкове завантаження (гідрація завершилась)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Перехід між сторінками (відстеження зміни pathname)
  useEffect(() => {
    // Показуємо лоадер при зміні маршруту
    setIsVisible(true);
    setProgress(0);

    // Симуляція прогресу під час переходу
    const interval = setInterval(() => {
      setProgress((prev) => {
        const maxBeforeLoad = 90;
        if (prev >= maxBeforeLoad) return prev;
        const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
        return Math.min(prev + increment, maxBeforeLoad);
      });
    }, 50);

    // Завершуємо завантаження після невеликої затримки (час на гідрацію нової сторінки)
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }, 400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [pathname]);

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

