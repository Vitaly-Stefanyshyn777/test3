import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./InstructingSlider.module.css";
import SliderNav from "../../../ui/SliderNav/SliderNavActions";
import { CloseButtonIcon } from "../../../Icons/Icons";

interface InstructingSliderProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const InstructingSlider: React.FC<InstructingSliderProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialIndex);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    setCurrentSlide(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
      document.body.classList.add("instructing-slider-open");
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.style.top = "unset";
      document.body.classList.remove("instructing-slider-open");
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.style.top = "unset";
      document.body.classList.remove("instructing-slider-open");
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          prevSlide();
          break;
        case "ArrowRight":
          nextSlide();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide, onClose, nextSlide, prevSlide]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalBlock}>
          <p className={styles.modalText}>Gym Fit Dance FLY</p>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseButtonIcon />
          </button>
        </div>

        <div className={styles.mainImageContainer}>
          <div className={styles.mainImageBlock}>
            <Image
              src={images[currentSlide]}
              alt={`Зображення ${currentSlide + 1}`}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 90vw"
              priority
            />
          </div>

          <div className={styles.thumbnailContainer}>
            <div className={styles.thumbnails}>
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${
                    index === currentSlide ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <Image
                    src={image}
                    alt={`Мініатюра ${index + 1}`}
                    fill
                    sizes="100px"
                    className={styles.thumbnailImage}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sliderNavContainer}>
          <SliderNav
            activeIndex={currentSlide}
            dots={images.length}
            onPrev={prevSlide}
            onNext={nextSlide}
            onDotClick={setCurrentSlide}
            buttonBgColor="var(--white)"
          />
        </div>
      </div>
    </div>
  );
};

export default InstructingSlider;
