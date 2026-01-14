"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import s from "./Hero.module.css";
import { TimeIcon } from "@/components/Icons/Icons";

const Hero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Визначення мобільної версії
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  // Функція для отримання правильного якоря
  const getLearningFormatsAnchor = () => {
    return isMobile ? "/#LearningMobileFormats" : "/#LearningFormats";
  };

  return (
    <section className={s.infoSection}>
      <div className={s.container}>
        <div className={s.infoBlock}>
          <div className={s.imageContent}>
            <Image
              src="/images/Frame132131812611.png"
              alt="Як проходить навчання"
              width={500}
              height={600}
              className={s.courseImage}
            />
          </div>
          <div className={s.textContent}>
            <div className={s.badgeContainer}>
              <div className={s.badgeBlock}>
                <span className={s.badge}>
                  <TimeIcon />
                  <p className={s.badgeText}> окупність за 1 місяць</p>
                </span>

                <h2 className={s.title}>
                  Стань новим
                  <br />
                  сертифікованим тренером
                </h2>
              </div>

              <p className={s.description}>
                Долучайся до спільноти, що змінює підхід до тренувань, і отримуй
                не лише інвентар, а й методику, платформу, знання та людей, з
                якими хочеться працювати
              </p>
            </div>
            <div className={s.buttonsContainer}>
              <a
                href={getLearningFormatsAnchor()}
                className={s.detailsBtn}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(getLearningFormatsAnchor());
                }}
              >
                Обрати курс
              </a>
              <a
                href={getLearningFormatsAnchor()}
                className={s.detailsBtLowern}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(getLearningFormatsAnchor());
                }}
              >
                Переглянути тарифи
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
