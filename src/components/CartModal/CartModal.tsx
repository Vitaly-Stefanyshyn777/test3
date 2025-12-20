"use client";
import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import s from "./CartModal.module.css";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import { calculatePrice, AUTH_DISCOUNT } from "@/lib/priceUtils";
import CartHeader from "./CartHeader";
import CartItemsList from "./CartItemsList";
import CartSummary from "./CartSummary";
import CartRecommendations from "./CartRecommendations";
import CartModalSkeleton from "./CartModalSkeleton";

export default function CartModal() {
  const isOpen = useCartStore((st) => st.isOpen);
  const close = useCartStore((st) => st.close);
  const itemsMap = useCartStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const isLoggedIn = useAuthStore((st) => st.isLoggedIn);
  
  // Обчислюємо total з урахуванням знижки для авторизованих
  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const { finalPrice } = calculatePrice({
        price: it.price,
        originalPrice: it.originalPrice,
        isLoggedIn,
      });
      return acc + finalPrice * it.quantity;
    }, 0);
  }, [items, isLoggedIn]);
  
  // Обчислюємо знижку (різниця між originalPrice та finalPrice)
  const discount = useMemo(() => {
    return items.reduce((acc, it) => {
      const { finalPrice, originalPrice, shouldShowOldPrice } = calculatePrice({
        price: it.price,
        originalPrice: it.originalPrice,
        isLoggedIn,
      });
      const diff = shouldShowOldPrice ? (originalPrice - finalPrice) * it.quantity : 0;
      return acc + diff;
    }, 0);
  }, [items, isLoggedIn]);
  const FREE_SHIPPING_LIMIT = 1999;
  const remainingToFree = Math.max(0, FREE_SHIPPING_LIMIT - total);
  const progressPct = Math.min(
    100,
    Math.round((total / FREE_SHIPPING_LIMIT) * 100)
  );

  const [isMounted, setIsMounted] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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
      // На мобілці використовуємо скрол замість слайдера
      return (
        <div className={s.mobileItemsScroll}>
          <CartItemsList items={items} />
            </div>
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
