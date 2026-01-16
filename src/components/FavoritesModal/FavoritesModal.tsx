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
  const removeAll = useFavoriteStore((st) => st.removeAll);
  const clear = useFavoriteStore((st) => st.clear);
  const itemsMap = useFavoriteStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const addToCart = useCartStore((st) => st.addItem);
  const removeItem = useCartStore((st) => st.removeItem);
  const clearCart = useCartStore((st) => st.clear);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const desktopSwiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const desktopTotalSlides = Math.max(
    1,
    items.length > 4 ? items.length - 4 + 1 : 1
  );

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
    if (desktopTotalSlides === 0) {
      if (desktopActiveIndex !== 0) {
        setDesktopActiveIndex(0);
      }
      return;
    }
    if (desktopActiveIndex >= desktopTotalSlides) {
      const newIndex = Math.max(0, desktopTotalSlides - 1);
      if (desktopActiveIndex !== newIndex) {
        setDesktopActiveIndex(newIndex);
      }
    }
  }, [desktopActiveIndex, desktopTotalSlides, items.length]);

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
              <div className={s.mobileSliderWrap}>
                {items.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : mobilePages.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : (
                  <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    onSwiper={(sw: SwiperType) => (swiperRef.current = sw)}
                    onSlideChange={(sw: SwiperType) => setActiveIndex(sw.activeIndex)}
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
                            const courseId = isCourse
                              ? it.id.replace("course-", "")
                              : undefined;
                            const normalizedImage = normalizeImageUrl(it.image);
                            return (
                              <div
                                key={it.id}
                                className={s.mobileCardWrapper}
                                onClick={() => close()}
                              >
                                <ProductCard
                                  id={it.id}
                                  name={it.name}
                                  price={it.price || 0}
                                  originalPrice={it.originalPrice}
                                  color={it.color}
                                  size={it.size}
                                  image={normalizedImage}
                                  slug={
                                    isCourse && courseId
                                      ? `/courses/${courseId}`
                                      : it.slug
                                  }
                                  discount={it.discount}
                                  isNew={it.isNew}
                                  isHit={it.isHit}
                                  stockStatus={undefined}
                                  useRedGreenIconOnMobile={true}
                                  removeFromFavoritesOnAddToCart={true}
                                  productType={it.productType}
                                  variations={it.variations}
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
              <div className={s.desktopSliderWrap}>
                {items.length === 0 ? (
                  <div className={s.empty}>Список порожній</div>
                ) : (
                  <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    onSwiper={(sw: SwiperType) => (desktopSwiperRef.current = sw)}
                    onSlideChange={(sw: SwiperType) =>
                      setDesktopActiveIndex(sw.activeIndex)
                    }
                    spaceBetween={20}
                    slidesPerView={4}
                    slidesPerGroup={1}
                    centeredSlides={false}
                    observer
                    observeParents
                    updateOnWindowResize
                  >
                    {items.map((it) => {
                      const isCourse = it.id.startsWith("course-");
                      const courseId = isCourse
                        ? it.id.replace("course-", "")
                        : undefined;
                      const normalizedImage = normalizeImageUrl(it.image);
                      return (
                        <SwiperSlide key={it.id} className={s.desktopSlide}>
                          <div onClick={() => close()}>
                            <ProductCard
                              id={it.id}
                              name={it.name}
                              price={it.price || 0}
                              originalPrice={it.originalPrice}
                              color={it.color}
                              size={it.size}
                              image={normalizedImage}
                              slug={
                                isCourse && courseId
                                  ? `/courses/${courseId}`
                                  : it.slug
                              }
                              discount={it.discount}
                              isNew={it.isNew}
                              isHit={it.isHit}
                              stockStatus={undefined}
                              useRedGreenIconOnMobile={true}
                              removeFromFavoritesOnAddToCart={true}
                            />
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className={s.actionsRow}>
              <div className={s.buttonsWrap}>
                <div className={s.navWrap}>
                  {isMobile
                    ? items.length > 4 && (
                        <SliderNav
                          activeIndex={activeIndex}
                          dots={mobilePages.length}
                          onPrev={() => swiperRef.current?.slidePrev()}
                          onNext={() => swiperRef.current?.slideNext()}
                          onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
                        />
                      )
                    : items.length > 4 && (
                        <SliderNav
                          activeIndex={desktopActiveIndex}
                          dots={desktopTotalSlides}
                          onPrev={() => desktopSwiperRef.current?.slidePrev()}
                          onNext={() => desktopSwiperRef.current?.slideNext()}
                          onDotClick={(idx) =>
                            desktopSwiperRef.current?.slideTo(idx)
                          }
                        />
                      )}
                </div>

                <button
                  className={s.secondary}
                  onClick={async () => {
                    const itemsToAdd = isMobile ? mobilePageItems : items;

                    const itemIds: string[] = [];
                    const cartItemsToAdd = [];

                    for (const it of itemsToAdd) {
                      if (typeof it.price === "number") {
                        const itemId = it.id;
                        itemIds.push(itemId);

                        cartItemsToAdd.push({
                            id: itemId,
                            name: it.name,
                            price: it.price,
                            image: it.image,
                            regularPrice: it.regularPrice,
                            salePrice: it.salePrice,
                            variationId: it.variationId,
                            color: it.color,
                            size: it.size,
                        });
                      }
                    }

                    for (const cartItem of cartItemsToAdd) {
                      try {
                        await addToCart(cartItem, 1);
                      } catch (error) {
                        console.error('Failed to add item to cart:', cartItem.id, error);
                      }
                    }

                    if (itemIds.length > 0) {
                      try {
                        await removeAll(itemIds);
                      } catch (error) {
                        console.error('Failed to remove items from favorites:', error);
                      }
                    }
                  }}
                >
                  Додати усе в кошик
                </button>

                <button
                  className={s.remove}
                  onClick={() => {
                    clear();
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

