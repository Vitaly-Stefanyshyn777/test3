"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useProductsQuery } from "@/components/hooks/useProductsQuery";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { PlusIcon, CloseButtonIcon } from "@/components/Icons/Icons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import s from "./CartModal.module.css";

export default function CartRecommendations() {
  const { data: products } = useProductsQuery();
  const items = useCartStore((st) => st.items);
  const addItem = useCartStore((st) => st.addItem);
  const removeItem = useCartStore((st) => st.removeItem);
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
          onSwiper={(inst) => (swiperRef.current = inst)}
          onSlideChange={(sw) => setRecoPage(sw.activeIndex)}
          slidesPerView={3.1}
          spaceBetween={8}
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
                  {/* Блок 1: Текст (бренд, назва, колір) */}
                  <div className={s.recoTextBlock}>
                    <div className={s.recoBrand}>DOMYOS</div>
                    <div className={s.recoName}>{p.name}</div>
                    <div className={s.recoColor}>
                      {p.color || "Колір не вказано"}
                    </div>
                  </div>

                  <div className={s.recoPriceButtonBlock}>
                    <div className={s.recoPriceBlock}>
                      <div className={s.recoPrice}>
                        {Number(p.price || 0).toLocaleString()}
                        <span className={s.recoCurrency}>
                          <p className={s.recoPriceBucks}>₴</p>
                        </span>
                      </div>
                      {p.originalPrice &&
                        Number(p.originalPrice) > Number(p.price || 0) && (
                          <div className={s.recoOldPrice}>
                            {Number(p.originalPrice).toLocaleString()}
                          </div>
                        )}
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
                        onClick={() =>
                          addItem({
                            id: String(p.id),
                            name: p.name,
                            price: Number(p.price) || 0,
                            image: p.image,
                            color: p.color,
                            originalPrice: Number(p.originalPrice) || 0,
                          })
                        }
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

        {/* SliderNav тільки на десктопі: на мобільному свайп руками */}
      </div>
    </div>
  );
}
