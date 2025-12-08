"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./Founder.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const FounderSkeleton = () => {
  return (
    <section className={s.founderSection}>
      <div className={s.founderContainer}>
        {/* Ліва колонка */}
        <div className={s.founderLeft}>
          {/* Картка "Про мене" */}
          <div className={s.founderCard} style={{ position: "relative" }}>
            {/* Skeleton для фону зображення */}
            <Skeleton
              height="100%"
              width="100%"
              baseColor="rgba(132, 38, 215, 0.1)"
              highlightColor="rgba(132, 38, 215, 0.2)"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                borderRadius: "16px",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Instagram badge */}
              <div className={s.founderAboutMe}>
                <Skeleton
                  width={24}
                  height={24}
                  borderRadius={8}
                  baseColor="rgba(255, 255, 255, 0.3)"
                  highlightColor="rgba(255, 255, 255, 0.5)"
                />
                <Skeleton
                  width={120}
                  height={18}
                  baseColor="rgba(255, 255, 255, 0.3)"
                  highlightColor="rgba(255, 255, 255, 0.5)"
                />
              </div>

              {/* Контент "Про мене" */}
              <div className={s.foundermission}>
                <Skeleton
                  width={150}
                  height={32}
                  baseColor="rgba(255, 255, 255, 0.3)"
                  highlightColor="rgba(255, 255, 255, 0.5)"
                  style={{ marginBottom: "12px" }}
                />
                <Skeleton
                  width="100%"
                  height={16}
                  count={3}
                  baseColor="rgba(255, 255, 255, 0.2)"
                  highlightColor="rgba(255, 255, 255, 0.4)"
                />
              </div>
            </div>
          </div>

          {/* Картка "Моя місія" */}
          <div className={s.founderMission} style={{ position: "relative" }}>
            {/* Skeleton для фону зображення */}
            <Skeleton
              height="100%"
              width="100%"
              baseColor="rgba(132, 38, 215, 0.1)"
              highlightColor="rgba(132, 38, 215, 0.2)"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                borderRadius: "28px",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
              {/* Іконки */}
              <div className={s.founderMissionIcons}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={s.founderMissionIcon}>
                    <Skeleton
                      width={28}
                      height={28}
                      borderRadius={8}
                      baseColor="rgba(132, 38, 215, 0.2)"
                      highlightColor="rgba(132, 38, 215, 0.4)"
                    />
                  </div>
                ))}
              </div>

              {/* Контент "Моя місія" */}
              <div className={s.founderMissionContent}>
                <Skeleton
                  width={150}
                  height={32}
                  baseColor="rgba(255, 255, 255, 0.3)"
                  highlightColor="rgba(255, 255, 255, 0.5)"
                  style={{ marginBottom: "12px" }}
                />
                <Skeleton
                  width="100%"
                  height={16}
                  count={3}
                  baseColor="rgba(255, 255, 255, 0.2)"
                  highlightColor="rgba(255, 255, 255, 0.4)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Центральна картка з зображенням */}
        <div className={s.missionCard} style={{ position: "relative" }}>
          {/* Skeleton для фону зображення */}
          <Skeleton
            height="100%"
            width="100%"
            baseColor="rgba(132, 38, 215, 0.1)"
            highlightColor="rgba(132, 38, 215, 0.2)"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              borderRadius: "28px",
            }}
          />
          <div className={s.missionCardContent} style={{ position: "relative", zIndex: 1 }}>
            <Skeleton
              width={200}
              height={20}
              baseColor="rgba(255, 255, 255, 0.3)"
              highlightColor="rgba(255, 255, 255, 0.5)"
            />
            <Skeleton
              width={300}
              height={56}
              baseColor="rgba(255, 255, 255, 0.3)"
              highlightColor="rgba(255, 255, 255, 0.5)"
            />
          </div>
        </div>

        {/* Права колонка з досягненнями */}
        <div className={s.achievements}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={s.achievementCard} style={{ maxWidth: "444px", width: "444px" }}>
              {/* Іконка */}
              <div className={s.achievementIcon}>
                <Skeleton
                  width={32}
                  height={32}
                  borderRadius={8}
                  baseColor="rgba(132, 38, 215, 0.2)"
                  highlightColor="rgba(132, 38, 215, 0.4)"
                />
              </div>

              {/* Число та опис */}
              <div className={s.achievementNumberDescription}>
                <Skeleton
                  width={100}
                  height={40}
                  baseColor="rgba(14, 14, 14, 0.1)"
                  highlightColor="rgba(14, 14, 14, 0.2)"
                  style={{ marginBottom: "6px" }}
                />
                <Skeleton
                  width="100%"
                  height={16}
                  count={2}
                  baseColor="rgba(14, 14, 14, 0.08)"
                  highlightColor="rgba(14, 14, 14, 0.15)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FounderSkeleton;

