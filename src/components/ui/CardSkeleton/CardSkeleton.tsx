"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CardSkeletonProps {
  showDescription?: boolean;
  showRating?: boolean;
  showRequirements?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showDescription = false,
  showRating = false,
  showRequirements = false,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Зображення */}
      <div style={{ position: "relative", width: "100%", height: "251px" }}>
        <Skeleton
          height="100%"
          width="100%"
          baseColor="rgba(132, 38, 215, 0.1)"
          highlightColor="rgba(132, 38, 215, 0.2)"
        />
        {/* Skeleton для бейджів */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            gap: "6px",
            zIndex: 2,
          }}
        >
          <Skeleton
            width={42}
            height={36}
            borderRadius={10}
            baseColor="rgba(132, 38, 215, 0.3)"
            highlightColor="rgba(132, 38, 215, 0.5)"
          />
        </div>
        {/* Skeleton для favorite button */}
        <div
          style={{
            position: "absolute",
            top: "25px",
            right: "25px",
            zIndex: 2,
          }}
        >
          <Skeleton
            width={48}
            height={48}
            borderRadius={8}
            baseColor="rgba(255, 255, 255, 0.9)"
            highlightColor="rgba(255, 255, 255, 1)"
          />
        </div>
      </div>

      {/* Контент */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
        }}
      >
        {/* Назва */}
        <Skeleton
          width="100%"
          height={20}
          baseColor="rgba(14, 14, 14, 0.1)"
          highlightColor="rgba(14, 14, 14, 0.2)"
        />

        {/* Опис (для курсів) */}
        {showDescription && (
          <Skeleton
            width="100%"
            height={14}
            count={2}
            baseColor="rgba(14, 14, 14, 0.08)"
            highlightColor="rgba(14, 14, 14, 0.15)"
            style={{ marginBottom: "4px" }}
          />
        )}

        {/* Рейтинг (для курсів) */}
        {showRating && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Skeleton
              width={80}
              height={16}
              baseColor="rgba(14, 14, 14, 0.08)"
              highlightColor="rgba(14, 14, 14, 0.15)"
            />
          </div>
        )}

        {/* Requirements badge (для курсів) */}
        {showRequirements && (
          <Skeleton
            width={200}
            height={24}
            borderRadius={12}
            baseColor="rgba(132, 38, 215, 0.1)"
            highlightColor="rgba(132, 38, 215, 0.2)"
          />
        )}

        {/* Футер з ціною та кнопкою */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Ціна */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <Skeleton
              width={80}
              height={24}
              baseColor="rgba(14, 14, 14, 0.1)"
              highlightColor="rgba(14, 14, 14, 0.2)"
            />
            <Skeleton
              width={60}
              height={18}
              baseColor="rgba(192, 192, 192, 0.3)"
              highlightColor="rgba(192, 192, 192, 0.5)"
            />
          </div>

          {/* Кнопка корзини */}
          <Skeleton
            width={48}
            height={48}
            borderRadius={8}
            baseColor="rgba(132, 38, 215, 0.2)"
            highlightColor="rgba(132, 38, 215, 0.4)"
          />
        </div>
      </div>
    </div>
  );
};

