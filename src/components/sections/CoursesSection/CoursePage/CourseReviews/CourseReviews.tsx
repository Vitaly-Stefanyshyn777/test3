"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import styles from "./CourseReviews.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";

import { fetchWcReviews } from "@/lib/bfbApi";
interface ReviewUi {
  id: number;
  name: string;
  date: string;
  rating: number;
  text: string;
}

const CourseReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewUi[]>([]);
  useEffect(() => {
    let mounted = true;
    fetchWcReviews({ per_page: 12, orderby: "date", order: "desc" })
      .then(
        (
          data: Array<{
            id: number;
            reviewer_name?: string;
            reviewer?: string;
            date_created_gmt?: string;
            date_created?: string;
            rating?: number;
            review?: string;
          }>
        ) => {
          if (!mounted) return;
          const ui: ReviewUi[] = data.map((r) => ({
            id: r.id,
            name: r.reviewer_name || r.reviewer || "Користувач",
            date: new Date(
              r.date_created_gmt || r.date_created || Date.now()
            ).toLocaleDateString("uk-UA"),
            rating: r.rating || 0,
            text: r.review?.replace(/<[^>]*>/g, "") || "",
          }));
          setReviews(ui);
        }
      )
      .catch(() => setReviews([]));
    return () => {
      mounted = false;
    };
  }, []);

  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${
          index < rating ? styles.starFilled : styles.starEmpty
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <section className={styles.reviews}>
      <div className={styles.containerReviews}>
        <div className={styles.header}>
          <h2 className={styles.title}>Відгуки покупців</h2>
          <button className={styles.leaveReviewButton}>Залишити відгук</button>
        </div>

        <div className={styles.reviewsCarousel}>
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>Коментарів ще немає</div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              onSwiper={(sw) => (swiperRef.current = sw)}
              onSlideChange={(sw) => setActive(sw.activeIndex)}
              spaceBetween={16}
              slidesPerView={"auto"}
              centeredSlides={false}
              observer
              observeParents
              updateOnWindowResize
              slidesOffsetAfter={56}
              slidesOffsetBefore={0}
              navigation={{
                prevEl: `.${styles.reviewsPrev}`,
                nextEl: `.${styles.reviewsNext}`,
              }}
              pagination={{
                el: `.${styles.paginationDots}`,
                clickable: true,
                bulletClass: styles.dot,
                bulletActiveClass: `${styles.dotActive}`,
              }}
            >
              {reviews.map((review) => (
                <SwiperSlide
                  key={review.id}
                  className={styles.slide}
                  style={{ width: "566px" }}
                >
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.rating}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className={styles.reviewText}>{review.text}</p>
                    <div className={styles.reviewFooter}>
                      <span className={styles.reviewerName}>{review.name}</span>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {reviews.length > 0 && (
          <SliderNav
            activeIndex={active}
            dots={reviews.length}
            onPrev={() => swiperRef.current?.slidePrev()}
            onNext={() => swiperRef.current?.slideNext()}
            onDotClick={(idx) => swiperRef.current?.slideTo(idx)}
          />
        )}
      </div>
    </section>
  );
};

export default CourseReviews;
