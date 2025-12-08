"use client";
import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import s from "./CartModal.module.css";
import { useCartStore, selectCartTotal } from "../../store/cart";
import { useScrollLock } from "../hooks/useScrollLock";
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

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
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

  const modalContent = showSkeleton ? (
    <CartModalSkeleton />
  ) : (
    <div className={s.backdrop} onClick={close}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.topbarListBlock}>
          <CartHeader onClose={close} />
          <div className={s.bodyTwoCols}>
            <CartItemsList items={items} />
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
