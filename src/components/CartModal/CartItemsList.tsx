"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import {
  MinuswIcon,
  PlusIcon,
  CloseButtonIcon,
} from "@/components/Icons/Icons";
import { normalizeImageUrl } from "@/lib/imageUtils";
import {
  calculatePrice,
  getPriceSellRegistry,
  normalizePriceParams,
} from "@/lib/priceUtils";
import { getProductPriceAsync } from "@/lib/useProductPrices";
import { fetchProductVariation, getProductById } from "@/lib/products";
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
  const setItemMetaDataInStore = useCartStore((st) => st.setItemMetaData);
  const setItemWcPrices = useCartStore((st) => st.setItemWcPrices);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = useAuthStore((state) => state.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));

  const imageUrl = normalizeImageUrl(item.image);
  const [imageError, setImageError] = useState(false);
  const [correctedPrices, setCorrectedPrices] = useState<{
    price: number;
    originalPrice?: number;
  } | null>(null);
  const [itemMetaData, setItemMetaData] = useState<
    Array<{ key: string; value: string }> | undefined
  >(item.metaData);
  const [wcBasePrice, setWcBasePrice] = useState<number | undefined>(
    item.wcPrice
  );
  const [wcBaseRegularPrice, setWcBaseRegularPrice] = useState<
    number | undefined
  >(item.wcRegularPrice);
  const rowRef = useRef<HTMLDivElement | null>(null);

  const parseWcPrice = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    const s = String(v);
    const cleaned = s.replace(/[₴$€£\s,]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : 0;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // Отримуємо metaData з API, якщо її немає в товарі
  useEffect(() => {
    const fetchMetaData = async () => {
      // Якщо metaData вже є, не робимо запит
      if (itemMetaData && itemMetaData.length > 0) {
        return;
      }

      try {
        // Отримуємо ПРОДУКТ (parent), бо `proce_sell_registry` зазвичай на продукті, а не на варіації
        // В кошику `item.id` у нас зберігається ключ елемента (часто це productId),
        // тому спочатку пробуємо ним.
        const productId = item.productId ? String(item.productId) : item.id;

        // Виключаємо курси
        if (productId.startsWith("course-")) {
          return;
        }

        // ВАЖЛИВО: /api/wc/products/{id} часто повертає meta_data: []
        // На product page meta приходить через WC v3. Тут робимо так само.
        const response = await fetch(
          `/api/wc/v3/products/${encodeURIComponent(productId)}`
        );
        const product = response.ok ? await response.json() : null;

        if (product?.meta_data && product.meta_data.length > 0) {
          // Конвертуємо meta_data в формат metaData
          const metaData: Array<{ key: string; value: string }> =
            product.meta_data.map((meta: { key: string; value: unknown }) => ({
              key: String(meta.key),
              value:
                meta.value === null || meta.value === undefined
                  ? ""
                  : String(meta.value),
            }));
          setItemMetaData(metaData);
          // Важливо: зберігаємо в store, щоб CartModal (summary) теж перерахувався
          setItemMetaDataInStore(item.id, metaData);
        } else {
        }
      } catch (error) {
        // При помилці не оновлюємо metaData
      }
    };

    // Перевіряємо тільки якщо товар може бути WooCommerce продуктом
    if (/\d/.test(item.id) && !item.id.startsWith("course-")) {
      fetchMetaData();
    }
  }, [item.id, item.productId, itemMetaData, setItemMetaDataInStore]);

  // Узгоджуємо логіку з ProductPage: беремо price/regular_price з WooCommerce продукту/варіації
  useEffect(() => {
    const fetchWcPrices = async () => {
      if (wcBasePrice !== undefined && wcBaseRegularPrice !== undefined) return;

      const parentId =
        item.productId ?? (/^\d+$/.test(item.id) ? Number(item.id) : null);
      if (!parentId) return;

      try {
        if (item.variationId && item.variationId > 0) {
          const variation = await fetchProductVariation(
            item.variationId,
            parentId
          );
          const vPrice = parseWcPrice(
            variation?.price ||
              variation?.sale_price ||
              variation?.regular_price
          );
          const vRegular = parseWcPrice(variation?.regular_price);
          const nextWcPrice = vPrice || 0;
          const nextWcRegular = vRegular || 0;
          setWcBasePrice(nextWcPrice);
          setWcBaseRegularPrice(nextWcRegular);
          setItemWcPrices(item.id, {
            wcPrice: nextWcPrice,
            wcRegularPrice: nextWcRegular,
          });
          return;
        }

        // Як і для meta: беремо товар через WC v3, щоб дані були консистентні з product page
        const response = await fetch(`/api/wc/v3/products/${parentId}`);
        const product = response.ok ? await response.json() : null;
        const pPrice = parseWcPrice(
          product?.price || product?.sale_price || product?.regular_price
        );
        const pRegular = parseWcPrice(product?.regular_price);
        const nextWcPrice = pPrice || 0;
        const nextWcRegular = pRegular || 0;
        setWcBasePrice(nextWcPrice);
        setWcBaseRegularPrice(nextWcRegular);
        setItemWcPrices(item.id, {
          wcPrice: nextWcPrice,
          wcRegularPrice: nextWcRegular,
        });
      } catch {
        // ignore
      }
    };

    if (!item.id.startsWith("course-")) {
      fetchWcPrices();
    }
  }, [
    item.id,
    item.productId,
    item.variationId,
    wcBasePrice,
    wcBaseRegularPrice,
    setItemWcPrices,
  ]);

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

  // Використовуємо уніфіковану функцію для нормалізації цін
  const normalizedPrices = normalizePriceParams({
    wcPrice: wcBasePrice,
    wcRegularPrice: wcBaseRegularPrice,
    wcSalePrice: undefined, // Не використовуємо окремо, бо вже в wcPrice може бути sale_price
    price: item.price,
    originalPrice: item.originalPrice,
    regularPrice: item.regularPrice,
    salePrice: item.salePrice,
  });

  const priceSellRegistry = getPriceSellRegistry({
    metaData: itemMetaData,
  });

  const { finalPrice, originalPrice, shouldShowOldPrice } = calculatePrice({
    price: normalizedPrices.price,
    regularPrice: normalizedPrices.regularPrice,
    salePrice: normalizedPrices.salePrice,
    isLoggedIn: effectiveIsLoggedIn,
    priceSellRegistry,
  });

  // Додаткова перевірка: якщо shouldShowOldPrice false, але є різниця між originalPrice та finalPrice,
  // показуємо стару ціну (це може статися, якщо regularPrice не був переданий)
  const shouldDisplayOldPrice =
    shouldShowOldPrice || (originalPrice > finalPrice && originalPrice > 0);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const oldEl = el.querySelector(`.${s.oldPrice}`) as HTMLElement | null;
    const curEl = el.querySelector(
      `.${s.currentPriceValue}`
    ) as HTMLElement | null;
  }, [item.id, shouldDisplayOldPrice, finalPrice, originalPrice]);

  return (
    <div className={s.item} ref={rowRef}>
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
                {shouldDisplayOldPrice && originalPrice > finalPrice && (
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
