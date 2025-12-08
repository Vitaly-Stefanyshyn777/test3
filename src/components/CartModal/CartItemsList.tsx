"use client";
import React from "react";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/cart";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import s from "./CartModal.module.css";

interface CartItemsListProps {
  items: CartItem[];
}

export default function CartItemsList({ items }: CartItemsListProps) {
  const increment = useCartStore((st) => st.increment);
  const decrement = useCartStore((st) => st.decrement);
  const removeItem = useCartStore((st) => st.removeItem);

  if (items.length === 0) {
    return <div className={s.empty}>Кошик порожній</div>;
  }

  return (
    <div className={s.leftList}>
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
                style={{ objectFit: "cover" }}
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

                <div className={s.color}>{it.color || "Колір не вказано"}</div>
              </div>

              <div className={s.controlsBlock}>
                <div className={s.controls}>
                  <button className={s.minus} onClick={() => decrement(it.id)}>
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
  );
}
