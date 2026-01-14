"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useProductsQuery } from "@/components/hooks/useProductsQuery";
// import { calculatePrice, calculateCartPrice } from "@/lib/priceUtils";
import { calculatePrice, calculateCartPrice } from "@/lib/priceUtils";

import { getProductPriceAsync } from "@/lib/useProductPrices";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { PlusIcon, CloseButtonIcon } from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import s from "./CartModal.module.css";

// Функція для отримання бренду товару
const getProductBrand = (product: any): string | null => {
  // Спочатку перевіряємо поле brands (масив брендів)
  if (
    product.brands &&
    Array.isArray(product.brands) &&
    product.brands.length > 0
  ) {
    return product.brands[0].name;
  }

  // Потім перевіряємо мета дані
  if (product.metaData) {
    const brandMeta = product.metaData.find(
      (meta: any) =>
        meta.key === "_brand" ||
        meta.key === "brand" ||
        meta.key === "_product_brand" ||
        meta.key.toLowerCase().includes("brand")
    );
    if (brandMeta && brandMeta.value) {
      return brandMeta.value;
    }
  }

  // Потім перевіряємо атрибути товару
  if (product.attributes) {
    const brandAttr = product.attributes.find(
      (attr: any) =>
        attr.slug === "pa_brand" ||
        attr.slug === "brand" ||
        attr.name.toLowerCase().includes("бренд") ||
        attr.name.toLowerCase().includes("brand")
    );
    if (brandAttr && brandAttr.options && brandAttr.options.length > 0) {
      return brandAttr.options[0];
    }
  }

  return null;
};

export default function CartRecommendations() {
  const { data: products } = useProductsQuery();
  const items = useCartStore((st) => st.items);
  const addItem = useCartStore((st) => st.addItem);
  const removeItem = useCartStore((st) => st.removeItem);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const swiperRef = useRef<{
    slidePrev: () => void;
    slideNext: () => void;
    slideTo: (i: number) => void;
  } | null>(null);
  const [recoPage, setRecoPage] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [productPrices, setProductPrices] = useState<
    Record<string, { currentPrice: number; originalPrice?: number }>
  >({});

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const productsList = products || [];

  // Завантажуємо правильні ціни для всіх продуктів
  useEffect(() => {
    const loadProductPrices = async () => {
      const pricesMap: Record<
        string,
        { currentPrice: number; originalPrice?: number }
      > = {};

      await Promise.all(
        productsList.map(async (product) => {
          try {
            const freshPrices = await getProductPriceAsync(String(product.id));
            pricesMap[String(product.id)] = freshPrices;
          } catch (error) {
            console.error(
              `Error loading price for product ${product.id}:`,
              error
            );
            // Пропускаємо продукт при помилці завантаження цін
          }
        })
      );

      setProductPrices(pricesMap);
    };

    if (productsList.length > 0) {
      loadProductPrices();
    }
  }, [productsList]);

  return (
    <div className={s.recommendations}>
      <div className={s.recoHeader}>
        <div className={s.recoTitle}>Рекомендовані товари</div>
        {isMobile === false && productsList.length > 1 && (
          <SliderNav
            activeIndex={recoPage}
            dots={productsList.length}
            onPrev={() => swiperRef.current?.slidePrev()}
            onNext={() => swiperRef.current?.slideNext()}
            onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
          />
        )}
      </div>
      <div className={s.recoRow}>
        <Swiper
          onSwiper={(inst: SwiperType) => (swiperRef.current = inst)}
          onSlideChange={(sw: SwiperType) => setRecoPage(sw.realIndex)}
          slidesPerView={3.1}
          spaceBetween={8}
          loop={productsList.length > 3}
          className={s.recoSwiper}
        >
          {productsList.map((p) => (
            <SwiperSlide key={p.id} className={s.recoSlide}>
              <div className={s.recoItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image || "/placeholder.svg"}
                  alt={p.name}
                  className={s.recoThumb}
                />
                <div className={s.recoContent}>
                  <div className={s.recoTextBlock}>
                    {(() => {
                      const brand = getProductBrand(p);
                      return brand ? (
                        <div className={s.recoBrand}>{brand}</div>
                      ) : null;
                    })()}
                    <div className={s.recoName}>{p.name}</div>
                    {p.color && <div className={s.recoColor}>{p.color}</div>}
                  </div>

                  <div className={s.recoPriceButtonBlock}>
                    <div className={s.recoPriceBlock}>
                      {(() => {
                        // Використовуємо завантажені ціни або fallback до існуючих
                        const productPrice = productPrices[String(p.id)];
                        const priceToUse =
                          productPrice?.currentPrice ?? p.price ?? 0;
                        const originalPriceToUse =
                          productPrice?.originalPrice ?? p.regularPrice;

                        const {
                          finalPrice,
                          originalPrice,
                          shouldShowOldPrice,
                        } = calculatePrice({
                          price: priceToUse,
                          originalPrice: originalPriceToUse,
                          isLoggedIn,
                        });

                        return (
                          <>
                            <div className={s.recoPrice}>
                              <span className={s.recoCurrentPriceValue}>
                                {finalPrice.toLocaleString()}
                              </span>
                              <span className={s.recoPriceCurrency}>₴</span>
                            </div>
                            {shouldShowOldPrice && (
                              <div className={s.recoOldPrice}>
                                <span className={s.recoOriginalPriceValue}>
                                  {originalPrice.toLocaleString()}
                                </span>
                                <span className={s.recoOriginalPriceCurrency}>
                                  ₴
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {items[String(p.id)] ? (
                      <button
                        className={`${s.smallPrimary} ${s.smallDelete}`}
                        onClick={() => removeItem(String(p.id))}
                        aria-label="Видалити товар з кошика"
                      >
                        <span className={s.smallPrimaryLabel}>Видалити</span>
                        <CloseButtonIcon />
                      </button>
                    ) : (
                      <button
                        className={s.smallPrimary}
                        onClick={async () => {
                          // Використовуємо завантажені ціни або fallback
                          const productPrice = productPrices[String(p.id)];
                          const priceToUse =
                            productPrice?.currentPrice ?? p.price ?? 0;
                          const originalPriceToUse =
                            productPrice?.originalPrice ?? p.regularPrice;

                          const { priceToAdd, originalPriceToAdd } =
                            calculateCartPrice({
                              price: priceToUse,
                              originalPrice: originalPriceToUse,
                              isLoggedIn,
                            });

                          try {
                            await addItem({
                              id: String(p.id),
                              name: p.name,
                              price: priceToAdd,
                              image: p.image,
                              color: p.color,
                              originalPrice: originalPriceToAdd,
                              stockQuantity: p.stockQuantity,
                            });
                          } catch (error) {
                            alert((error as Error).message);
                            return;
                          }
                        }}
                        aria-label="Додати товар у кошик"
                      >
                        <span className={s.smallPrimaryLabel}>Додати</span>
                        <PlusIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
