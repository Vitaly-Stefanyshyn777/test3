"use client";
import React, { useEffect, useMemo, useState } from "react";
import s from "./LearningFormats.module.css";
import {
  Check2Icon,
  MicrophoneIcon,
  CheckBorderIcon,
  HeadphonesSupport,
  WeightIcon,
} from "../../../Icons/Icons";
import { fetchMainCourses, MainCoursePost } from "../../../../lib/bfbApi";
import TrenersModal from "../../../auth/TrenersModal";
import LearningFormatsSkeleton from "./LearningFormatsSkeleton";

type Benefit = { text: string };

const offlineAll: Benefit[] = [
  { text: "8 годин практиктики та теорії" },
  { text: "Практика з бордом під наглядом" },
  { text: "Доступ до матеріалів під час курсу" },
  { text: "13 навчально-методичних уроків" },
  { text: "7 тренувань для щоденної роботи з BFB" },
  { text: "8 годин практиктики та теорії" },
];

const offlineBenefitsBottom = [
  { text: "Підтримку від команди та менторів", icon: <HeadphonesSupport /> },
  { text: "Офіційний сертифікат від BFB", icon: <CheckBorderIcon /> },
  { text: "Право тренувати від бренду", icon: <WeightIcon /> },
  {
    text: "Просування напряму через сайт і соцмережі",
    icon: <MicrophoneIcon />,
  },
];

const onlineBenefitsTop: Benefit[] = [
  { text: "Навчання в зручному темпі" },
  { text: "13 теоретичних і практичних уроків" },
  { text: "7 тренувань для роботи" },
  { text: "Zoom-зустрічі з засновницею напряму" },
  { text: "Доступ до всіх матеріалів після курсу" },
  { text: "Спільнота підтримки у Telegram" },
];

const onlineResults = [
  { text: "Підтримку від команди та менторів", icon: <MicrophoneIcon /> },
  { text: "Офіційний сертифікат від BFB", icon: <CheckBorderIcon /> },
  { text: "Право тренувати від бренду", icon: <HeadphonesSupport /> },
  { text: "Просування напряму через сайт і соцмережі", icon: <WeightIcon /> },
];

export default function LearningFormats() {
  const [courses, setCourses] = useState<MainCoursePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchMainCourses();
        setCourses(data);
      } catch (error) {
        console.error("[LearningFormats] Помилка завантаження:", error);
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

  const parseMoney = (v: unknown): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const s = String(v)
      .replace(/[^0-9,\.]/g, "")
      .replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : undefined;
  };
  const splitIntoTwo = (
    items: Benefit[],
    leftCount = Math.ceil(items.length / 2)
  ) => {
    return [items.slice(0, leftCount), items.slice(leftCount)];
  };

  const [offlineCol1] = splitIntoTwo(offlineAll, 3);
  const [onlineCol1] = splitIntoTwo(onlineBenefitsTop);

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

  // Показуємо skeleton поки дані завантажуються
  if (isLoading) {
    return <LearningFormatsSkeleton />;
  }

  return (
    <section className={s.section}>
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
                backgroundImage:
                  offline?.Image || offline?.acf?.Image
                    ? `url(${offline?.Image || offline?.acf?.Image})`
                    : undefined,
              }}
            >
              <h3 className={s.cardBadge}>ОФЛАЙН КУРС BFB</h3>
            </div>

            <div className={s.cardBody}>
              <div className={s.cardListСontainer}>
                <div className={s.cardListBlock}>
                  <div className={s.cardListTitle}>Про курс:</div>
                  <p className={s.cardListText}>
                    {getCourseDescription(offline) ||
                      "Дані є, але пусті (About офлайн)"}
                  </p>
                </div>
                <div className={s.cardListBlock}>
                  <div className={s.list}>
                    <ul className={s.listColumn}>
                      {(
                        offline?.acf?.What_learn ||
                        offlineCol1.map((b) => b.text)
                      )
                        .slice(0, 3)
                        .map((txt, i) => (
                          <li key={`ol1-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>
                              {typeof txt === "string" ? txt : String(txt)}
                            </p>
                          </li>
                        ))}
                    </ul>
                    <ul className={s.listColumn}>
                      {(
                        offline?.acf?.What_learn ||
                        offlineAll.map((b) => b.text)
                      )
                        .slice(3)
                        .map((txt, i) => (
                          <li key={`ol2-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            {typeof txt === "string" ? txt : String(txt)}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={s.cardListBlock}>
                  <div className={s.cardListTitle}>Результат:</div>
                  <ul className={s.pills}>
                    {(offline?.acf?.Course_include &&
                    offline.acf.Course_include.length
                      ? offline.acf.Course_include.map((t) => ({ text: t }))
                      : offlineBenefitsBottom
                    ).map((b, i) => (
                      <li key={i} className={s.pill}>
                        <div className={s.pillIcon}>
                          {(b as { icon?: React.ReactNode }).icon ?? (
                            <CheckBorderIcon />
                          )}
                        </div>
                        {typeof (b as { text?: string | number }).text ===
                        "string"
                          ? (b as { text: string }).text
                          : String((b as { text: string | number }).text)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={s.cardFooter}>
                <div className={s.priceWrap}>
                  <span className={s.priceFrom}>від</span>
                  {(() => {
                    const current = parseMoney(
                      offline?.Price ?? offline?.acf?.Price
                    );
                    const old = parseMoney(
                      offline?.Discount ?? offline?.acf?.Price_old
                    );
                    return (
                      <>
                        <span className={s.price}>
                          <span className={s.priceValue}>
                            {typeof current === "number"
                              ? Math.round(current)
                              : "—"}
                          </span>
                          {typeof current === "number" ? (
                            <span className={s.priceCurrency}>₴</span>
                          ) : null}
                        </span>
                        {old && current && old > current ? (
                          <span className={s.priceOld}>
                            <span className={s.priceOldValue}>
                              {Math.round(old)}
                            </span>
                            <span className={s.priceOldCurrency}>₴</span>
                          </span>
                        ) : null}
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
                backgroundImage:
                  online?.Image || online?.acf?.Image
                    ? `url(${online?.Image || online?.acf?.Image})`
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
                      {(
                        online?.acf?.What_learn || onlineCol1.map((b) => b.text)
                      )
                        .slice(0, 3)
                        .map((txt, i) => (
                          <li key={`on1-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>
                              {typeof txt === "string" ? txt : String(txt)}
                            </p>
                          </li>
                        ))}
                    </ul>
                    <ul className={s.listColumn}>
                      {(
                        online?.acf?.What_learn ||
                        onlineBenefitsTop.map((b) => b.text)
                      )
                        .slice(3)
                        .map((txt, i) => (
                          <li key={`on2-${i}`} className={s.listItem}>
                            <div className={s.listItemIcon}>
                              <Check2Icon />
                            </div>
                            <p className={s.listItemText}>
                              {typeof txt === "string" ? txt : String(txt)}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={s.cardListBlock}>
                  <div className={s.cardListTitle}>Результат:</div>
                  <ul className={s.pills}>
                    {(online?.acf?.Course_include &&
                    online.acf.Course_include.length
                      ? online.acf.Course_include.map((t) => ({ text: t }))
                      : onlineResults
                    ).map((b, i) => (
                      <li key={i} className={s.pill}>
                        <div className={s.pillIcon}>
                          {(b as { icon?: React.ReactNode }).icon ?? (
                            <CheckBorderIcon />
                          )}
                        </div>
                        {typeof (b as { text?: string | number }).text ===
                        "string"
                          ? (b as { text: string }).text
                          : String((b as { text: string | number }).text)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={s.cardFooter}>
                <div className={s.priceWrap}>
                  <span className={s.priceFrom}>від</span>
                  {(() => {
                    const current = parseMoney(
                      online?.Price ?? online?.acf?.Price
                    );
                    const old = parseMoney(
                      online?.Discount ?? online?.acf?.Price_old
                    );
                    return (
                      <>
                        <span className={s.price}>
                          <span className={s.priceValue}>
                            {typeof current === "number"
                              ? Math.round(current)
                              : "—"}
                          </span>
                          {typeof current === "number" ? (
                            <span className={s.priceCurrency}>₴</span>
                          ) : null}
                        </span>
                        {old && current && old > current ? (
                          <span className={s.priceOld}>
                            <span className={s.priceOldValue}>
                              {Math.round(old)}
                            </span>
                            <span className={s.priceOldCurrency}>₴</span>
                          </span>
                        ) : null}
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
