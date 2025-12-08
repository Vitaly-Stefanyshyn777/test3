"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import {
  BackIcon,
  LegconIcon,
  WalkingIcon,
  ArcIcon,
  ArcIcon2,
  Сlockcon,
  PauseIcon,
} from "@/components/Icons/Icons";
import s from "./Advantages.module.css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Advantages() {
  const swiperRef = useRef<SwiperRef>(null);
  const mobileSwiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = React.useState(0);
  const [activeMobile, setActiveMobile] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const advantages = [
    {
      id: 1,
      title: "Свідомий рух",
      description:
        "Ми працюємо не на автоматі, а з увагою до тіла, відчуттів і якості кожного руху",
      icons: [
        <BackIcon key="back" className={s.advantageIconSvg} />,
        <LegconIcon key="leg" className={s.advantageIconSvg} />,
        <WalkingIcon key="walk" className={s.advantageIconSvg} />,
      ],
      images: ["/images/fi_126265.png", "/images/fi_1262653.png"],
      hasIcons: true,
      hasImages: true,
    },
    {
      id: 2,
      title: "Розвиток без тиску",
      description:
        "Жодних «треба» чи гонитви за результатом. Кожен рухається у власному темпі",
      hasIcons: false,
      hasImages: false,
    },
    {
      id: 3,
      title: "Поступовість",
      description:
        "Не поспішаємо до результату. Даємо тілу час адаптуватись і розвиватись",
      hasIcons: false,
      hasImages: false,
    },
    {
      id: 4,
      title: "Простір для відчуттів",
      description:
        "BFB — це не тільки про фізику, а про відчуття. Тіло не «виконує», а «відчуває»",
      hasIcons: false,
      hasImages: false,
    },
    {
      id: 5,
      title: "Ритм, що належить тобі",
      description:
        "Ми не нав'язуємо темп. Кожен рухається так, як хоче саме сьогодні — без плану, без мети, за відчуттям.",
      hasIcons: false,
      hasImages: false,
    },
    {
      id: 6,
      title: "Пауза як сила",
      description:
        "Зупинка — це частина процесу. Ми вчимо чути момент, коли треба не зробити ще, а зробити менше.",
      hasIcons: false,
      hasImages: false,
    },
  ];

  const handlePrev = () => {
    if (swiperRef.current?.swiper && active > 0) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current?.swiper && active < 3) {
      swiperRef.current.swiper.slideNext();
    }
  };

  if (isMobile === null) {
    return null;
  }

  const renderCard = (advantage: (typeof advantages)[0], cardIndex: number) => (
    <div className={s.advantageCard}>
      <div className={s.advantageContent}>
        <h3 className={s.advantageTitle}>{advantage.title}</h3>
        <p className={s.advantageDescription}>{advantage.description}</p>
      </div>

      <div className={s.advantageVisualContainer}>
        {advantage.hasIcons && advantage.icons && (
          <div className={s.advantageIcons}>
            {advantage.icons.map((icon, index) => (
              <div
                key={index}
                className={`${s.advantageIcon} ${
                  s[`advantageIcon${index + 1}` as keyof typeof s]
                }`}
              >
                {icon}
              </div>
            ))}
          </div>
        )}
        {advantage.hasImages && advantage.images && (
          <div className={s.advantageImages}>
            {advantage.images.map((image, index) => (
              <div
                key={index}
                className={`${s.advantageImage} ${
                  s[`advantageImage${index + 1}` as keyof typeof s]
                }`}
              >
                <Image
                  src={image}
                  alt={advantage.title}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}
        {cardIndex === 1 && (
          <div className={s.secondBlockWrap}>
            <div className={s.arcWrap}>
              <Image
                src="/images/Frame132131867742.svg"
                alt="Arc with circle"
                width={422}
                height={275}
                className={s.arcSvg}
              />
            </div>
            <div className={s.infoBadge}>
              <div className={s.infoBadgeOuter}>
                <div className={s.infoBadgeInner}>
                  <div className={s.infoTitle}>+100%</div>
                  <div className={s.infoSubtitle}>Розуміння сфери</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {cardIndex === 2 && (
          <div className={s.thirdBlockWrap}>
            <div className={s.clockIconWrap3}>
              <div className={s.clockIconWrap}>
                <Сlockcon />
              </div>
            </div>
          </div>
        )}
        {cardIndex === 3 && (
          <div className={s.cardContentBlock4}>
            <div className={s.fullBlock4}>
              <div className={s.cardAvatarWrap4}>
                <div className={s.peopleGrid}>
                  {Array.from({ length: 9 }).map((_, i) => {
                    if (i === 4) {
                      const srcCenter = "/images/treners9.png";
                      return (
                        <div key={i} className={s.personCenter}>
                          <Image
                            src={srcCenter}
                            alt={"Тренер 9"}
                            width={132}
                            height={114}
                            className={s.personCenterImage}
                          />
                          <div className={s.overlayAvatar}>
                            <span className={s.plusIcon}>B.F.B</span>
                          </div>
                        </div>
                      );
                    }
                    const imgs = [
                      "/images/treners7.png",
                      "/images/treners1.png",
                      "/images/treners4.png",
                      "/images/treners5.png",
                      "/images/treners8.png",
                      "/images/treners2.png",
                      "/images/treners6.png",
                      "/images/treners3.png",
                    ];
                    const imgIndex = i > 4 ? i - 1 : i;
                    const src = imgs[imgIndex] || "/images/treners1.png";
                    return (
                      <div key={i} className={s.personAvatar}>
                        <Image
                          src={src}
                          alt={`Тренер ${imgIndex + 1}`}
                          width={132}
                          height={114}
                          className={s.personImage}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        {cardIndex === 4 && (
          <div className={s.rhythmBlock}>
            <div className={s.rhythmContent}>
              <div className={s.rhythmVisual}>
                <div className={s.restIndicator}>
                  <span className={s.restText}>rest</span>
                </div>
                <div className={s.targetIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="#60A5FA"
                      strokeWidth="2"
                    />
                    <circle cx="8" cy="8" r="2" fill="#60A5FA" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        {cardIndex === 5 && (
          <div className={s.pauseBlock}>
            <div className={s.pauseContent}>
              <div className={s.videoContainer}>
                <div className={s.videoPlayer}>
                  <PauseIcon />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className={s.advantagesSection}>
      <div className={s.advantagesContainer}>
        <div className={s.advantagesHeader}>
          <span className={s.advantagesSubtitle}>Переваги</span>
          <h2 className={s.advantagesTitle}>Переваги напрямку BFB</h2>
        </div>

        {isMobile ? (
          <div className={s.mobileSliderWrap}>
            <Swiper
              modules={[A11y]}
              slidesPerView="auto"
              spaceBetween={8}
              allowTouchMove={true}
              simulateTouch={true}
              touchRatio={1}
              resistanceRatio={0.85}
              watchOverflow={true}
              centeredSlides={false}
              longSwipes={true}
              longSwipesRatio={0.2}
              threshold={5}
              speed={350}
              grabCursor={true}
              className={s.mobileSlider}
              onSwiper={(inst) => (mobileSwiperRef.current = inst)}
              onSlideChange={(inst) => setActiveMobile(inst.activeIndex || 0)}
            >
              {advantages.map((advantage, cardIndex) => (
                <SwiperSlide key={advantage.id}>
                  {renderCard(advantage, cardIndex)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className={s.swiperContainer}>
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={4}
              slidesPerGroup={1}
              allowTouchMove={false}
              simulateTouch={false}
              onSlideChange={(sw) => {
                const maxIndex = 3;
                const currentIndex = Math.min(sw.activeIndex, maxIndex);
                setActive(currentIndex);
              }}
              navigation={{
                prevEl: `.${s.navButtonPrev}`,
                nextEl: `.${s.navButtonNext}`,
              }}
              pagination={{
                clickable: true,
                el: `.${s.pagination}`,
                bulletClass: s.paginationBullet,
                bulletActiveClass: s.paginationBulletActive,
              }}
              className={s.swiper}
            >
              {advantages.map((advantage, cardIndex) => (
                <SwiperSlide key={advantage.id} className={s.swiperSlide}>
                  {renderCard(advantage, cardIndex)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {isMobile ? (
          <SliderNav
            activeIndex={activeMobile}
            dots={advantages.length}
            onPrev={() => mobileSwiperRef.current?.slidePrev()}
            onNext={() => mobileSwiperRef.current?.slideNext()}
            onDotClick={(idx) => mobileSwiperRef.current?.slideTo(idx)}
          />
        ) : (
          <SliderNav
            activeIndex={active}
            dots={4}
            onPrev={handlePrev}
            onNext={handleNext}
            onDotClick={(idx) => {
              if (swiperRef.current?.swiper) {
                swiperRef.current.swiper.slideTo(idx);
              }
            }}
          />
        )}
      </div>
    </section>
  );
}
