"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./HeroSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const HeroSectionSkeleton = () => {
  return (
    <section className={s.hero}>
      {/* Skeleton для фону банера */}
      <div className={s.heroBanner}>
        <Skeleton
          height="100%"
          width="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
          baseColor="rgba(132, 38, 215, 0.1)"
          highlightColor="rgba(132, 38, 215, 0.2)"
        />
      </div>

      <div className={s.heroContainer}>
        <div className={s.heroContent}>
          <div className={s.heroContentBlock}>
            {/* Skeleton для ROI бейджа */}
            <Skeleton
              width={263}
              height={46}
              borderRadius={8}
              baseColor="rgba(255, 255, 255, 0.1)"
              highlightColor="rgba(255, 255, 255, 0.2)"
              style={{ backdropFilter: "blur(10px)" }}
            />

            {/* Skeleton для заголовка */}
            <div style={{ width: "100%" }}>
              <Skeleton
                className={s.heroSkeletonTitleMain}
                style={{ lineHeight: "110%", marginBottom: "16px" }}
                baseColor="rgba(255, 255, 255, 0.1)"
                highlightColor="rgba(255, 255, 255, 0.2)"
              />
              <Skeleton
                className={s.heroSkeletonTitleSub}
                style={{ lineHeight: "110%" }}
                baseColor="rgba(255, 255, 255, 0.1)"
                highlightColor="rgba(255, 255, 255, 0.2)"
              />
            </div>

            {/* Skeleton для опису */}
            <Skeleton
              width="100%"
              height={16}
              count={3}
              style={{ lineHeight: "140%", marginBottom: "8px" }}
              baseColor="rgba(255, 255, 255, 0.1)"
              highlightColor="rgba(255, 255, 255, 0.2)"
            />
          </div>

          {/* Skeleton для кнопок */}
          <div className={s.heroActions}>
            <Skeleton
              width={150}
              height={64}
              borderRadius={20}
              baseColor="rgba(132, 38, 215, 0.3)"
              highlightColor="rgba(132, 38, 215, 0.5)"
            />
            <Skeleton
              width={200}
              height={64}
              borderRadius={20}
              baseColor="rgba(255, 255, 255, 0.1)"
              highlightColor="rgba(255, 255, 255, 0.2)"
            />
          </div>
        </div>

        {/* Skeleton для відео */}
        <div className={s.heroVideo}>
          <Skeleton
            height="100%"
            width="100%"
            borderRadius={20}
            baseColor="rgba(0, 0, 0, 0.3)"
            highlightColor="rgba(0, 0, 0, 0.5)"
          />
        </div>
      </div>

      {/* Overlay */}
      <div className={s.heroOverlay}></div>
    </section>
  );
};

export default HeroSectionSkeleton;
