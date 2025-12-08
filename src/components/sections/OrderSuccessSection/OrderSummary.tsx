"use client";
import React from "react";
import Link from "next/link";
import s from "./OrderSuccessSection.module.css";

interface OrderSummaryProps {
  safeTotal: number;
  discount: number;
  deliveryCost: number;
  finalTotal: number;
}

export default function OrderSummary({
  safeTotal,
  discount,
  deliveryCost,
  finalTotal,
}: OrderSummaryProps) {
  return (
    <>
      <div className={s.divider}></div>

      <div className={s.costSummary}>
        <div className={s.costRow}>
          <span className={s.costLabel}>Сума замовлення:</span>
          <span className={s.costValue}>{safeTotal.toLocaleString()} ₴</span>
        </div>
        <div className={s.costRow}>
          <span className={s.costLabel}>Сума знижки:</span>
          <span className={s.costValue}>{discount.toLocaleString()} ₴</span>
        </div>
        <div className={s.costRow}>
          <span className={s.costLabel}>Вартість доставки:</span>
          <span className={s.costValue}>
            {deliveryCost === 0
              ? "Безкоштовно"
              : "За тарифами \"Нової Пошти\""}
          </span>
        </div>
        <div className={s.costRow}>
          <span className={s.costLabelPrice}>До оплати:</span>
          <span className={s.costValuePrice}>
            {finalTotal.toLocaleString()} ₴
          </span>
        </div>
      </div>

      <Link href="/checkout" className={s.returnButton}>
        Обрати на мапі
      </Link>
    </>
  );
}

