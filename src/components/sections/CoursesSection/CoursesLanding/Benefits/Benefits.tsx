"use client";
import React, { useState, useEffect, useRef } from "react";
import s from "./Benefits.module.css";
import {
  UserPlusCapIcon,
  BookIcon,
  СharterIcon,
  LockIcon,
} from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";

const items = [
  {
    title: "Реєстрація заявки",
    text: "Ви подаєте заявку, а команда BFB надає деталі та створює аповідку щодо інструкторства",
    icon: <UserPlusCapIcon />,
    number: "01",
  },
  {
    title: "Навчання",
    text: "Навчання проходить у вашому темпі з підтримкою команди. Ви засвоюєте методику та готуєтесь до практики",
    icon: <BookIcon />,
    number: "02",
  },
  {
    title: "Сертифікат BFB",
    text: "Після виконання завдань ви отримуєте сертифікат і номерок, що підтверджує право викладати за методикою BFB",
    icon: <СharterIcon />,
    number: "03",
  },
  {
    title: "Доступ до системи",
    text: "Вас додають до каталогу, ви отримуєте доступ до інвентарю, воркшопів і партнерів",
    icon: <LockIcon />,
    number: "04",
  },
];

const Benefits: React.FC = () => {
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

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.titleTextBlock}>
          <p className={s.kicker}>Крок за кроком до спільної роботи</p>
          <h2 className={s.title}>Ваш шлях до тренерства</h2>
        </div>

        {isMobile ? (
          <>
            <div className={s.mobileSliderWrap}>
              <Swiper
                className={s.mobileSlider}
                slidesPerView="auto"
                spaceBetween={12}
                onSwiper={(swiper) => {
                  mobileSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setActiveMobile(swiper.activeIndex);
                }}
              >
                {items.map((it, idx) => (
                  <SwiperSlide key={idx} className={s.swiperSlide}>
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
            </div>
            <SliderNav
              activeIndex={activeMobile}
              dots={items.length}
              onPrev={() => mobileSwiperRef.current?.slidePrev()}
              onNext={() => mobileSwiperRef.current?.slideNext()}
              onDotClick={(idx) => mobileSwiperRef.current?.slideTo(idx)}
            />
          </>
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

export default Benefits;
