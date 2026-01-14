"use client";
import React from "react";
import s from "./LearningFormats.module.css";

const LearningFormatsSkeleton = () => {
  return (
    <section id="LearningFormats" className={s.section}>
      <div className={s.container}>
        {/* Skeleton для заголовка */}
        <div className={s.header}>
          <div className={`${s.skeleton} ${s.skeletonCardListTitle}`}></div>
          <div className={`${s.skeleton} ${s.skeletonSubtitle}`}></div>
        </div>

        {/* Skeleton для карток */}
        <div className={s.cards}>
          {/* Перша картка */}
          <div className={s.skeletonCard}>
            <div className={`${s.skeleton} ${s.skeletonCardImage}`}></div>

            <div className={s.skeletonCardBody}>
              <div className={s.skeletonCardListContainer}>
                {/* Про курс */}
                <div className={s.skeletonCardListBlock}>
                  <div className={`${s.skeleton} ${s.skeletonCardListTitle}`}></div>
                  <div className={`${s.skeleton} ${s.skeletonCardListText}`}></div>
                </div>

                {/* Список переваг - 2 колонки по 3 елементи */}
                <div className={s.skeletonCardListBlock}>
                  <div className={s.list}>
                    {/* Ліва колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={`left-${i}`} className={s.listItem}>
                          <div className={`${s.skeleton} ${s.skeletonListItemIcon}`}></div>
                          <div className={`${s.skeleton} ${s.skeletonListItemText}`}></div>
                        </li>
                      ))}
                    </ul>
                    {/* Права колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={`right-${i}`} className={s.listItem}>
                          <div className={`${s.skeleton} ${s.skeletonListItemIcon}`}></div>
                          <div className={`${s.skeleton} ${s.skeletonListItemText}`}></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Результат */}
                <div className={s.skeletonCardListBlock}>
                  <div className={`${s.skeleton} ${s.skeletonCardListTitle}`}></div>
                  <ul className={s.skeletonPills}>
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className={s.skeletonPill}>
                        <div className={`${s.skeleton} ${s.skeletonPillIcon}`}></div>
                        <div className={`${s.skeleton} ${s.skeletonPillText}`}></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Футер з ціною та кнопкою */}
              <div className={s.skeletonCardFooter}>
                <div className={s.skeletonPriceContainer}>
                  <div className={`${s.skeleton} ${s.skeletonPriceOld}`}></div>
                  <div className={`${s.skeleton} ${s.skeletonPrice}`}></div>
                </div>
                <div className={`${s.skeleton} ${s.skeletonButton}`}></div>
              </div>
            </div>
          </div>

          {/* Друга картка */}
          <div className={s.skeletonCard}>
            <div className={`${s.skeleton} ${s.skeletonCardImage}`}></div>

            <div className={s.skeletonCardBody}>
              <div className={s.skeletonCardListContainer}>
                {/* Про курс */}
                <div className={s.skeletonCardListBlock}>
                  <div className={`${s.skeleton} ${s.skeletonCardListTitle}`}></div>
                  <div className={`${s.skeleton} ${s.skeletonCardListText}`}></div>
                </div>

                {/* Список переваг - 2 колонки по 3 елементи */}
                <div className={s.skeletonCardListBlock}>
                  <div className={s.list}>
                    {/* Ліва колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={`left-${i}`} className={s.listItem}>
                          <div className={`${s.skeleton} ${s.skeletonListItemIcon}`}></div>
                          <div className={`${s.skeleton} ${s.skeletonListItemText}`}></div>
                        </li>
                      ))}
                    </ul>
                    {/* Права колонка */}
                    <ul className={s.listColumn}>
                      {[1, 2, 3].map((i) => (
                        <li key={`right-${i}`} className={s.listItem}>
                          <div className={`${s.skeleton} ${s.skeletonListItemIcon}`}></div>
                          <div className={`${s.skeleton} ${s.skeletonListItemText}`}></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Результат */}
                <div className={s.skeletonCardListBlock}>
                  <div className={`${s.skeleton} ${s.skeletonCardListTitle}`}></div>
                  <ul className={s.skeletonPills}>
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className={s.skeletonPill}>
                        <div className={`${s.skeleton} ${s.skeletonPillIcon}`}></div>
                        <div className={`${s.skeleton} ${s.skeletonPillText}`}></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Футер з ціною та кнопкою */}
              <div className={s.skeletonCardFooter}>
                <div className={s.skeletonPriceContainer}>
                  <div className={`${s.skeleton} ${s.skeletonPriceOld}`}></div>
                  <div className={`${s.skeleton} ${s.skeletonPrice}`}></div>
                </div>
                <div className={`${s.skeleton} ${s.skeletonButton}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningFormatsSkeleton;

