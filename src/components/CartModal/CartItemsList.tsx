"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import { normalizeImageUrl } from "@/lib/imageUtils";
import { calculatePrice } from "@/lib/priceUtils";
import { getProductPriceAsync } from "@/lib/useProductPrices";
import s from "./CartModal.module.css";

interface CartItemsListProps {
  items: CartItem[];
}

interface CartItemRowProps {
  item: CartItem;
}

function CartItemRow({ item }: CartItemRowProps) {
  const increment = useCartStore((st) => st.increment);
  const decrement = useCartStore((st) => st.decrement);
  const removeItem = useCartStore((st) => st.removeItem);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const imageUrl = normalizeImageUrl(item.image);
  const [imageError, setImageError] = useState(false);
  const [correctedPrices, setCorrectedPrices] = useState<{
    price: number;
    originalPrice?: number;
  } | null>(null);

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // Перевіряємо та оновлюємо ціни для варіативних товарів
  useEffect(() => {
    const checkAndUpdatePrices = async () => {
      try {
        // Отримуємо свіжі ціни з API
        const freshPrices = await getProductPriceAsync(item.id);

        // Якщо отримали некоректні ціни (0), не оновлюємо
        if (freshPrices.currentPrice === 0) {
          return;
        }

        // Якщо ціни відрізняються від тих, що в кошику, оновлюємо
        if (
          freshPrices.currentPrice !== item.price ||
          freshPrices.originalPrice !== item.originalPrice
        ) {
          // Зберігаємо виправлені ціни для поточного рендерингу
          setCorrectedPrices({
            price: freshPrices.currentPrice,
            originalPrice: freshPrices.originalPrice,
          });
        }
      } catch (error) {
        // При помилці не перезаписуємо ціни - залишаємо оригінальні з кошика
        console.error("Error updating cart item prices:", error);
      }
    };

    // Перевіряємо тільки якщо товар може бути варіативним WooCommerce продуктом
    // Виключаємо курси (course-XXX) та інші не-WooCommerce товари
    if (/\d/.test(item.id) && !item.id.startsWith("course-")) {
      checkAndUpdatePrices();
    }
  }, [item.id, item.price, item.originalPrice]);

  const finalImageUrl = imageError ? "/placeholder.svg" : imageUrl;

  // Витягуємо колір з назви товару, якщо він там є
  // Шукаємо патерни: (Колір: назва), (Color: назва) або інші варіації
  // Використовуємо колір і розмір напряму з item
  const extractedColor = item.color;
  const extractedSize = item.size;

  // Використовуємо виправлені ціни, якщо вони є, інакше - з кошика
  // Пріоритет: salePrice > price
  const priceToUse = correctedPrices?.price ?? (item.salePrice && item.salePrice > 0 ? item.salePrice : item.price);
  const originalPriceToUse = correctedPrices?.originalPrice ?? (item.regularPrice && item.regularPrice > 0 ? item.regularPrice : item.originalPrice);

  const { finalPrice, originalPrice, shouldShowOldPrice } = calculatePrice({
    price: priceToUse,
    regularPrice: item.regularPrice,
    salePrice: item.salePrice,
    originalPrice: originalPriceToUse,
    isLoggedIn,
  });

  return (
    <div className={s.item}>
      <div className={s.itemMain}>
        <Image
          src={finalImageUrl}
          alt={item.name}
          className={s.thumb}
          width={144}
          height={115}
          style={{ objectFit: "cover" }}
          unoptimized={finalImageUrl.startsWith("http")}
          onError={handleImageError}
        />

        <div className={s.contentCol}>
          <div className={s.nameColorBlock}>
            <div className={s.titleBlock}>
              <div className={s.name}>{item.name}</div>
              <button
                className={s.removeBtn}
                onClick={() => removeItem(item.id)}
              >
                <CloseButtonIcon />
              </button>
            </div>

            {(extractedColor || extractedSize) && (
              <div className={s.color}>
                {extractedColor && `Колір: ${extractedColor}`}
                {extractedColor && extractedSize && ", "}
                {extractedSize && `Розмір: ${extractedSize}`}
              </div>
            )}
          </div>

          <div className={s.controlsBlock}>
            <div className={s.controls}>
              <button className={s.minus} onClick={() => decrement(item.id)}>
                <MinuswIcon />
              </button>
              <span className={s.qty}>{item.quantity}</span>
              <button className={s.plus} onClick={() => increment(item.id)}>
                <PlusIcon />
              </button>
            </div>
            <div className={s.priceWrap}>
              <div className={s.prices}>
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
                    <span className={s.originalPriceCurrency}>₴</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartItemsList({ items }: CartItemsListProps) {
  // if (items.length === 0) {
  //   return <div className={s.empty}>Кошик порожній</div>;
  // }

  return (
    <div className={s.leftList}>
      {items.map((it) => (
        <CartItemRow key={it.id} item={it} />
      ))}
    </div>
  );
}
