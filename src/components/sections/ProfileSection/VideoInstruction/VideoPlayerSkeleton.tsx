"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./VideoPlayer.module.css";
import "react-loading-skeleton/dist/skeleton.css";

interface VideoPlayerSkeletonProps {
  showCloseButton?: boolean;
  className?: string;
  asOverlay?: boolean; // Якщо true - абсолютно позиціонований overlay, якщо false - окремий компонент з контейнером
}

const VideoPlayerSkeleton: React.FC<VideoPlayerSkeletonProps> = ({
  showCloseButton = false,
  className = "",
  asOverlay = false,
}) => {
  const containerStyle = asOverlay
    ? {
        position: "absolute" as const,
        inset: 0,
        zIndex: 15,
        pointerEvents: "none" as const,
      }
    : {};

  const Container = asOverlay ? "div" : "div";

  return (
    <Container
      className={asOverlay ? className : `${styles.container} ${className}`}
      style={containerStyle}
    >
      {/* Skeleton для кнопки закриття */}
      {showCloseButton && (
        <div
          style={{
            position: "absolute",
            left: "16px",
            top: "16px",
            zIndex: 20,
          }}
        >
          <Skeleton
            width={109}
            height={44}
            borderRadius={62}
            baseColor="rgba(255, 254, 252, 0.2)"
            highlightColor="rgba(255, 254, 252, 0.4)"
            style={{
              backdropFilter: "blur(20px)",
            }}
          />
        </div>
      )}

      {/* Skeleton для основного відео контенту */}
      <Skeleton
        height="100%"
        width="100%"
        baseColor="rgba(0, 0, 0, 0.4)"
        highlightColor="rgba(0, 0, 0, 0.6)"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* Skeleton для play button в центрі */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <Skeleton
          width={109}
          height={109}
          borderRadius={62}
          baseColor="rgba(255, 254, 252, 0.3)"
          highlightColor="rgba(255, 254, 252, 0.5)"
          style={{
            backdropFilter: "blur(20px)",
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
          }}
        />
      </div>
    </Container>
  );
};

export default VideoPlayerSkeleton;

