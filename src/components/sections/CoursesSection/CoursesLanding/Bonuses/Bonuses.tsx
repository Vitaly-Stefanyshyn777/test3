"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import s from "./Bonuses.module.css";
import {
  UserIcon,
  LockIcon,
  TelegramIcon,
  PlusIcon,
  BarbellIcon,
  OpenLockIcon,
  WalkingIcon,
  StudentHatIcon,
  CertificateIcon2,
  BulbIcon,
} from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";

const bonusesData = [
  {
    id: 1,
    title: "Включення до каталогу наших тренерів",
    description:
      "Клієнти зможуть знайти вас за містом, форматом і напрямком занять",
    icon: <UserIcon />,
    visual: "people-grid",
  },
  {
    id: 2,
    title: "Доступ до інвентарю",
    description:
      "Можливість придбати борд та супутній інвентар після сертифікації",
    icon: <LockIcon />,
    visual: "lock-circle",
  },
  {
    id: 3,
    title: "Навчання та курси",
    description:
      "Доступ до матеріалів, сертифікаційних програм і оновлень після проходження курсу",
    visual: "icons-row",
  },
  {
    id: 4,
    title: "Телеграм-чат",
    description: "Робочий канал зв'язку з командою і тренерами BFB",
    visual: "simple",
  },
  {
    id: 5,
    title: "Спільнота тренерів",
    description: "Зв'язки з іншими тренерами, обмін досвідом та підтримка",
    visual: "network",
  },
  {
    id: 6,
    title: "Доступ до подій, воркшопів і внутрішніх активностей BFB",
    description: "",
    visual: "image-bg",
  },
];

const Bonuses: React.FC = () => {
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

  const renderVisual = (visual: string) => {
    const peopleImages = [
      "/images/treners7.png",
      "/images/treners1.png",
      "/images/treners4.png",
      "/images/treners9.png",
      "/images/treners5.png",
      "/images/treners8.png",
      "/images/treners2.png",
      "/images/treners6.png",
      "/images/treners3.png",
    ];
    switch (visual) {
      case "people-grid":
        return (
          <div className={s.peopleGrid}>
            {Array.from({ length: 9 }).map((_, i) => {
              if (i === 4) {
                const srcCenter = peopleImages[8] || "/images/treners9.png";
                return (
                  <div key={i} className={s.personCenter}>
                    <Image
                      src={srcCenter}
                      alt={"Тренер 9"}
                      width={40}
                      height={40}
                      className={s.personCenterImage}
                    />
                    <div className={s.overlayAvatar}>
                      <span className={s.plusIcon}>
                        <PlusIcon />
                      </span>
                    </div>
                  </div>
                );
              }
              const imgIndex = i > 4 ? i - 1 : i;
              const src = peopleImages[imgIndex];
              return (
                <div key={i} className={s.personAvatar}>
                  <Image
                    src={src}
                    alt={`Тренер ${imgIndex + 1}`}
                    width={40}
                    height={40}
                    className={s.personImage}
                  />
                </div>
              );
            })}
          </div>
        );

      case "lock-circle":
        return (
          <div className={s.lockVisual}>
            <div className={s.lockIcon}>
              <OpenLockIcon />
            </div>
            <div className={`${s.sideBubble} ${s.leftBubble}`}>
              <WalkingIcon />
            </div>
            <div className={`${s.sideBubble} ${s.rightBubble}`}>
              <BarbellIcon />
            </div>
          </div>
        );

      case "icons-row":
        return (
          <div className={s.iconsRow}>
            <div className={s.iconItem}>
              <StudentHatIcon />
            </div>
            <div className={s.iconItem}>
              {" "}
              <CertificateIcon2 />
            </div>
            <div className={s.iconItem}>
              <BulbIcon />
            </div>
          </div>
        );

      case "network":
        return (
          <div className={s.networkVisual}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={s.networkNode}>
                <div className={s.nodeAvatar}></div>
              </div>
            ))}
            <div className={s.networkLines}>
              <div className={s.line}></div>
              <div className={s.line}></div>
              <div className={s.line}></div>
            </div>
          </div>
        );

      case "image-bg":
        return (
          <div className={s.imageBackground}>
            <div className={s.imageOverlay}></div>
          </div>
        );

      case "avatar-network":
        return (
          <div className={s.avatarNetwork}>
            {[
              "/images/avatar5.png",
              "/images/avatar4.png",
              "/images/avatar3.png",
              "/images/avatar7.png",
              "/images/avatar6.png",
              "/images/avatar1.png",
              "/images/avatar2.png",
            ].map((src, i) => (
              <div key={i} className={`${s.avatar} ${s[`a${i + 1}`]}`}>
                <Image
                  src={src}
                  alt={`Avatar ${i + 1}`}
                  fill
                  sizes="40px"
                  className={s.avatarImg}
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Створюємо слайди для мобілки
  const slide1 = (
    <div className={s.fullBlock}>
      <div className={s.cardContent}>
        <h3 className={s.cardTitle}>{bonusesData[0].title}</h3>
        <p className={s.cardText1}>{bonusesData[0].description}</p>
      </div>
      <div className={s.cardAvatarWrap}>
        <div className={s.cardHeader}>
          {renderVisual(bonusesData[0].visual)}
        </div>
      </div>
    </div>
  );

  const inventoryCardContent = (
    <div className={`${s.card} ${s.inventoryCard}`}>
      <div className={s.inventoryCardInner}>
        <div className={`${s.cardContent} ${s.inventoryText}`}>
          <h3 className={s.cardTitle}>{bonusesData[1].title}</h3>
          <p className={s.cardText2}>{bonusesData[1].description}</p>
        </div>
        <div className={s.inventoryVisualWrap}>
          {renderVisual(bonusesData[1].visual)}
        </div>
      </div>
    </div>
  );

  const slide2 = (
    <div className={s.halfBlockRow}>
      {isMobile ? (
        inventoryCardContent
      ) : (
        <div className={`${s.halfBlock} ${s.inventoryBlock}`}>
          {inventoryCardContent}
        </div>
      )}
      <div className={`${s.halfBlock} ${s.telegramBlock}`}>
        <div className={`${s.card} ${s.telegramCard}`}>
          <div className={s.telegramCardInner}>
            <div className={`${s.cardContent} ${s.telegramText}`}>
              <div className={s.InfoBlock}>
                <div className={s.InfoBlockIcon}>
                  <TelegramIcon />
                </div>

                <div className={s.InfoBlockText}>
                  <h3 className={s.cardTitle}>{bonusesData[3].title}</h3>
                  <p className={s.cardText3}>{bonusesData[3].description}</p>
                </div>
              </div>
            </div>
            <div className={s.telegramVisualWrap}>
              {renderVisual("avatar-network")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const slide3 = (
    <div className={s.halfBlocklower}>
      <div className={`${s.coursesBlock} ${s.telegramBlock}`}>
        <div className={`${s.cardRight} ${s.telegramCard}`}>
          <div className={s.cardHeader}>
            {renderVisual(bonusesData[2].visual)}
          </div>
          <div className={s.cardContent}>
            <h3 className={s.cardTitle}>{bonusesData[2].title}</h3>
            <p className={s.cardText4}>{bonusesData[2].description}</p>
          </div>
        </div>
      </div>

      <div className={s.halfBlock}>
        <div className={`${s.card} ${s.cardImage}`}>
          {renderVisual(bonusesData[5].visual)}
          <div className={s.cardContent}>
            <h3 className={s.cardTitleWhite}>{bonusesData[5].title}</h3>
          </div>
        </div>
      </div>
    </div>
  );

  const mobileSlides = [slide1, slide2, slide3];

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <p className={s.kicker}>Бонуси</p>
          <h2 className={s.title}>Що ви отримаєте як тренер BFB?</h2>
        </div>

        {isMobile ? (
          <>
            <div className={s.mobileSliderWrap}>
              <Swiper
                modules={[A11y]}
                slidesPerView="auto"
                spaceBetween={16}
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
                onSwiper={(swiper) => {
                  mobileSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setActiveMobile(swiper.activeIndex || 0);
                }}
              >
                {mobileSlides.map((slide, idx) => (
                  <SwiperSlide key={idx} className={s.swiperSlide}>
                    {slide}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <div className={s.sliderNavOutside}>
              <SliderNav
                activeIndex={activeMobile}
                dots={mobileSlides.length}
                onPrev={() => mobileSwiperRef.current?.slidePrev()}
                onNext={() => mobileSwiperRef.current?.slideNext()}
                onDotClick={(idx) => mobileSwiperRef.current?.slideTo(idx)}
              />
            </div>
          </>
        ) : (
          <div className={s.flexContainer}>
            <div className={s.cardContentBlock}>
              {slide1}
              {slide2}
              {slide3}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Bonuses;
