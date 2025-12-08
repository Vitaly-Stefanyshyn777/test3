"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./EventsSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const EventsSectionSkeleton: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.TitleTextBlock}>
            <Skeleton
              width={150}
              height={18}
              style={{ marginBottom: "8px" }}
              className={s.headerText}
            />
            <Skeleton
              width={600}
              height={68}
              style={{ lineHeight: "120%" }}
              className={s.title}
            />
          </div>
        </div>

        <div className={s.content}>
          {/* Ліва колонка */}
          <div className={s.leftColumn}>
            <div className={s.leftColumnWrapper}>
              {/* Календар */}
              <div className={s.calendarBlock}>
                <div className={s.calendar}>
                  <div className={s.calendarHeader}>
                    <Skeleton width={200} height={40} />
                    <div className={s.monthNavigation}>
                      <Skeleton
                        width={32}
                        height={32}
                        borderRadius={16}
                        style={{ marginRight: "8px" }}
                      />
                      <Skeleton width={32} height={32} borderRadius={16} />
                    </div>
                  </div>

                  <div className={s.calendarContent}>
                    {/* Дні тижня */}
                    <div className={s.weekDays}>
                      {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "НД"].map(
                        (day) => (
                          <div key={day} className={s.weekDay}>
                            <Skeleton width={30} height={16} />
                          </div>
                        )
                      )}
                    </div>

                    {/* Сітка календаря */}
                    <div className={s.calendarGrid}>
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className={s.calendarDay}>
                          <Skeleton width={40} height={40} borderRadius={8} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Заголовок списку подій */}
              <Skeleton width={150} height={24} className={s.eventsTitle} />

              {/* Список подій */}
              <div className={s.eventsListBlock}>
                <div className={s.eventsList}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={s.eventItem}>
                      <div className={s.eventDate}>
                        <Skeleton width={60} height={20} />
                        <Skeleton width={50} height={16} />
                      </div>
                      <div className={s.eventDivider}></div>
                      <div className={s.eventInfo}>
                        <Skeleton
                          width="80%"
                          height={24}
                          style={{ marginBottom: "8px" }}
                        />
                        <Skeleton count={2} height={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Права колонка */}
          <div className={s.rightColumn}>
            <div className={s.eventCardBlock}>
              <div className={s.eventCard}>
                {/* Зображення */}
                <div className={s.eventCardImage}>
                  <Skeleton height="100%" width="100%" />
                </div>
                <div className={s.eventCardImageWrap}>
                  <div className={s.eventCardContent}>
                    {/* Мета-теги */}
                    <div className={s.eventCardMeta}>
                      <Skeleton
                        width={120}
                        height={32}
                        borderRadius={8}
                        style={{ marginRight: "8px" }}
                      />
                      <Skeleton
                        width={150}
                        height={32}
                        borderRadius={8}
                        style={{ marginRight: "8px" }}
                      />
                      <Skeleton width={180} height={32} borderRadius={8} />
                    </div>

                    {/* Заголовок та опис */}
                    <div className={s.eventCardInfo}>
                      <Skeleton
                        width="80%"
                        height={32}
                        style={{ marginBottom: "16px" }}
                      />
                      <Skeleton count={4} height={16} style={{ marginBottom: "8px" }} />
                    </div>

                    {/* Результати */}
                    <div className={s.eventCardResults}>
                      <Skeleton width={100} height={20} style={{ marginBottom: "16px" }} />
                      <div className={s.resultsGrid}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={s.resultItem}>
                            <Skeleton width={24} height={24} borderRadius={4} />
                            <Skeleton width={120} height={16} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Кнопка */}
                  <Skeleton
                    width="100%"
                    height={64}
                    borderRadius={20}
                    className={s.eventCardButton}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSectionSkeleton;

