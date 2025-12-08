"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./LearningFormats.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const LearningFormatsSkeleton = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        {/* Skeleton для заголовка */}
        <div className={s.header}>
          <Skeleton
            width={150}
            height={14}
            baseColor="rgba(132, 38, 215, 0.1)"
            highlightColor="rgba(132, 38, 215, 0.2)"
            style={{ margin: "0 auto" }}
          />
          <Skeleton
            width={400}
            height={48}
            baseColor="rgba(14, 14, 14, 0.1)"
            highlightColor="rgba(14, 14, 14, 0.2)"
            style={{ margin: "0 auto" }}
          />
        </div>

        {/* Skeleton для карток */}
        <div className={s.cards}>
          {/* Перша картка (Офлайн) */}
          <div className={s.card}>
            {/* Skeleton для зображення */}
            <Skeleton
              height={220}
              width="100%"
              baseColor="rgba(132, 38, 215, 0.1)"
              highlightColor="rgba(132, 38, 215, 0.2)"
            />

            <div className={s.cardBody}>
              <div className={s.cardListСontainer}>
                {/* Про курс */}
                <div className={s.cardListBlock}>
                  <Skeleton
                    width={100}
                    height={18}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                  <Skeleton
                    width="100%"
                    height={16}
                    count={2}
                    baseColor="rgba(14, 14, 14, 0.08)"
                    highlightColor="rgba(14, 14, 14, 0.15)"
                  />
                </div>

                {/* Список переваг */}
                <div className={s.cardListBlock}>
                  <div className={s.list}>
                    {/* Ліва колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={i} className={s.listItem}>
                          <Skeleton
                            width={32}
                            height={32}
                            borderRadius={16}
                            baseColor="rgba(132, 38, 215, 0.1)"
                            highlightColor="rgba(132, 38, 215, 0.2)"
                          />
                          <Skeleton
                            width="100%"
                            height={14}
                            baseColor="rgba(14, 14, 14, 0.08)"
                            highlightColor="rgba(14, 14, 14, 0.15)"
                          />
                        </li>
                      ))}
                    </ul>
                    {/* Права колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={i} className={s.listItem}>
                          <Skeleton
                            width={32}
                            height={32}
                            borderRadius={16}
                            baseColor="rgba(132, 38, 215, 0.1)"
                            highlightColor="rgba(132, 38, 215, 0.2)"
                          />
                          <Skeleton
                            width="100%"
                            height={14}
                            baseColor="rgba(14, 14, 14, 0.08)"
                            highlightColor="rgba(14, 14, 14, 0.15)"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Результат */}
                <div className={s.cardListBlock}>
                  <Skeleton
                    width={100}
                    height={18}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                  <div className={s.pills}>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        width={120}
                        height={40}
                        borderRadius={14}
                        baseColor="rgba(247, 247, 248, 0.8)"
                        highlightColor="rgba(247, 247, 248, 1)"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Футер з ціною та кнопкою */}
              <div className={s.cardFooter}>
                <div className={s.priceWrap}>
                  <Skeleton
                    width={40}
                    height={36}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                  <Skeleton
                    width={100}
                    height={28}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                </div>
                <Skeleton
                  width={185}
                  height={64}
                  borderRadius={20}
                  baseColor="rgba(132, 38, 215, 0.2)"
                  highlightColor="rgba(132, 38, 215, 0.4)"
                />
              </div>
            </div>
          </div>

          {/* Друга картка (Онлайн) */}
          <div className={s.card}>
            {/* Skeleton для зображення */}
            <Skeleton
              height={220}
              width="100%"
              baseColor="rgba(132, 38, 215, 0.1)"
              highlightColor="rgba(132, 38, 215, 0.2)"
            />

            <div className={s.cardBody}>
              <div className={s.cardListСontainer}>
                {/* Про курс */}
                <div className={s.cardListBlock}>
                  <Skeleton
                    width={100}
                    height={18}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                  <Skeleton
                    width="100%"
                    height={16}
                    count={2}
                    baseColor="rgba(14, 14, 14, 0.08)"
                    highlightColor="rgba(14, 14, 14, 0.15)"
                  />
                </div>

                {/* Список переваг */}
                <div className={s.cardListBlock}>
                  <div className={s.list}>
                    {/* Ліва колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={i} className={s.listItem}>
                          <Skeleton
                            width={32}
                            height={32}
                            borderRadius={16}
                            baseColor="rgba(132, 38, 215, 0.1)"
                            highlightColor="rgba(132, 38, 215, 0.2)"
                          />
                          <Skeleton
                            width="100%"
                            height={14}
                            baseColor="rgba(14, 14, 14, 0.08)"
                            highlightColor="rgba(14, 14, 14, 0.15)"
                          />
                        </li>
                      ))}
                    </ul>
                    {/* Права колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={i} className={s.listItem}>
                          <Skeleton
                            width={32}
                            height={32}
                            borderRadius={16}
                            baseColor="rgba(132, 38, 215, 0.1)"
                            highlightColor="rgba(132, 38, 215, 0.2)"
                          />
                          <Skeleton
                            width="100%"
                            height={14}
                            baseColor="rgba(14, 14, 14, 0.08)"
                            highlightColor="rgba(14, 14, 14, 0.15)"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Результат */}
                <div className={s.cardListBlock}>
                  <Skeleton
                    width={100}
                    height={18}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                  <div className={s.pills}>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        width={120}
                        height={40}
                        borderRadius={14}
                        baseColor="rgba(247, 247, 248, 0.8)"
                        highlightColor="rgba(247, 247, 248, 1)"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Футер з ціною та кнопкою */}
              <div className={s.cardFooter}>
                <div className={s.priceWrap}>
                  <Skeleton
                    width={40}
                    height={36}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                  <Skeleton
                    width={100}
                    height={28}
                    baseColor="rgba(14, 14, 14, 0.1)"
                    highlightColor="rgba(14, 14, 14, 0.2)"
                  />
                </div>
                <Skeleton
                  width={185}
                  height={64}
                  borderRadius={20}
                  baseColor="rgba(132, 38, 215, 0.2)"
                  highlightColor="rgba(132, 38, 215, 0.4)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningFormatsSkeleton;

