"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import s from "./FavoritesModal.module.css";
import { useFavoriteStore } from "@/store/favorites";
import { useCartStore } from "@/store/cart";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import FavoritesModalSkeleton from "./FavoritesModalSkeleton";
import { normalizeImageUrl } from "@/lib/imageUtils";

export default function FavoritesModal() {
  const isOpen = useFavoriteStore((st) => st.isOpen);
  const close = useFavoriteStore((st) => st.close);
  const remove = useFavoriteStore((st) => st.remove);
  const itemsMap = useFavoriteStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const addToCart = useCartStore((st) => st.addItem);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopSlideIdx, setDesktopSlideIdx] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  /** MOBILKA — залишаємо як було */
  const mobileChunkSize = 4;
  const mobilePages = useMemo(() => {
    const chunks: (typeof items)[] = [];
    for (let i = 0; i < items.length; i += mobileChunkSize) {
      chunks.push(items.slice(i, i + mobileChunkSize));
    }
    return chunks;
  }, [items]);

  const mobilePageItems =
    isMobile && mobilePages.length > 0
      ? mobilePages[Math.min(activeIndex, mobilePages.length - 1)]
      : [];

  /** DESKTOP — логіка як в ProductPage */
  const desktopItemsPerView = 4;
  const desktopTotalSlides = Math.max(
    1,
    items.length > desktopItemsPerView
      ? items.length - desktopItemsPerView + 1
      : 1
  );
  const desktopStart = desktopSlideIdx;
  const desktopVisible = items.slice(
    desktopStart,
    desktopStart + desktopItemsPerView
  );
  const onDesktopPrev = () =>
    setDesktopSlideIdx(
      (idx) => (idx - 1 + desktopTotalSlides) % desktopTotalSlides
    );
  const onDesktopNext = () =>
    setDesktopSlideIdx((idx) => (idx + 1) % desktopTotalSlides);

  /** -------- */

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Виправляємо activeIndex тільки якщо він дійсно некоректний (щоб уникнути безкінечних циклів)
    if (mobilePages.length === 0) {
      if (activeIndex !== 0) {
        setActiveIndex(0);
      }
      return;
    }
    if (activeIndex >= mobilePages.length) {
      const newIndex = Math.max(0, mobilePages.length - 1);
      if (activeIndex !== newIndex) {
        setActiveIndex(newIndex);
      }
    }
  }, [activeIndex, mobilePages.length]);

  useEffect(() => {
    setDesktopSlideIdx(0);
  }, [isMobile]);

  useEffect(() => {
    // Виправляємо desktopSlideIdx тільки якщо він дійсно некоректний (щоб уникнути безкінечних циклів)
    if (desktopSlideIdx >= desktopTotalSlides) {
      const newIdx = Math.max(0, desktopTotalSlides - 1);
      if (desktopSlideIdx !== newIdx) {
        setDesktopSlideIdx(newIdx);
      }
    }
  }, [desktopSlideIdx, desktopTotalSlides, items.length]);

  useScrollLock(isOpen);

  if (!isOpen || !isMounted) return null;

  const content =
    showSkeleton || isMobile === null ? (
      <FavoritesModalSkeleton />
    ) : (
      <div className={s.backdrop} onClick={close}>
        <div className={s.modal} onClick={(e) => e.stopPropagation()}>
          <div className={s.topbarListBlock}>
            <div className={s.topbar}>
              <span className={s.topbarTitle}>Обране</span>
              <ModalCloseButton onClose={close} className={s.close} />
            </div>

            {isMobile ? (
              /** ========= MOBILE ========= */
              <div className={s.mobileSliderWrap}>
                {items.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : mobilePages.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : (
                  <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    onSwiper={(sw) => (swiperRef.current = sw)}
                    onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
                    spaceBetween={0}
                    slidesPerView={1}
                    centeredSlides={false}
                    observer
                    observeParents
                    updateOnWindowResize
                  >
                    {mobilePages.map((group, idx) => (
                      <SwiperSlide
                        key={group.map((it) => it.id).join("-") || idx}
                        className={s.mobileSlide}
                      >
                        <div className={s.mobileSlideGrid}>
                          {group.map((it) => {
                            const isCourse = it.id.startsWith("course-");
                            const courseId = isCourse ? it.id.replace("course-", "") : undefined;
                            const normalizedImage = normalizeImageUrl(it.image);
                            return (
                              <div
                                key={it.id}
                                className={s.mobileCardWrapper}
                                onClick={() => close()}
                              >
                                <ProductCard 
                                  {...it} 
                                  price={it.price || 0} 
                                  image={normalizedImage}
                                  slug={isCourse && courseId ? `/courses/${courseId}` : it.slug}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            ) : (
              /** ========= DESKTOP ========= */
              <div className={s.desktopSliderWrap}>
                {items.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : (
                  <div className={s.desktopGrid}>
                    {desktopVisible.map((it) => {
                      const isCourse = it.id.startsWith("course-");
                      const courseId = isCourse ? it.id.replace("course-", "") : undefined;
                      const normalizedImage = normalizeImageUrl(it.image);
                      return (
                        <div key={it.id} onClick={() => close()}>
                          <ProductCard 
                            {...it} 
                            price={it.price || 0} 
                            image={normalizedImage}
                            slug={isCourse && courseId ? `/courses/${courseId}` : it.slug}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className={s.actionsRow}>
              <div className={s.buttonsWrap}>
                <div className={s.navWrap}>
                  {isMobile ? (
                    <SliderNav
                      activeIndex={activeIndex}
                      dots={mobilePages.length}
                      onPrev={() => swiperRef.current?.slidePrev()}
                      onNext={() => swiperRef.current?.slideNext()}
                      onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
                    />
                  ) : (
                    items.length > 4 && (
                      <SliderNav
                        activeIndex={desktopSlideIdx}
                        dots={desktopTotalSlides}
                        onPrev={onDesktopPrev}
                        onNext={onDesktopNext}
                        onDotClick={(idx) => setDesktopSlideIdx(idx)}
                      />
                    )
                  )}
                </div>

                <button
                  className={s.secondary}
                  onClick={() => {
                    const itemsToAdd = isMobile ? mobilePageItems : items;
                    itemsToAdd.forEach((it) => {
                      if (typeof it.price === "number") {
                        addToCart(
                          {
                            id: it.id,
                            name: it.name,
                            price: it.price,
                            image: it.image,
                          },
                          1
                        );
                      }
                    });
                  }}
                >
                  Додати усе в кошик
                </button>

                <button
                  className={s.remove}
                  onClick={() => {
                    const itemsToRemove = isMobile ? mobilePageItems : items;
                    itemsToRemove.forEach((it) => remove(it.id));
                  }}
                >
                  Видалити все
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  return createPortal(content, document.body);
}
