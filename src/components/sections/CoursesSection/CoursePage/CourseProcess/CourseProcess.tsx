"use client";
import React, { useState, useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import s from "./CourseProcess.module.css";
import {
  VideoLessonIcon,
  MentorshipIcon,
  OnlineSessionIcon,
  ExtraMaterialsIcon,
  ExamTaskIcon,
  CertificateIcon2,
} from "@/components/Icons/Icons";

const items = [
  {
    title: "Відеоуроки",
    text: "Доступ до навчальних відео у будь-який час та з будь-якого пристрою",
    icon: <VideoLessonIcon />,
    number: "01",
  },
  {
    title: "Кураторський супровід",
    text: "Зворотний зв'язок від менторів та відповіді на запитання",
    icon: <MentorshipIcon />,
    number: "02",
  },
  {
    title: "Онлайн-сесія з засновником",
    text: "Живі зустрічі з викладачем для розбору тем та спілкування з групою.",
    icon: <OnlineSessionIcon />,
    number: "03",
  },
  {
    title: "Додаткові матеріали",
    text: "Доступ до готових тренувань та музика для старту",
    icon: <ExtraMaterialsIcon />,
    number: "04",
  },
  {
    title: "Екзаменаційне завдання",
    text: "Виконання завдання для підтвердження знань з курсу",
    icon: <ExamTaskIcon />,
    number: "05",
  },
  {
    title: "Сертифікація",
    text: "Підсумкова перевірка знань та вручення сертифікату",
    icon: <CertificateIcon2 />,
    number: "06",
  },
];

const CourseProcess: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.titleTextBlock}>
          <h2 className={s.title}>Як буде проходити навчання</h2>
        </div>

        {isMobile ? (
          <div className={s.mobileSliderWrap}>
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              onSwiper={(sw) => (swiperRef.current = sw)}
              onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
              spaceBetween={16}
              slidesPerView="auto"
              centeredSlides={false}
              observer
              observeParents
              updateOnWindowResize
            >
              {items.map((it, idx) => (
                <SwiperSlide key={idx} className={s.mobileSlide}>
                  <div className={s.item}>
                    <div className={s.itemContent}>
                      <div className={s.icon}>
                        {it.icon}
                        <p className={s.number}>{it.number}</p>
                      </div>

                      <div className={s.itemIconBlock}>
                        <h3 className={s.itemTitle}>{it.title}</h3>
                        <p className={s.itemText}>{it.text}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <SliderNav
              activeIndex={activeIndex}
              dots={items.length}
              onPrev={() => swiperRef.current?.slidePrev()}
              onNext={() => swiperRef.current?.slideNext()}
              onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
            />
          </div>
        ) : (
          <div className={s.row}>
            {items.map((it, idx) => (
              <div key={idx} className={s.item}>
                <div className={s.itemContent}>
                  <div className={s.icon}>
                    {it.icon}
                    <p className={s.number}>{it.number}</p>
                  </div>

                  <div className={s.itemIconBlock}>
                    <h3 className={s.itemTitle}>{it.title}</h3>
                    <p className={s.itemText}>{it.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseProcess;
