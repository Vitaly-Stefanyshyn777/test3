"use client";
import React, { useMemo, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import s from "./CartModal.module.css";
import { useCartStore, selectCartTotal } from "@/store/cart";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import CartHeader from "./CartHeader";
import CartItemsList from "./CartItemsList";
import CartSummary from "./CartSummary";
import CartRecommendations from "./CartRecommendations";
import CartModalSkeleton from "./CartModalSkeleton";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function CartModal() {
  const isOpen = useCartStore((st) => st.isOpen);
  const close = useCartStore((st) => st.close);
  const itemsMap = useCartStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const total = useCartStore(selectCartTotal);
  const discount = useMemo(
    () =>
      items.reduce((acc, it) => {
        const diff =
          it.originalPrice && it.originalPrice > it.price
            ? it.originalPrice - it.price
            : 0;
        return acc + diff * it.quantity;
      }, 0),
    [items]
  );
  const FREE_SHIPPING_LIMIT = 1999;
  const remainingToFree = Math.max(0, FREE_SHIPPING_LIMIT - total);
  const progressPct = Math.min(
    100,
    Math.round((total / FREE_SHIPPING_LIMIT) * 100)
  );

  const [isMounted, setIsMounted] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const handleCheckout = () => {
    close();
    window.location.href = "/checkout";
  };

  const itemsContent = (() => {
    if (items.length === 0) {
      return <div className={s.empty}>Кошик порожній</div>;
    }

    if (isMobile) {
      return (
        <>
          <Swiper
            onSwiper={(sw) => (swiperRef.current = sw)}
            onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
            slidesPerView={1}
            spaceBetween={8}
            className={s.recoSwiper}
          >
            {items.map((it) => (
              <SwiperSlide key={it.id}>
                <CartItemsList items={[it]} />
              </SwiperSlide>
            ))}
          </Swiper>

          {items.length > 1 && (
            <div className={s.navWrap}>
              <SliderNav
                activeIndex={activeIndex}
                dots={items.length}
                onPrev={() => swiperRef.current?.slidePrev()}
                onNext={() => swiperRef.current?.slideNext()}
                onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
              />
            </div>
          )}
        </>
      );
    }

    return <CartItemsList items={items} />;
  })();

  const modalContent = showSkeleton ? (
    <CartModalSkeleton />
  ) : (
    <div className={s.backdrop} onClick={close}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.topbarListBlock}>
          <CartHeader onClose={close} />
          <div className={s.bodyTwoCols}>
            {itemsContent}
            <CartSummary
              total={total}
              discount={discount}
              remainingToFree={remainingToFree}
              progressPct={progressPct}
              onCheckout={handleCheckout}
              onContinue={close}
            />
          </div>
          <CartRecommendations />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
