"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import s from "./HeroSection.module.css";
import { ArrowLeftIcon, ArrowRightIcon, TimePayIcon } from "../Icons/Icons";
import { fetchBanners, BannerPost } from "../../lib/bfbApi";
import VideoPlayer from "./ProfileSection/VideoInstruction/VideoPlayer";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";
import PageLoader from "../PageLoader";

const HeroSection = () => {
  const [banners, setBanners] = useState<BannerPost[]>([]);
  const [activeBannerId, setActiveBannerId] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Визначення мобільної версії
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const fetched = await fetchBanners();
        if (!mounted) return;

        const normalized = Array.isArray(fetched) ? fetched : [];
        setBanners(normalized);

        // Встановлюємо активний банер за пріоритетом: той, що має відео -> той, що має постер -> перший
        const bannerWithVideo = normalized.find((b) => {
          // Нова структура: acf.video.url (якщо video є об'єктом)
          if (
            b.acf?.video &&
            typeof b.acf.video === "object" &&
            !Array.isArray(b.acf.video)
          ) {
            if (b.acf.video.url) {
              return true;
            }
          }
          // Стара структура
          const video =
            b.Aside_video ||
            b.acf?.Aside_video ||
            b.video ||
            (typeof b.acf?.video === "string" ? b.acf.video : undefined) ||
            (Array.isArray(b.acf?.video) && b.acf.video.length > 0
              ? b.acf.video[0]
              : undefined) ||
            b.video_url ||
            b.acf?.video_url;
          return (
            (Array.isArray(video) && video.length > 0) ||
            (typeof video === "string" && video.length > 0)
          );
        });
        const bannerWithPoster = normalized.find((b) => {
          // Нова структура: acf.video.preview (якщо video є об'єктом)
          if (
            b.acf?.video &&
            typeof b.acf.video === "object" &&
            !Array.isArray(b.acf.video)
          ) {
            if (b.acf.video.preview) {
              return true;
            }
          }
          // Стара структура
          const photo =
            b.Aside_photo ||
            b.acf?.Aside_photo ||
            b.poster ||
            b.acf?.poster ||
            b.image ||
            b.acf?.image;
          return (
            (Array.isArray(photo) && photo.length > 0) ||
            (typeof photo === "string" && photo.length > 0)
          );
        });
        const initial =
          bannerWithVideo ?? bannerWithPoster ?? normalized[0] ?? null;
        setActiveBannerId(initial ? initial.id : null);
        if (initial) {
          const idx = normalized.findIndex((b) => b.id === initial.id);
          setActiveIndex(idx >= 0 ? idx : 0);
        }
      } catch {
        setBanners([]);
        setActiveBannerId(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Ініціалізація активного банера, якщо ще не встановлено, але банери є
  useEffect(() => {
    if (activeBannerId == null && banners.length > 0) {
      const first = banners[0];
      setActiveBannerId(first.id);
    }
  }, [banners, activeBannerId]);

  const activeBanner: BannerPost | null = useMemo(() => {
    if (!activeBannerId) return null;
    return banners.find((b) => b.id === activeBannerId) ?? null;
  }, [banners, activeBannerId]);

  // Helpers to read fields from a banner
  const getBackgroundFromBanner = useCallback(
    (b?: BannerPost | null): string => {
      if (!b) return "";

      // Нова структура: acf.image.mobile / acf.image.desctop
      if (b.acf?.image) {
        if (isMobile && b.acf.image.mobile) {
          return b.acf.image.mobile;
        }
        if (!isMobile && b.acf.image.desctop) {
          return b.acf.image.desctop;
        }
      }

      // На мобільних використовуємо Banner_Mobile, якщо він є (стара структура)
      if (isMobile) {
        const mobileBg = b.Banner_Mobile || b.acf?.Banner_Mobile;
        if (typeof mobileBg === "string" && mobileBg.length > 6) {
          return mobileBg;
        }
      }

      // Для десктопу або якщо Banner_Mobile немає, використовуємо звичайний Banner (стара структура)
      const rawBg =
        b.Banner ||
        b.acf?.Banner ||
        b.banner ||
        b.acf?.banner ||
        b.background ||
        b.acf?.background;

      return typeof rawBg === "string" && rawBg.length > 6 ? rawBg : "";
    },
    [isMobile]
  );

  const getVideoUrlFromBanner = (b?: BannerPost | null): string => {
    let rawVideoUrl = "";

    if (!b) {
      const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
      rawVideoUrl = `${baseUrl}/wp-content/uploads/2025/11/videopreview.mp4`;
    } else {
      // Нова структура: acf.video.url (якщо video є об'єктом)
      if (
        b.acf?.video &&
        typeof b.acf.video === "object" &&
        !Array.isArray(b.acf.video)
      ) {
        if (b.acf.video.url) {
          rawVideoUrl = b.acf.video.url;
        }
      }

      // Стара структура (якщо acf.video є рядком або масивом)
      if (!rawVideoUrl) {
        const video =
          b.Aside_video ||
          b.acf?.Aside_video ||
          b.video ||
          (typeof b.acf?.video === "string" ? b.acf.video : undefined) ||
          (Array.isArray(b.acf?.video) && b.acf.video.length > 0
            ? b.acf.video[0]
            : undefined) ||
          b.video_url ||
          b.acf?.video_url;

        if (Array.isArray(video) && video.length > 0) {
          rawVideoUrl = video[0];
        } else if (typeof video === "string" && video.length > 0) {
          rawVideoUrl = video;
        }
      }

      // Fallback до дефолтного відео
      if (!rawVideoUrl) {
        const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
        rawVideoUrl = `${baseUrl}/wp-content/uploads/2025/11/videopreview.mp4`;
      }
    }

    // Якщо URL вже є проксованим (починається з /api/video-proxy), повертаємо як є
    if (rawVideoUrl.startsWith("/api/video-proxy")) {
      return rawVideoUrl;
    }

    // Інакше проксуємо через /api/video-proxy для уникнення CORS проблем
    return `/api/video-proxy?url=${encodeURIComponent(rawVideoUrl)}`;
  };

  const getPosterFromBanner = (b?: BannerPost | null): string => {
    if (!b) return "";

    // Нова структура: acf.video.preview (якщо video є об'єктом)
    if (
      b.acf?.video &&
      typeof b.acf.video === "object" &&
      !Array.isArray(b.acf.video)
    ) {
      if (b.acf.video.preview) {
        return b.acf.video.preview;
      }
    }

    // Стара структура
    const asidePhoto = b.Aside_photo || b.acf?.Aside_photo;
    const acfPhoto = b.acf?.Aside_photo;
    const poster = b.poster || b.acf?.poster;
    const image = b.image || b.acf?.image;

    let url: string | undefined = undefined;
    if (Array.isArray(asidePhoto) && asidePhoto.length > 0) url = asidePhoto[0];
    else if (typeof asidePhoto === "string" && asidePhoto.length > 0)
      url = asidePhoto;
    else if (Array.isArray(acfPhoto) && acfPhoto.length > 0) url = acfPhoto[0];
    else if (typeof acfPhoto === "string" && acfPhoto.length > 0)
      url = acfPhoto;
    else if (Array.isArray(poster) && poster.length > 0) url = poster[0];
    else if (typeof poster === "string" && poster.length > 0) url = poster;
    else if (Array.isArray(image) && image.length > 0) url = image[0];
    else if (typeof image === "string" && image.length > 0) url = image;

    return typeof url === "string" ? url : "";
  };

  const videoUrl = useMemo(() => {
    return getVideoUrlFromBanner(activeBanner);
  }, [activeBanner]);

  const posterUrl = useMemo(() => {
    return getPosterFromBanner(activeBanner);
  }, [activeBanner]);

  const title =
    activeBanner?.acf?.title ||
    (activeBanner?.Title as string) ||
    (activeBanner?.title?.rendered as string) ||
    "";

  const titleSub = activeBanner?.acf?.title_sub || "";

  const description =
    activeBanner?.acf?.description ||
    (activeBanner?.Description as string) ||
    "";

  // Показуємо PageLoader поки дані завантажуються
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <section className={s.hero} data-hero-section>
      {/* Banner slider (background) */}
      {banners.length > 0 && (
        <Swiper
          modules={[A11y]}
          onSwiper={(inst) => setSwiper(inst)}
          onSlideChange={(inst) => {
            setActiveIndex(inst.activeIndex || 0);
            const b = banners[inst.activeIndex] || null;
            setActiveBannerId(b ? b.id : null);
          }}
          className={s.heroBanner}
          slidesPerView={1}
          spaceBetween={0}
          allowTouchMove={true}
          touchEventsTarget="container"
        >
          {banners.map((b) => (
            <SwiperSlide key={b.id}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `url(${getBackgroundFromBanner(
                    b
                  )}) center / cover no-repeat`,
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <div className={s.heroContainer}>
        <div className={s.heroContent}>
          <div className={s.heroContentBlock}>
            {titleSub && (
              <div className={s.roiBanner}>
                <div className={s.roiIcon}>
                  <div className={s.roiIcon}>
                    <TimePayIcon />
                  </div>
                </div>
                <span className={s.roiText}>{titleSub.toUpperCase()}</span>
              </div>
            )}

            <h1 className={s.heroTitle}>{title}</h1>

            <p className={s.heroDescription}>{description}</p>
          </div>

          <div className={s.heroActions}>
            <Link href="/courses-landing" className={s.heroButtonPrimary}>
              Про курс
            </Link>
            <Link href="/trainers" className={s.heroButtonSecondary}>
              Знайти інструктора
            </Link>
          </div>
        </div>
        {/* Floating video player (bottom-right like on screenshot) */}
        {showVideo && (!!videoUrl || !!posterUrl) && (
          <div className={s.heroVideo}>
            {videoUrl ? (
              <VideoPlayer
                videoUrl={videoUrl}
                poster={posterUrl || undefined}
                controls={false}
                onlyPlayPause={true}
                autoPlay={false}
                className="w-full h-full"
                overlayPlayButton={false}
                showCloseButton={true}
                onClose={() => setShowVideo(false)}
                noBlur={true}
              />
            ) : (
              <img
                src={posterUrl}
                alt="Video preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </div>
        )}
      </div>
      {banners.length > 1 && (
        <div className={s.heroNavigation}>
          <button
            className={s.navArrow}
            aria-label="Попередній слайд"
            onClick={() => {
              if (swiper) swiper.slidePrev();
            }}
          >
            <ArrowLeftIcon />
          </button>
          <div className={s.navDots}>
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                className={`${s.navDot} ${
                  i === activeIndex ? s.navDotActive : ""
                }`}
                aria-label={`Перейти до банера ${b.id}`}
                onClick={() => {
                  swiper?.slideTo(i);
                }}
              />
            ))}
          </div>
          <button
            className={s.navArrow}
            aria-label="Наступний слайд"
            onClick={() => {
              if (swiper) swiper.slideNext();
            }}
          >
            <ArrowRightIcon />
          </button>
        </div>
      )}
      <div className={s.heroOverlay}></div>
    </section>
  );
};

export default HeroSection;
