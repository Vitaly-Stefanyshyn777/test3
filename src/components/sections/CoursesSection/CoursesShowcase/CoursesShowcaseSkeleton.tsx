"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { CardSkeleton } from "@/components/ui/CardSkeleton/CardSkeleton";
import s from "./CoursesShowcase.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CoursesShowcaseSkeleton = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        {/* Skeleton для заголовка */}
        <div className={s.header}>
          <div className={s.headerLeft}>
            <Skeleton
              width={150}
              height={18}
              baseColor="rgba(132, 38, 215, 0.1)"
              highlightColor="rgba(132, 38, 215, 0.2)"
            />
            <Skeleton
              width={400}
              height={48}
              baseColor="rgba(14, 14, 14, 0.1)"
              highlightColor="rgba(14, 14, 14, 0.2)"
            />
          </div>
          <div className={s.headerRight}>
            {/* Skeleton для навігації */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Skeleton
                width={40}
                height={40}
                borderRadius={8}
                baseColor="rgba(14, 14, 14, 0.1)"
                highlightColor="rgba(14, 14, 14, 0.2)"
              />
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    width={8}
                    height={8}
                    borderRadius="50%"
                    baseColor={i === 1 ? "rgba(14, 14, 14, 0.3)" : "rgba(14, 14, 14, 0.1)"}
                    highlightColor={i === 1 ? "rgba(14, 14, 14, 0.5)" : "rgba(14, 14, 14, 0.2)"}
                  />
                ))}
              </div>
              <Skeleton
                width={40}
                height={40}
                borderRadius={8}
                baseColor="rgba(14, 14, 14, 0.1)"
                highlightColor="rgba(14, 14, 14, 0.2)"
              />
            </div>
          </div>
        </div>

        {/* Skeleton для карток */}
        <div className={s.coursesSlider}>
          <div className={s.grid}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={s.slide}>
                <CardSkeleton
                  showDescription={true}
                  showRating={true}
                  showRequirements={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton для футера */}
        <div className={s.footer}>
          <Skeleton
            width={200}
            height={64}
            borderRadius={20}
            baseColor="rgba(132, 38, 215, 0.2)"
            highlightColor="rgba(132, 38, 215, 0.4)"
          />
        </div>
      </div>
    </section>
  );
};

export default CoursesShowcaseSkeleton;

