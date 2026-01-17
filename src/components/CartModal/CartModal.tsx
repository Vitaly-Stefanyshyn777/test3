"use client";
import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import s from "./CartModal.module.css";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import {
  calculatePrice,
  getPriceSellRegistry,
  normalizePriceParams,
} from "@/lib/priceUtils";
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
  const token = useAuthStore((st) => st.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const normalizedPrices = normalizePriceParams({
        wcPrice: it.wcPrice,
        wcRegularPrice: it.wcRegularPrice,
        wcSalePrice: undefined,
        price: it.price,
        originalPrice: it.originalPrice,
        regularPrice: it.regularPrice,
        salePrice: it.salePrice,
      });
      const priceSellRegistry = getPriceSellRegistry({
        metaData: it.metaData,
      });
      const { finalPrice } = calculatePrice({
        price: normalizedPrices.price,
        regularPrice: normalizedPrices.regularPrice,
        salePrice: normalizedPrices.salePrice,
        isLoggedIn: effectiveIsLoggedIn,
        priceSellRegistry,
      });
      return acc + finalPrice * it.quantity;
    }, 0);
  }, [items, effectiveIsLoggedIn]);

  // Розраховуємо суму без знижки для відображення
  const totalWithoutDiscount = useMemo(() => {
    return items.reduce((acc, it) => {
      const regularPrice =
        it.wcRegularPrice || it.regularPrice || it.originalPrice || it.price;
      return acc + regularPrice * it.quantity;
    }, 0);
  }, [items]);

  const discount = useMemo(() => {
    // Сума знижки = різниця між загальною сумою без знижки та зі знижкою
    return Math.max(0, totalWithoutDiscount - total);
  }, [total, totalWithoutDiscount]);

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
