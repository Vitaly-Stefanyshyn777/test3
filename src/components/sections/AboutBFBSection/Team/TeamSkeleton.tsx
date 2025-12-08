"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./Team.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const TeamSkeleton: React.FC = () => {
  return (
    <section className={s.teamSection}>
      <div className={s.teamContainer}>
        <div className={s.teamHeader}>
          <Skeleton
            width={150}
            height={18}
            style={{ marginBottom: "8px" }}
            className={s.teamSubtitle}
          />
          <Skeleton
            width={500}
            height={56}
            style={{ lineHeight: "100%" }}
            className={s.teamTitle}
          />
        </div>

        <div className={s.swiperContainer}>
          <div style={{ display: "flex", gap: "16px", overflow: "hidden" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={s.teamCard} style={{ flexShrink: 0 }}>
                {/* Зображення */}
                <div className={s.teamCardImage}>
                  <Skeleton height="100%" width="100%" />
                  {/* Instagram badge skeleton */}
                  <div className={s.instagramHandle}>
                    <Skeleton
                      width={16}
                      height={16}
                      borderRadius={4}
                      style={{ marginRight: "12px" }}
                    />
                    <Skeleton width={120} height={16} />
                  </div>
                </div>

                {/* Контент */}
                <div className={s.teamCardContent}>
                  <div className={s.teamCardContentHeader}>
                    <Skeleton width={150} height={16} className={s.teamCardRole} />
                    <Skeleton width={200} height={32} className={s.teamCardName} />
                  </div>

                  <div className={s.achievementsList}>
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className={s.achievementItem}>
                        <Skeleton
                          width={28}
                          height={28}
                          borderRadius={6}
                          className={s.achievementIcon}
                        />
                        <Skeleton width={180} height={16} className={s.achievementText} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSkeleton;

