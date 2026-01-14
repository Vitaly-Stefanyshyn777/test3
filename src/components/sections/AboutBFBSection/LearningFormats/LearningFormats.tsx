"use client";
import React, { useEffect, useMemo, useState } from "react";
import s from "./LearningFormats.module.css";
import {
  Check2Icon,
  MicrophoneIcon,
  CheckBorderIcon,

} from "@/components/Icons/Icons";
import { fetchMainCourses, MainCoursePost } from "@/lib/bfbApi";
import TrenersModal from "@/components/auth/TrenersModal";
import { calculatePrice } from "@/lib/priceUtils";
import { useAuthStore } from "@/store/auth";
import LearningFormatsSkeleton from "./LearningFormatsSkeleton";

type Benefit = { text: string };

export default function LearningFormats() {
  const [courses, setCourses] = useState<MainCoursePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Визначення мобільної версії
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchMainCourses();
        setCourses(data);
      } catch (error) {
        setError("Не вдалося завантажити курси формату");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const offline = useMemo(() => {
    return courses.find((c) => String(c.Is_online ?? c.acf?.Is_online) !== "1");
  }, [courses]);

  const online = useMemo(() => {
    return courses.find((c) => String(c.Is_online ?? c.acf?.Is_online) === "1");
  }, [courses]);

  // Допоміжні функції для отримання даних з пріоритетом: ACF -> прямі поля
  const getCourseBenefits = (course: MainCoursePost | undefined) => {
    // Спочатку пробуємо ACF
    if (course?.acf?.What_learn && Array.isArray(course.acf.What_learn)) {
      return course.acf.What_learn.map((text) => ({ text: String(text) }));
    }
    // Потім пробуємо прямі поля з API
    if (course?.About_course && Array.isArray(course.About_course)) {
      return course.About_course.map((text) => ({ text: String(text) }));
    }
    // Якщо немає даних - повертаємо порожній масив
    return [];
  };

  const getCourseResults = (course: MainCoursePost | undefined) => {
    // Спочатку пробуємо ACF
    if (
      course?.acf?.Course_include &&
      Array.isArray(course.acf.Course_include)
    ) {
      return course.acf.Course_include.map((text) => ({
        text: String(text),
        icon: <CheckBorderIcon />,
      }));
    }
    // Потім пробуємо прямі поля з API
    if (course?.Result && Array.isArray(course.Result)) {
      return course.Result.map(
        (item: { hl_input_text_text: string; hl_img_svg_icon: string }) => ({
          text: item.hl_input_text_text || "",
          icon: item.hl_img_svg_icon ? (
            <div dangerouslySetInnerHTML={{ __html: item.hl_img_svg_icon }} />
          ) : (
            <CheckBorderIcon />
          ),
        })
      );
    }
    // Якщо немає даних - повертаємо порожній масив
    return [];
  };

  const getCourseImage = (course: MainCoursePost | undefined) => {
    return course?.acf?.Image || course?.Image;
  };

  const getCoursePrice = (course: MainCoursePost | undefined) => {
    return course?.acf?.Price ?? course?.Price;
  };

  const getCoursePriceOld = (course: MainCoursePost | undefined) => {
    return course?.acf?.Price_old ?? course?.Discount;
  };

  const parseMoney = (v: unknown): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const s = String(v)
      .replace(/[^0-9,\.]/g, "")
      .replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : undefined;
  };

  // Допоміжна функція для отримання опису курсу
  const getCourseDescription = (course: MainCoursePost | undefined): string => {
    if (!course) return "Дані відсутні";

    // Перевіряємо About_course (масив, який приходить з бекенду)
    if (Array.isArray(course.About_course) && course.About_course.length > 0) {
      return course.About_course.join(" ");
    }

    // Fallback на статичний текст
    return "";
  };

  // Функція для отримання правильного якоря залежно від пристрою
  const getLearningFormatsAnchor = () => {
    return isMobile ? "#LearningMobileFormats" : "#LearningFormats";
  };

  if (isLoading) {
    return <LearningFormatsSkeleton />;
  }

  return (
    <section id="LearningFormats" className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <span className={s.subtitle}>Формати навчання</span>
          <h2 className={s.title}>Який формат обрати?</h2>
        </div>

        <div className={s.cards}>
          <div className={s.card}>
            <div
              className={s.cardImage1}
              style={{
                backgroundImage: getCourseImage(offline)
                  ? `url(${getCourseImage(offline)})`
                  : undefined,
              }}
            >
              <h3 className={s.cardBadge}>ОФЛАЙН КУРС BFB</h3>
            </div>

            <div className={s.cardBody}>
              <div className={s.cardListСontainer}>
                <div className={s.cardListBlock}>
                  <div id="LearningMobileFormats" className={s.cardListTitle}>
                    Про курс:
                  </div>
                  <p className={s.cardListText}>
                    {getCourseDescription(offline) ||
                      "Дані є, але пусті (About офлайн)"}
                  </p>
                </div>
                <div className={s.cardListBlock}>
                  <div className={s.list}>
                    <ul className={s.listColumn}>
                      {getCourseBenefits(offline)
                        .slice(0, 3)
                        .map((benefit, i) => (
                          <li key={`ol1-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>{benefit.text}</p>
                          </li>
                        ))}
                    </ul>
                    <ul className={s.listColumn}>
                      {getCourseBenefits(offline)
                        .slice(3)
                        .map((benefit, i) => (
                          <li key={`ol2-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>{benefit.text}</p>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={s.cardListBlock}>
                  <div className={s.cardListTitle}>Результат:</div>
                  <ul className={s.pills}>
                    {getCourseResults(offline).map(
                      (
                        result: { text: string; icon: React.ReactNode },
                        i: number
                      ) => (
                        <li key={i} className={s.pill}>
                          <div className={s.pillIcon}>
                            {result.icon || <CheckBorderIcon />}
                          </div>
                          {result.text}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className={s.cardFooter}>
                <div className={s.priceWrap}>
                  <span className={s.priceFrom}></span>
                  {(() => {
                    const currentPrice = parseMoney(getCoursePrice(offline));
                    const regularPrice = parseMoney(getCoursePriceOld(offline));

                    const priceCalculation = calculatePrice({
                      price: currentPrice,
                      regularPrice: regularPrice,
                      isLoggedIn,
                    });

                    return (
                      <>
                        <span className={s.price}>
                          <span className={s.priceValue}>
                            {Math.round(priceCalculation.finalPrice)}
                          </span>
                          <span className={s.priceCurrency}>₴</span>
                        </span>
                        {priceCalculation.shouldShowOldPrice && (
                          <span className={s.priceOld}>
                            <span className={s.priceOldValue}>
                              {Math.round(priceCalculation.originalPrice)}
                            </span>
                            <span className={s.priceOldCurrency}>₴</span>
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button
                  className={s.button}
                  onClick={() => setIsModalOpen(true)}
                >
                  Обрати курс
                </button>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <div
              className={s.cardImage2}
              style={{
                backgroundImage: getCourseImage(online)
                  ? `url(${getCourseImage(online)})`
                  : undefined,
              }}
            >
              <h3 className={s.cardBadge}>ОНЛАЙН КУРС BFB</h3>
            </div>

            <div className={s.cardBody}>
              <div className={s.cardListСontainer}>
                <div className={s.cardListBlock}>
                  <div className={s.cardListTitle}>Про курс:</div>
                  <p className={s.cardListText}>
                    {getCourseDescription(online) ||
                      "Дані є, але пусті (About онлайн)"}
                  </p>
                </div>
                <div className={s.cardListBlock}>
                  <div className={s.list}>
                    <ul className={s.listColumn}>
                      {getCourseBenefits(online)
                        .slice(0, 3)
                        .map((benefit, i) => (
                          <li key={`on1-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>{benefit.text}</p>
                          </li>
                        ))}
                    </ul>
                    <ul className={s.listColumn}>
                      {getCourseBenefits(online)
                        .slice(3)
                        .map((benefit, i) => (
                          <li key={`on2-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>{benefit.text}</p>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={s.cardListBlock}>
                  <div className={s.cardListTitle}>Результат:</div>
                  <ul className={s.pills}>
                    {getCourseResults(online).map(
                      (
                        result: { text: string; icon: React.ReactNode },
                        i: number
                      ) => (
                        <li key={i} className={s.pill}>
                          <div className={s.pillIcon}>
                            {result.icon || <CheckBorderIcon />}
                          </div>
                          {result.text}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className={s.cardFooter}>
                <div className={s.priceWrap}>
                  <span className={s.priceFrom}></span>
                  {(() => {
                    const currentPrice = parseMoney(getCoursePrice(online));
                    const regularPrice = parseMoney(getCoursePriceOld(online));

                    const priceCalculation = calculatePrice({
                      price: currentPrice,
                      regularPrice: regularPrice,
                      isLoggedIn,
                    });

                    return (
                      <>
                        <span className={s.price}>
                          <span className={s.priceValue}>
                            {Math.round(priceCalculation.finalPrice)}
                          </span>
                          <span className={s.priceCurrency}>₴</span>
                        </span>
                        {priceCalculation.shouldShowOldPrice && (
                          <span className={s.priceOld}>
                            <span className={s.priceOldValue}>
                              {Math.round(priceCalculation.originalPrice)}
                            </span>
                            <span className={s.priceOldCurrency}>₴</span>
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button
                  className={s.button}
                  onClick={() => setIsModalOpen(true)}
                >
                  Обрати курс
                </button>
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <TrenersModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
