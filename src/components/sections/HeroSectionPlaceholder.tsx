"use client";
import React from "react";
import s from "./HeroSection.module.css";

interface HeroSectionPlaceholderProps {
  isMobile: boolean;
}

const HeroSectionPlaceholder = ({ isMobile }: HeroSectionPlaceholderProps) => {
  return (
    <section className={s.hero}>
      {/* Білий плейсхолдер для банера */}
      <div
        className={s.heroBanner}
        style={{
          background: "#ffffff",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />

      <div className={s.heroContainer}>
        <div className={s.heroContent}>
          <div className={s.heroContentBlock}>
            {/* Білий плейсхолдер для ROI бейджа */}
            <div
              style={{
                width: "263px",
                height: "46px",
                background: "#ffffff",
                borderRadius: "8px",
                opacity: 0.8,
              }}
            />

            {/* Білий плейсхолдер для заголовка */}
            <div style={{ width: "100%" }}>
              <div
                style={{
                  width: "40vw",
                  height: "5vw",
                  background: "#ffffff",
                  marginBottom: "16px",
                  opacity: 0.8,
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: "30vw",
                  height: "5vw",
                  background: "#ffffff",
                  opacity: 0.8,
                  borderRadius: "4px",
                }}
              />
            </div>

            {/* Білий плейсхолдер для опису */}
            <div style={{ width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: "16px",
                  background: "#ffffff",
                  marginBottom: "8px",
                  opacity: 0.8,
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: "90%",
                  height: "16px",
                  background: "#ffffff",
                  marginBottom: "8px",
                  opacity: 0.8,
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: "80%",
                  height: "16px",
                  background: "#ffffff",
                  opacity: 0.8,
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          {/* Білий плейсхолдер для кнопок */}
          <div className={s.heroActions}>
            <div
              style={{
                width: "150px",
                height: "64px",
                background: "#ffffff",
                borderRadius: "20px",
                opacity: 0.8,
              }}
            />
            <div
              style={{
                width: "200px",
                height: "64px",
                background: "#ffffff",
                borderRadius: "20px",
                opacity: 0.8,
              }}
            />
          </div>
        </div>

        {/* Білий плейсхолдер для відео тільки на мобільних */}
        {isMobile && (
          <div className={s.heroVideo}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#ffffff",
                borderRadius: "20px",
                opacity: 0.8,
              }}
            />
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className={s.heroOverlay}></div>
    </section>
  );
};

export default HeroSectionPlaceholder;
