"use client";
import React, { useMemo, useEffect } from "react";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { calculatePrice } from "@/lib/priceUtils";
import { getProductPriceAsync } from "@/lib/useProductPrices";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import s from "./CheckoutSection.module.css";

interface OrderSummaryProps {
  total: number;
  updateItem?: (id: string, updates: Partial<{ price: number; originalPrice?: number }>) => void;
}

export default function OrderSummary({ total, updateItem }: OrderSummaryProps) {
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const increment = useCartStore((st) => st.increment);
  const decrement = useCartStore((st) => st.decrement);
  const removeItem = useCartStore((st) => st.removeItem);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Перевіряємо та оновлюємо ціни для всіх товарів при завантаженні
  useEffect(() => {
    const checkAndUpdateAllPrices = async () => {
      if (!updateItem) return;

      for (const item of items) {
        try {
          // Отримуємо свіжі ціни з API
          const freshPrices = await getProductPriceAsync(item.id);

          // Якщо ціни відрізняються від тих, що в кошику, оновлюємо
          if (freshPrices.currentPrice !== item.price ||
              freshPrices.originalPrice !== item.originalPrice) {

            console.log('🛒 OrderSummary: Оновлюємо ціни для товару', {
              itemId: item.id,
              oldPrice: item.price,
              newPrice: freshPrices.currentPrice,
              oldOriginalPrice: item.originalPrice,
              newOriginalPrice: freshPrices.originalPrice
            });

            // Оновлюємо товар в кошику
            updateItem(item.id, {
              price: freshPrices.currentPrice,
              originalPrice: freshPrices.originalPrice,
            });
          }
        } catch (error) {
          console.error('Error updating cart item prices in OrderSummary:', error);
        }
      }
    };

    // Перевіряємо тільки товари, які можуть бути варіативними
    const itemsToCheck = items.filter(item => /\d/.test(item.id));
    if (itemsToCheck.length > 0) {
      checkAndUpdateAllPrices();
    }
  }, [items, updateItem]);

  const safeTotal = total || 0;

  // Обчислюємо загальну знижку
  const totalDiscount = useMemo(() => {
    return items.reduce((acc, it) => {
      const { finalPrice, originalPrice, shouldShowOldPrice } = calculatePrice({
        price: it.price,
        originalPrice: it.originalPrice,
        isLoggedIn,
      });
      const diff = shouldShowOldPrice
        ? (originalPrice - finalPrice) * it.quantity
        : 0;
      return acc + diff;
    }, 0);
  }, [items, isLoggedIn]);

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
                      <span className={s.colorCode}>
                        {" "}
                        | Код товару: {it.sku || it.id}
                      </span>
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
                      {(() => {
                        const {
                          finalPrice,
                          originalPrice,
                          shouldShowOldPrice,
                        } = calculatePrice({
                            price: it.price,
                            originalPrice: it.originalPrice,
                            isLoggedIn,
                          });

                        return (
                          <>
                              <span className={s.currentPrice}>
                                <span className={s.currentPriceValue}>
                                  {finalPrice.toLocaleString()}
                                </span>
                                <span className={s.priceCurrency}>₴</span>
                              </span>
                            {shouldShowOldPrice && (
                              <span className={s.oldPrice}>
                                <span className={s.originalPriceValue}>
                                  {originalPrice.toLocaleString()}
                                </span>
                                <span className={s.originalPriceCurrency}>
                                  ₴
                                </span>
                              </span>
                            )}
                          </>
                        );
                      })()}
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
            <p className={s.rowAmountNumber}>{safeTotal.toLocaleString()}</p>
            <p className={s.rowAmountCurrency}>₴</p>
          </span>
        </div>
        <div className={s.row}>
          <span className={s.rowLabel}>Сума знижки</span>
          <span className={s.rowAmount}>
            <p className={s.rowAmountAmount}>
              {Math.round(totalDiscount).toLocaleString()}
            </p>
            <p className={s.rowNumberCurrency}>₴</p>
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
