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
import { useFavoriteStore } from "../../store/favorites";
import { useCartStore } from "../../store/cart";
import ProductCard from "../sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "../ui/SliderNav/SliderNavActions";
import { CloseButtonIcon } from "../Icons/Icons";
import { useScrollLock } from "../hooks/useScrollLock";
import FavoritesModalSkeleton from "./FavoritesModalSkeleton";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [page, setPage] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  // Короткий скелетон при відкритті, щоб уникнути стрибка контенту
  useEffect(() => {
    if (!isOpen) return;
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const pageSize = 4;
  const pageCount = Math.ceil(items.length / pageSize) || 1;
  const pageItems = items.slice(page * pageSize, page * pageSize + pageSize);
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

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (mobilePages.length === 0) {
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }
    if (activeIndex >= mobilePages.length) {
      setActiveIndex(mobilePages.length - 1);
    }
  }, [activeIndex, mobilePages.length]);

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
              <button className={s.close} onClick={close} aria-label="Закрити">
                <CloseButtonIcon />
              </button>
            </div>
            {isMobile ? (
              <div className={s.mobileSliderWrap}>
                {items.length === 0 ? (
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
                          {group.map((it) => (
                            <div key={it.id} className={s.mobileCardWrapper}>
                              <ProductCard
                                id={it.id}
                                slug={it.slug}
                                name={it.name}
                                price={it.price || 0}
                                originalPrice={it.originalPrice}
                                discount={it.discount}
                                isNew={it.isNew}
                                isHit={it.isHit}
                                image={it.image}
                              />
                            </div>
                          ))}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            ) : (
              <div className={s.list}>
                {items.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : (
                  pageItems.map((it) => (
                    <ProductCard
                      key={it.id}
                      id={it.id}
                      slug={it.slug}
                      name={it.name}
                      price={it.price || 0}
                      originalPrice={it.originalPrice}
                      discount={it.discount}
                      isNew={it.isNew}
                      isHit={it.isHit}
                      image={it.image}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          <div className={s.actionsRow}>
            <div className={s.buttonsWrap}>
              {isMobile
                ? mobilePages.length > 0 && (
                    <div className={s.navWrap}>
                      <SliderNav
                        activeIndex={activeIndex}
                        dots={mobilePages.length}
                        onPrev={() => swiperRef.current?.slidePrev()}
                        onNext={() => swiperRef.current?.slideNext()}
                        onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
                      />
                    </div>
                  )
                : items.length > 4 && (
                    <div className={s.navWrap}>
                      <SliderNav
                        activeIndex={page}
                        dots={pageCount}
                        onPrev={() => setPage((p) => Math.max(0, p - 1))}
                        onNext={() =>
                          setPage((p) => Math.min(pageCount - 1, p + 1))
                        }
                        onDotClick={(idx) => setPage(idx)}
                      />
                    </div>
                  )}

              <button
                className={s.secondary}
                onClick={() => {
                  const itemsToAdd = isMobile ? mobilePageItems : pageItems;
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
                  const itemsToRemove = isMobile ? mobilePageItems : pageItems;
                  itemsToRemove.forEach((it) => remove(it.id));
                }}
              >
                Видалити все
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return createPortal(content, document.body);
}
