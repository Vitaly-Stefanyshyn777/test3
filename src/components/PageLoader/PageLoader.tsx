"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./PageLoader.module.css";

const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  const checkReady = () => {
    const hero = document.querySelector("[data-hero-section]");
    if (!hero) return false;

    const banner =
      hero.querySelector('[class*="heroBanner"]') ||
      hero.querySelector('[class*="swiper"]');

    if (!banner) return false;

    const styles = getComputedStyle(banner);
    const height = parseInt(styles.height);

    return height > 0;
  };

  const hideLoader = () => {
    setProgress(100);
    setTimeout(() => setIsVisible(false), 300);
  };

  useEffect(() => {
    // при зміні маршруту знову показуємо
    setIsVisible(true);
    setProgress(0);

    if (checkReady()) {
      hideLoader();
      return;
    }

    let done = false;

    const finish = () => {
      if (done) return;
      done = true;

      clearInterval(progressInterval);
      clearInterval(checkInterval);
      observer.disconnect();
      clearTimeout(fallback);

      hideLoader();
    };

    // плавний прогрес
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const step = p < 50 ? 10 : p < 80 ? 5 : 2;
        return Math.min(p + step, 90);
      });
    }, 60);

    // слідкуємо за DOM
    const observer = new MutationObserver(() => {
      if (checkReady()) finish();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // періодична перевірка
    const checkInterval = setInterval(() => {
      if (checkReady()) finish();
    }, 80);

    // запасний таймер
    const fallback = setTimeout(finish, 8000);

    return () => {
      done = true;
      clearInterval(progressInterval);
      clearInterval(checkInterval);
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className={s.loader}>
      <div className={s.progressBar}>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default PageLoader;
