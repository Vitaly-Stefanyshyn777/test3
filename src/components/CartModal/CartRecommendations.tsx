"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useProductsQuery } from "@/components/hooks/useProductsQuery";
import { calculatePrice, calculateCartPrice, getPriceSellRegistry, normalizePriceParams } from "@/lib/priceUtils";
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
  const token = useAuthStore((state) => state.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));
  const swiperRef = useRef<{
    slidePrev: () => void;
    slideNext: () => void;
    slideTo: (i: number) => void;
  } | null>(null);
  const [recoPage, setRecoPage] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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
                        // Використовуємо уніфіковану функцію для нормалізації цін (як в CartItemsList)
                        const normalizedPrices = normalizePriceParams({
                          wcProduct: p.wcProduct,
                          price: p.price,
                          originalPrice: p.originalPrice,
                          regularPrice: p.regularPrice,
                          salePrice: p.salePrice,
                        });

                        // Отримуємо відсоток знижки з metaData
                        const priceSellRegistry = getPriceSellRegistry({
                          metaData: p.metaData,
                          meta_data: p.metaData,
                          wcProduct: p.wcProduct ? { meta_data: (p.wcProduct as any).meta_data } : undefined,
                        });

                        const {
                          finalPrice,
                          originalPrice,
                          shouldShowOldPrice,
                        } = calculatePrice({
                          price: normalizedPrices.price,
                          regularPrice: normalizedPrices.regularPrice,
                          salePrice: normalizedPrices.salePrice,
                          isLoggedIn: effectiveIsLoggedIn,
                          priceSellRegistry,
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
                          // Використовуємо уніфіковану функцію для нормалізації цін (як в CartItemsList)
                          const normalizedPrices = normalizePriceParams({
                            wcProduct: p.wcProduct,
                            price: p.price,
                            originalPrice: p.originalPrice,
                            regularPrice: p.regularPrice,
                            salePrice: p.salePrice,
                          });

                          // Отримуємо відсоток знижки з metaData
                          const priceSellRegistry = getPriceSellRegistry({
                            metaData: p.metaData,
                            meta_data: p.metaData,
                            wcProduct: p.wcProduct ? { meta_data: (p.wcProduct as any).meta_data } : undefined,
                          });

                          const { priceToAdd, originalPriceToAdd } =
                            calculateCartPrice({
                              price: normalizedPrices.price,
                              regularPrice: normalizedPrices.regularPrice,
                              salePrice: normalizedPrices.salePrice,
                              isLoggedIn: effectiveIsLoggedIn,
                              priceSellRegistry,
                            });

                          try {
                            await addItem({
                              id: String(p.id),
                              productId: typeof p.id === "string" ? parseInt(p.id) : p.id,
                              name: p.name,
                              price: priceToAdd,
                              image: p.image,
                              color: p.color,
                              originalPrice: originalPriceToAdd,
                              stockQuantity: p.stockQuantity,
                              metaData: p.metaData,
                              wcPrice: normalizedPrices.price,
                              wcRegularPrice: normalizedPrices.regularPrice,
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
