"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Swiper as SwiperType } from "swiper";
import styles from "./CourseReviews.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import ReviewModal from "@/components/ReviewModal/ReviewModal";
import { fetchWcReviews, createWcReview, type WcReview } from "@/lib/bfbApi";
import type { LoginFormValues } from "@/components/ReviewModal/ReviewForm";
interface ReviewUi {
  id: number;
  name: string;
  date: string;
  rating: number;
  text: string;
}

interface CourseReviewsProps {
  courseId?: string | number;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId }) => {
  const [reviews, setReviews] = useState<ReviewUi[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {
        per_page: 12,
        orderby: "date",
        order: "desc",
      };
      // WooCommerce API використовує параметр 'product' для фільтрації за product_id
      if (courseId) {
        params.product = courseId;
      }
      const data = await fetchWcReviews(params);
      
      const ui: ReviewUi[] = (data as WcReview[]).map((r: WcReview) => ({
        id: r.id,
        name: r.reviewer_name || r.reviewer || "Користувач",
        date: new Date(
          r.date_created_gmt || r.date_created || Date.now()
        ).toLocaleDateString("uk-UA"),
        rating: r.rating || 0,
        text: r.review?.replace(/<[^>]*>/g, "") || "",
      }));
      setReviews(ui);
    } catch {
      setReviews([]);
    }
  }, [courseId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);

  const handleSubmitReview = async (data: LoginFormValues) => {
    if (!courseId) {
      throw new Error("ID курсу не вказано");
    }

    const productId = typeof courseId === "string" ? parseInt(courseId, 10) : courseId;
    if (isNaN(productId)) {
      throw new Error("Невірний ID курсу");
    }

    await createWcReview({
      product_id: productId,
      review: data.question || "",
      reviewer: data.first_name,
      reviewer_email: data.email || "",
      rating: data.rating,
    });

    // Оновлюємо список відгуків після створення
    await loadReviews();
  };

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
          <button 
            className={styles.leaveReviewButton}
            onClick={() => setIsModalOpen(true)}
          >
            Залишити відгук
          </button>
        </div>

        <div className={styles.reviewsCarousel}>
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>Коментарів ще немає</div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              onSwiper={(sw) => (swiperRef.current = sw)}
              onSlideChange={(sw) => {
                // Обмежуємо максимальний індекс, щоб останній слайд не враховувався
                const maxIndex = Math.max(0, reviews.length - 2);
                const currentIndex = Math.min(sw.activeIndex, maxIndex);
                if (sw.activeIndex > maxIndex) {
                  sw.slideTo(maxIndex);
                } else {
                  setActive(currentIndex);
                }
              }}
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
                dynamicBullets: false,
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

        {reviews.length > 2 && (
          <SliderNav
            activeIndex={active}
            dots={Math.max(0, reviews.length - 1)}
            onPrev={() => swiperRef.current?.slidePrev()}
            onNext={() => {
              const maxIndex = Math.max(0, reviews.length - 2);
              if (swiperRef.current && active < maxIndex) {
                swiperRef.current.slideNext();
              }
            }}
            onDotClick={(idx) => {
              const maxIndex = Math.max(0, reviews.length - 2);
              const targetIndex = Math.min(idx, maxIndex);
              swiperRef.current?.slideTo(targetIndex);
            }}
          />
        )}
      </div>
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </section>
  );
};

export default CourseReviews;
