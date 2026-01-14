"use client";
import { useState, useEffect, useRef } from "react";

export interface ProductImage {
  src: string;
  alt?: string;
}

export function useProductGallery(images: ProductImage[], isMobile: boolean = false) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const imagesLength = images?.length ?? 0;
  const maxVisibleThumbs = 7;
  const baseItemsPerView = 5;
  const itemsPerView = isMobile ? 4 : baseItemsPerView;
  const thumbNavThreshold = isMobile ? 4 : maxVisibleThumbs;
  const shouldShowThumbNav = imagesLength > thumbNavThreshold;

  // Скидання індексу при зміні зображень
  useEffect(() => {
    setSelectedImageIndex(0);
    setThumbStart(0);
  }, [images]);

  // Оновлення thumbStart при зміні мобільного режиму
  useEffect(() => {
    setThumbStart(0);
  }, [isMobile]);

  const onThumbPrev = () => {
    if (!imagesLength) return;

    if (isMobile && thumbsRef.current) {
      // На мобільному прокручуємо мініатюри
      const thumbButtons = Array.from(
        thumbsRef.current.querySelectorAll("button")
      ).filter((btn) => btn.querySelector("img") !== null) as HTMLElement[];

      if (thumbButtons.length > 0) {
        const scrollAmount = thumbButtons[0].offsetWidth + 8; // thumbnail width + gap
        thumbsRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      setSelectedImageIndex((idx) => (idx - 1 + imagesLength) % imagesLength);
      if (imagesLength > maxVisibleThumbs) {
        setThumbStart((s) => (s - 1 + imagesLength) % imagesLength);
      }
    }
  };

  const onThumbNext = () => {
    if (!imagesLength) return;

    if (isMobile && thumbsRef.current) {
      // На мобільному прокручуємо мініатюри
      const thumbButtons = Array.from(
        thumbsRef.current.querySelectorAll("button")
      ).filter((btn) => btn.querySelector("img") !== null) as HTMLElement[];

      if (thumbButtons.length > 0) {
        const scrollAmount = thumbButtons[0].offsetWidth + 8; // thumbnail width + gap
        thumbsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      setSelectedImageIndex((idx) => (idx + 1) % imagesLength);
      if (imagesLength > maxVisibleThumbs) {
        setThumbStart((s) => (s + 1) % imagesLength);
      }
    }
  };

  const selectImage = (index: number) => {
    if (index >= 0 && index < imagesLength) {
      setSelectedImageIndex(index);
    }
  };

  // Обчислюємо видимі мініатюри для десктопу
  const visibleThumbs = isMobile
    ? images.map((_, i) => i)
    : imagesLength > maxVisibleThumbs
    ? Array.from({ length: maxVisibleThumbs }).map(
        (_, i) => (thumbStart + i) % imagesLength
      )
    : images.map((_, i) => i);

  return {
    selectedImageIndex,
    thumbStart,
    thumbsRef,
    itemsPerView,
    shouldShowThumbNav,
    visibleThumbs,
    onThumbPrev,
    onThumbNext,
    selectImage,
  };
}

