"use client";
import React from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import s from "./OrderSuccessSection.module.css";
import type { WooCommerceOrder } from "@/lib/bfbApi";

interface OrderProductsProps {
  orderNumber: string;
  order?: WooCommerceOrder | null;
}

export default function OrderProducts({ orderNumber, order }: OrderProductsProps) {
  const items = useCartStore((st) => st.items);
  const cartItems = Object.values(items);

  // Використовуємо товари з замовлення, якщо вони є, інакше з кошика
  const productsToShow = order?.line_items
    ? order.line_items.slice(0, 3)
    : cartItems.slice(0, 3);

  return (
    <div className={s.CartItemsBlock}>
      <div className={s.numberOrdereBlock}>
        <p className={s.orderNumber}>Замовлення {orderNumber}</p>
      </div>

      <div className={s.productsBlock}>
        <div className={s.products}>
          {productsToShow.map((item, index) => {
            // Якщо це товар з замовлення (line_item)
            if (order?.line_items && 'product_id' in item) {
              const lineItem = item as WooCommerceOrder['line_items'][0];
              // Для товарів з замовлення потрібно отримати зображення з API
              // Поки що використовуємо placeholder або зображення з кошика
              const cartItem = cartItems.find(ci => ci.id === String(lineItem.product_id));
              return (
                <div key={lineItem.id || index} className={s.productImage}>
                  {cartItem?.image && (
                    <Image
                      src={cartItem.image}
                      alt={lineItem.name}
                      fill
                      sizes="80px"
                    />
                  )}
                  {lineItem.quantity > 1 && (
                    <div className={s.quantityBadge}>x{lineItem.quantity}</div>
                  )}
                </div>
              );
            }
            // Якщо це товар з кошика
            const cartItem = item as typeof cartItems[0];
            return (
              <div key={cartItem.id} className={s.productImage}>
                {cartItem.image && (
                  <Image
                    src={cartItem.image}
                    alt={cartItem.name}
                    fill
                    sizes="80px"
                  />
                )}
                {cartItem.quantity > 1 && (
                  <div className={s.quantityBadge}>x{cartItem.quantity}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
