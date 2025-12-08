"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./OurCoursesInfo.module.css";
import {
  AcademicCapIcon,
  BookIcon,
  UserPlusCapIcon,
} from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";

const OurCoursesInfo = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [activeMobile, setActiveMobile] = useState(0);
  const mobileSwiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) {
    return null;
  }

  const firstBlock = (
    <div className={styles.infoBlock}>
      <div className={styles.textContent}>
        <div className={styles.badgeBlock}>
          <div className={styles.badge}>Курс BFB</div>
          <h2 className={styles.title}>
            Інструктор групових
            <br />
            програм 4.0
          </h2>
        </div>

        <p className={styles.description}>
          Авторська навчальна програма для тренерів, які хочуть працювати за
          методикою BFB. Системне навчання, сертифікація, інвентар і підтримка
          після курсу – усе, щоб почати новий напрям без зайвих кроків.
        </p>
        <Link href="/courses-landing" className={styles.detailsBtn}>
          Детальніше
        </Link>
      </div>
      <div className={styles.imageContentTwo}>
        <Image
          src="/images/Frame713213181266.png"
          alt="Інструктор групових програм 4.0"
          width={600}
          height={400}
          className={styles.courseImagetwo}
        />
        <div className={styles.imageOverlay}>
          <Image
            src="/images/BFBFitness1.svg"
            alt="BFB Fitness"
            width={120}
            height={40}
            className={styles.overlayIcon}
          />
        </div>
      </div>
    </div>
  );

  const secondBlock = (
    <div className={styles.infoBlock}>
      <div className={styles.imageContent}>
        <Image
          src={isMobile ? "/images/Frame13213181269.png" : "/Frame-13213181265.png"}
          alt="Як проходить навчання"
          width={500}
          height={600}
          className={styles.courseImage}
        />
        <div className={styles.imageOverlay}>
          <Image
            src="/images/BFBFitness1.svg"
            alt="BFB Fitness"
            width={120}
            height={40}
            className={styles.overlayIcon}
          />
        </div>
      </div>
      <div className={styles.textContent}>
        <div className={styles.badgeBlock}>
          <div className={styles.badge}>Курс BFB</div>
          <h2 className={styles.title}>Як проходить навчання</h2>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <span>
                <AcademicCapIcon />
              </span>
            </div>
            <div className={styles.featureContent}>
              <h3>12 навчальних блоків</h3>
              <p>
                Заняття, які можна дивитись у будь-який час та в будь-якому
                місці
              </p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <span>
                <UserPlusCapIcon />
              </span>
            </div>
            <div className={styles.featureContent}>
              <h3>До 18 людей в групі</h3>
              <p>Живе спілкування, обмін досвідом, підтримка й однодумців</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <span>
                <BookIcon />
              </span>
            </div>
            <div className={styles.featureContent}>
              <h3>Готуємо до старту</h3>
              <p>Навчання, яке відразу готує до роботи з людьми і практики</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={styles.infoSection}>
      <div className={styles.container}>
        {isMobile ? (
          <>
            <div className={styles.mobileSliderWrap}>
              <Swiper
                className={styles.mobileSlider}
                slidesPerView={1}
                spaceBetween={16}
                onSwiper={(swiper) => {
                  mobileSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setActiveMobile(swiper.activeIndex);
                }}
              >
                <SwiperSlide className={styles.swiperSlide}>
                  {firstBlock}
                </SwiperSlide>
                <SwiperSlide className={styles.swiperSlide}>
                  {secondBlock}
                </SwiperSlide>
              </Swiper>
            </div>
            <SliderNav
              activeIndex={activeMobile}
              dots={2}
              onPrev={() => mobileSwiperRef.current?.slidePrev()}
              onNext={() => mobileSwiperRef.current?.slideNext()}
              onDotClick={(idx) => mobileSwiperRef.current?.slideTo(idx)}
            />
          </>
        ) : (
          <div className={styles.blocksContainer}>
            {firstBlock}
            {secondBlock}
          </div>
        )}
      </div>
    </section>
  );
};

export default OurCoursesInfo;
