"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import s from "./BoardSection.module.css";
import { LegconIcon, ShieldIcon } from "@/components/Icons/Icons";

const BoardSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.titleTextBlock}>
          <p className={s.eyebrow}>Тренування нового покоління</p>
          <h2 className={s.title}>Борд для курсу</h2>
        </div>

        {!isMobile ? (
          <div className={s.grid}>
            <div className={`${s.card} ${s.card1}`}>
              <div className={s.imageWrap}>
                <Image
                  src="/images/image9.png"
                  alt="BFB training"
                  fill
                  className={s.image}
                  sizes="344px"
                  priority
                />
              </div>
            </div>

            <div className={`${s.card} ${s.card2}`}>
              <p className={s.cardDesc2}>
                Спеціальне антиковзке покриття для кращого зчеплення з поверхнею
              </p>
              <div className={s.assetWrap}>
                <div className={s.asset}>
                  <Image
                    src="/images/image261.png"
                    alt="Антиковзке покриття"
                    fill
                    className={s.assetImg}
                    sizes="360px"
                  />
                </div>
              </div>
            </div>

            <div className={`${s.card} ${s.card3}`}>
              <div className={s.icon} aria-hidden>
                <span>
                  <LegconIcon />
                </span>
              </div>
              <div className={s.cardTitleBlock}>
                <h3 className={s.cardTitle}>Захист суглобів під час руху</h3>
                <p className={s.cardDesc}>
                  Анатомічно правильна форма вигину, яка забезпечує комфорт
                  колінам та суглобам, але водночас зберігає балансуючу функцію.
                </p>
              </div>
            </div>

            <div className={`${s.card} ${s.card4}`}>
              <p className={s.cardDesc4}>
                Функціональність завдяки еспандерам у комплекті
              </p>
              <div className={s.asset}>
                <Image
                  src="/images/image34.png"
                  alt="Еспандер у комплекті"
                  fill
                  className={s.assetImg}
                  sizes="344px"
                />
              </div>
            </div>

            <div className={`${s.card} ${s.card5}`}>
              <div className={s.icon} aria-hidden>
                <span>
                  <ShieldIcon />
                </span>
              </div>
              <div className={s.cardTitleBlock}>
                <h3 className={s.cardTitle}>Матеріали та якість виробу</h3>
                <p className={s.cardDesc}>
                  Ми використовуємо якісну сировину, що витримує навантаження,
                  не деформується і довго служить навіть при щоденному
                  використанні.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={s.mobileCard}>
            <div className={s.mobileImageWrap}>
              <Image
                src="/images/image7.png"
                alt="BFB board"
                fill
                className={s.image}
                sizes="344px"
                priority
              />
            </div>
            <ul className={s.mobileList}>
              <li className={s.mobileItem}>
                <div className={s.mobileItemIcon} aria-hidden>
                  <span>
                    <ShieldIcon />
                  </span>
                </div>
                <p className={s.mobileItemText}>
                  Спеціальне антиковзке покриття для кращого зчеплення з
                  поверхнею
                </p>
              </li>
              <li className={s.mobileItem}>
                <div className={s.mobileItemIcon} aria-hidden>
                  <span>
                    <LegconIcon />
                  </span>
                </div>
                <p className={s.mobileItemText}>
                  Анатомічна форма вигину для захисту колін і суглобів
                </p>
              </li>
              <li className={s.mobileItem}>
                <div className={s.mobileItemIcon} aria-hidden>
                  <span>
                    <ShieldIcon />
                  </span>
                </div>
                <p className={s.mobileItemText}>
                  Функціональність завдяки еспандерам у комплекті
                </p>
              </li>
              <li className={s.mobileItem}>
                <div className={s.mobileItemIcon} aria-hidden>
                  <span>
                    <ShieldIcon />
                  </span>
                </div>
                <p className={s.mobileItemText}>
                  Матеріали, що гарантують довговічність та витривалість виробу
                </p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default BoardSection;
