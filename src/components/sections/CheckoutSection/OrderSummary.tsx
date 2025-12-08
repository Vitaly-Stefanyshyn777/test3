"use client";
import React from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import s from "./CheckoutSection.module.css";

interface OrderSummaryProps {
  total: number;
}

export default function OrderSummary({ total }: OrderSummaryProps) {
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const increment = useCartStore((st) => st.increment);
  const decrement = useCartStore((st) => st.decrement);
  const removeItem = useCartStore((st) => st.removeItem);

  const safeTotal = total || 0;

  return (
    <div className={s.summaryCard}>
      <div className={s.summaryHeader}>
        <h3 className={s.summaryTotal}>Всього</h3>
        <span className={s.summaryTotal}>
          <p className={s.summaryTotalAmount}>{safeTotal.toLocaleString()}</p>
          <span className={s.summaryCurrency}>₴</span>
        </span>
      </div>
      <div className={s.summaryDivider}></div>
      <div className={s.summaryList}>
        {items.map((it) => (
          <div key={it.id} className={s.item}>
            <div className={s.itemMain}>
              {it.image && (
                <Image
                  src={it.image}
                  alt={it.name}
                  className={s.thumb}
                  width={144}
                  height={115}
                />
              )}
              <div className={s.contentCol}>
                <div className={s.nameColorBlock}>
                  <div className={s.titleBlock}>
                    <div className={s.name}>{it.name}</div>
                    <button
                      className={s.removeBtn}
                      onClick={() => removeItem(it.id)}
                    >
                      <CloseButtonIcon />
                    </button>
                  </div>
                  <div className={s.color}>
                    {it.color || "Колір не вказано"}
                    {(it.sku || it.id) && (
                      <span className={s.colorCode}> • {it.sku || it.id}</span>
                    )}
                  </div>
                </div>
                <div className={s.controlsBlock}>
                  <div className={s.controls}>
                    <button
                      className={s.minus}
                      onClick={() => decrement(it.id)}
                    >
                      <MinuswIcon />
                    </button>
                    <span className={s.qty}>{it.quantity}</span>
                    <button className={s.plus} onClick={() => increment(it.id)}>
                      <PlusIcon />
                    </button>
                  </div>
                  <div className={s.priceWrap}>
                    <div className={s.prices}>
                      <span className={s.currentPrice}>
                        {it.price.toLocaleString()}
                        <span className={s.buck}>₴</span>
                      </span>
                      {it.originalPrice && it.originalPrice > it.price && (
                        <span className={s.oldPrice}>
                          {it.originalPrice.toLocaleString()} ₴
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.summaryDivider}></div>
      <div className={s.totals}>
        <div className={s.row}>
          <span className={s.rowLabel}>Сума замовлення</span>
          <span className={s.rowAmount}>
            <p className={s.rowAmountAmount}>{safeTotal.toLocaleString()}</p>
            <p className={s.rowAmountCurrency}>₴</p>
          </span>
        </div>
        <div className={s.row}>
          <span className={s.rowLabel}>Сума знижки</span>
          <span className={s.rowAmount}>
            <p className={s.rowAmountAmount}>0</p>
            <p className={s.rowAmountCurrency}>₴</p>
          </span>
        </div>
        <div className={s.row}>
          <span className={s.rowLabel}>Вартість доставки</span>
          <span className={s.muted}>За тарифами &quot;Нової Пошти&quot;</span>
        </div>
      </div>
      <div className={s.summaryDivider}></div>
      <div className={s.rowStrong}>
        <span className={s.titleTotal}>Разом</span>
        <span className={s.costValuePrice}>
          <span className={s.costValueNumber}>
            {safeTotal.toLocaleString()}
          </span>
          <span className={s.costValueCurrency}>₴</span>
        </span>
      </div>
    </div>
  );
}

