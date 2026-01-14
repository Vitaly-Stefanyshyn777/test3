"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import s from "./OrderSuccessSection.module.css";
import type { WooCommerceOrder } from "@/lib/bfbApi";

// Функція для витягування числового ID з рядка
function extractProductId(id: string): number | null {
  if (/^\d+$/.test(id)) {
    return parseInt(id, 10);
  }
  const match = id.match(/(?:course|product)-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const numberMatch = id.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }
  return null;
}

interface OrderProductsProps {
  orderNumber: string;
  order?: WooCommerceOrder | null;
}

interface ProductWithImage {
  id: string | number;
  name: string;
  quantity: number;
  image?: string;
}

export default function OrderProducts({
  orderNumber,
  order,
}: OrderProductsProps) {
  const items = useCartStore((st) => st.items);
  const cartItems = Object.values(items);
  const [productImages, setProductImages] = useState<Record<string, string>>(
    {}
  );

  // Отримуємо товари: спочатку з order, якщо він є, інакше з кошика
  const productsToShow: ProductWithImage[] = React.useMemo(() => {
    if (order?.line_items && order.line_items.length > 0) {
      // Використовуємо товари з замовлення, але шукаємо зображення в кошику або WooCommerce
      return order.line_items.map((item) => {
        // Спочатку шукаємо зображення в кошику за product_id
        const cartItem = cartItems.find((cartItem) => {
          // Порівнюємо числовий product_id з кошика
          const cartProductId = extractProductId(cartItem.id);
          return cartProductId === item.product_id;
        });

        const finalImage =
          cartItem?.image || productImages[item.product_id.toString()];

        return {
          id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          image: finalImage,
        };
      });
    } else {
      // Fallback до товарів з кошика
      return cartItems.map((item) => {
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          image: item.image,
        };
      });
    }
  }, [order?.line_items, cartItems, productImages]);

  // Отримуємо зображення для товарів з замовлення
  useEffect(() => {
    if (!order?.line_items) {
      return;
    }

    const loadProductImages = async () => {
      const productsToFetch = order.line_items.filter(
        (item) => !productImages[item.product_id.toString()]
      );

      if (productsToFetch.length === 0) {
        return;
      }

      try {
        const imagesMap: Record<string, string> = {};

        await Promise.all(
          productsToFetch.map(async (item) => {
            try {
              // Спочатку намагаємося отримати як WooCommerce продукт
              const wcResponse = await fetch(
                `/api/wc/products/${item.product_id}`
              );
              if (wcResponse.ok) {
                const product = await wcResponse.json();
                if (product.images && product.images.length > 0) {
                  imagesMap[item.product_id.toString()] = product.images[0].src;
                  return;
                }
              }

              // Якщо не знайшли в WooCommerce, намагаємося отримати як курс
              const courseResponse = await fetch(
                `/api/course?id=${item.product_id}`
              );
              if (courseResponse.ok) {
                const course = await courseResponse.json();
                // Курси можуть мати зображення в різних полях
                const imageUrl =
                  course.featured_image_url || course.image || course.thumbnail;
                if (imageUrl) {
                  imagesMap[item.product_id.toString()] = imageUrl;
                }
              }
            } catch (error) {
              // Помилка обробляється мовчки
            }
          })
        );

        setProductImages((prev) => ({ ...prev, ...imagesMap }));
      } catch (error) {
        // Помилка обробляється мовчки
      }
    };

    loadProductImages();
  }, [order?.line_items]);

  return (
    <div className={s.CartItemsBlock}>
      <div className={s.numberOrdereBlock}>
        <p className={s.orderNumber}>Замовлення {orderNumber}</p>
      </div>

      <div className={s.productsBlock}>
        <div className={`${s.products} ${s.productsScrollable}`}>
          {productsToShow.map((product) => (
            <div key={product.id} className={s.productImage}>
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="80px"
                />
              )}
              {product.quantity > 1 && (
                <div className={s.quantityBadge}>x{product.quantity}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
