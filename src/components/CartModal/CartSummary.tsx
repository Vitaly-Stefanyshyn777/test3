"use client";
import React from "react";
import Image from "next/image";
import s from "./CartModal.module.css";

interface CartSummaryProps {
  total: number;
  discount: number;
  remainingToFree: number;
  progressPct: number;
  onCheckout: () => void;
  onContinue: () => void;
}

export default function CartSummary({
  total,
  discount,
  remainingToFree,
  progressPct,
  onCheckout,
  onContinue,
}: CartSummaryProps) {
  return (
    <div className={s.rightSummary}>
      <div className={s.summaryBlock}>
        <div className={s.freeShipping}>
          <span className={s.badgeIcon}>
            <Image
              src="/images/fi_2630085.png"
              alt="Free shipping badge"
              width={24}
              height={24}
            />
          </span>
          <span className={s.freeShippingText}>
            До безкоштовної доставки залишилось
            <span className={s.amount}>
              {" "}
              {remainingToFree.toLocaleString()}
            </span>
            <span className={s.currency}> грн.</span>
          </span>
        </div>
        <div className={s.progressWrap}>
          <div className={s.progressTrack}>
            <div
              className={s.progressBar}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className={s.summaryRows}>
          <div className={s.summaryRow}>
            <span className={s.summaryLabelPrimary}>Сума замовлення</span>
            <span className={s.value}>
              <span className={s.summaryAmountPrimary}>
                {total.toLocaleString()}
              </span>{" "}
              <span className={s.summaryCurrencyPrimary}>₴</span>
            </span>
          </div>
          <div className={s.summaryRow}>
            <span className={s.label}>Сума знижки</span>
            <span className={s.value}>
              <span className={s.amountDiscount}>
                {discount.toLocaleString()}
              </span>{" "}
              <span className={s.currencyDiscount}>₴</span>
            </span>
          </div>
          <div className={s.summaryRow}>
            <span className={s.label}>Вартість доставки</span>
            <span className={s.valueNote}>
              За тарифами &quot;Нової Пошти&quot;
            </span>
          </div>
        </div>
      </div>

      <div className={s.summaryBlock}>
        <div className={s.totalRow}>
          <span className={s.labelStrong}>Разом</span>
          <span className={s.totalValue}>
            <span className={s.amountTogether}>{total.toLocaleString()}</span>{" "}
            <span className={s.currencyTogether}>₴</span>
          </span>
        </div>
        <div className={s.summaryButtons}>
          <button className={s.primary} onClick={onCheckout}>
            Оформити замовлення
          </button>
          <button className={s.secondary} onClick={onContinue}>
            Продовжити покупки
          </button>
        </div>
      </div>
    </div>
  );
}
