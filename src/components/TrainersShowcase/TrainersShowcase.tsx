"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCasesQuery } from "@/components/hooks/useCoachesQuery";
import styles from "./TrainersShowcase.module.css";
import { InstagramIcon } from "../Icons/Icons";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import TrainersShowcaseSkeleton from "./TrainersShowcaseSkeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "swiper/css";

interface TrainersShowcaseProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
}

const TrainersShowcase: React.FC<TrainersShowcaseProps> = ({
  title = "Кейси учнів",
  subtitle = "Результати",
  limit = 4,
  className = "",
  showPagination = false,
  itemsPerPage = 4,
}) => {
  const { data: cases = [], isLoading, isError } = useCasesQuery();

  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [activeMobile, setActiveMobile] = useState(0);
  const mobileSwiperRef = useRef<SwiperClass | null>(null);
  const [imageLoadedStates, setImageLoadedStates] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  type CaseItem = {
    id: number | string;
    name: string;
    image: string;
    location?: string;
    specialization?: string;
    superPower?: string;
  };

  const list = useMemo<CaseItem[]>(() => {
    if (!Array.isArray(cases)) return [];
    return cases.map(
      (c: {
        id: number;
        title?: { rendered?: string };
        acf?: {
          img_link_data_avatar?: string;
          instagram?: {
            title?: string;
            url?: string;
            target?: string;
          };
          textarea_description?: string;
        };
        // Старі поля для сумісності
        Avatar?: string;
        Text_instagram?: string;
        Description?: string;
      }) => ({
        id: c.id,
        name: c?.title?.rendered || "",
        image:
          c?.acf?.img_link_data_avatar ||
          c?.Avatar ||
          "/placeholder.svg",
        location:
          c?.acf?.instagram?.title ||
          c?.acf?.instagram?.url ||
          c?.Text_instagram ||
          "",
        specialization:
          c?.acf?.textarea_description ||
          c?.Description ||
          "",
        superPower: undefined,
      })
    );
  }, [cases]);
  const totalPages = useMemo(() => {
    const total = list.length;
    const per = Math.max(1, itemsPerPage);
    return Math.max(1, Math.ceil(total / per));
  }, [list.length, itemsPerPage]);

  const pagedItems = useMemo(() => {
    if (!showPagination) return list.slice(0, limit);
    const per = Math.max(1, itemsPerPage);
    const start = page * per;
    return list.slice(start, start + per);
  }, [list, page, itemsPerPage, showPagination, limit]);

  const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const goNext = () => setPage((p) => (p + 1) % totalPages);
  const goTo = (idx: number) => setPage(idx);

  if (isMobile === null) {
    return null;
  }

  const handleImageLoad = (coachId: number | string) => {
    setImageLoadedStates((prev) => ({ ...prev, [coachId]: true }));
  };

  if (isLoading) {
    return (
      <TrainersShowcaseSkeleton
        title={title}
        subtitle={subtitle}
        itemsPerPage={itemsPerPage}
      />
    );
  }

  return (
    <section className={`${styles.trainersSection} ${className}`}>
      <div className={styles.container}>
        {(title || subtitle) && (
          <div className={styles.header}>
            {subtitle && <div className={styles.badge}>{subtitle}</div>}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
        )}

        {isError && (
          <div className={styles.state}>Не вдалося завантажити тренерів</div>
        )}

        {!isError && (
          <>
            {isMobile ? (
              <div className={styles.mobileSliderWrap}>
                <Swiper
                  modules={[A11y]}
                  slidesPerView={1.3}
                  spaceBetween={12}
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
                  className={styles.mobileSlider}
                  onSwiper={(inst) => (mobileSwiperRef.current = inst)}
                  onSlideChange={(inst) =>
                    setActiveMobile(inst.activeIndex || 0)
                  }
                >
                  {list.slice(0, limit).map((coach) => (
                    <SwiperSlide key={coach.id}>
                      <article className={styles.trainerCard}>
                        <div className={styles.imageContainer}>
                          {!imageLoadedStates[coach.id] && (
                            <Skeleton
                              height="100%"
                              width="100%"
                              style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 1,
                              }}
                            />
                          )}
                          <Image
                            src={coach.image || "/placeholder.svg"}
                            alt={coach.name}
                            width={300}
                            height={400}
                            className={styles.trainerImage}
                            onLoad={() => handleImageLoad(coach.id)}
                            style={{
                              opacity: imageLoadedStates[coach.id] ? 1 : 0,
                              transition: "opacity 0.3s ease",
                            }}
                          />
                          {coach.location && (
                            <div className={styles.instagramBadge}>
                              <span className={styles.instagramIcon}>
                                <InstagramIcon />
                              </span>
                              <span>{coach.location}</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.trainerInfo}>
                          <h3 className={styles.trainerName}>{coach.name}</h3>
                          <p className={styles.trainerDescription}>
                            {coach.superPower || coach.specialization || "Тренер BFB"}
                          </p>
                        </div>
                      </article>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className={styles.trainersGrid}>
                {pagedItems.map((coach) => (
                  <article key={coach.id} className={styles.trainerCard}>
                    <div className={styles.imageContainer}>
                      {!imageLoadedStates[coach.id] && (
                        <Skeleton
                          height="100%"
                          width="100%"
                          style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 1,
                          }}
                        />
                      )}
                      <Image
                        src={coach.image || "/placeholder.svg"}
                        alt={coach.name}
                        width={300}
                        height={400}
                        className={styles.trainerImage}
                        onLoad={() => handleImageLoad(coach.id)}
                        style={{
                          opacity: imageLoadedStates[coach.id] ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                      {coach.location && (
                        <div className={styles.instagramBadge}>
                          <span className={styles.instagramIcon}>
                            <InstagramIcon />
                          </span>
                          <span>{coach.location}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.trainerInfo}>
                      <h3 className={styles.trainerName}>{coach.name}</h3>
                      <p className={styles.trainerDescription}>
                        {coach.superPower || coach.specialization || "Тренер BFB"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {isMobile ? (
              list.length > 1 && (
                <SliderNav
                  activeIndex={activeMobile}
                  dots={Math.min(list.length, limit)}
                  onPrev={() => mobileSwiperRef.current?.slidePrev()}
                  onNext={() => mobileSwiperRef.current?.slideNext()}
                  onDotClick={(idx) => mobileSwiperRef.current?.slideTo(idx)}
                  buttonBgColor="var(--white)"
                />
              )
            ) : (
              showPagination &&
              totalPages > 1 && (
                <SliderNav
                  activeIndex={page}
                  dots={totalPages}
                  onPrev={goPrev}
                  onNext={goNext}
                  onDotClick={goTo}
                  buttonBgColor="var(--white)"
                />
              )
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TrainersShowcase;
