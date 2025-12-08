"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import { useCoursesQuery } from "@/lib/coursesQueries";
import CourseCard from "../CourseCard/CourseCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import CoursesShowcaseSkeleton from "./CoursesShowcaseSkeleton";
import s from "./CoursesShowcase.module.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CoursesShowcase: React.FC = () => {
  const { data: courses = [], isLoading, isError } = useCoursesQuery();
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  type CourseItem = {
    id: string;
    name: string;
    description?: string;
    price?: number | string;
    originalPrice?: number | string;
    image?: string;
    rating?: number;
    reviewsCount?: number;
    requirements?: string;
    courseData?: {
      excerpt?: { rendered: string };
      Required_equipment?: string;
    };
    dateCreated?: string;
    wcProduct?: {
      prices?: {
        price?: string;
        regular_price?: string;
        sale_price?: string;
      };
      on_sale?: boolean;
      total_sales?: number;
      average_rating?: string;
      rating_count?: number;
      featured?: boolean;
    };
  };

  const list = useMemo<CourseItem[]>(
    () => (Array.isArray(courses) ? (courses as CourseItem[]) : []),
    [courses]
  );

  const displayedCourses = list;
  const hasSlider = displayedCourses.length > 5;

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

  const useSlider = hasSlider && !isMobile;

  const allProducts = useMemo(
    () =>
      list.map((item) => item?.wcProduct).filter(Boolean) as Array<{
        total_sales?: number;
      }>,
    [list]
  );

  const handlePrev = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slidePrev();
    } else {
      const swiperEl = document.querySelector(`.${s.swiper}`) as HTMLElement & {
        swiper?: {
          slidePrev: () => void;
          slideNext: () => void;
          slideTo: (index: number) => void;
        };
      };
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.slidePrev();
      }
    }
  };

  const handleNext = () => {
    if (swiperRef.current?.swiper) {
      const swiper = swiperRef.current.swiper;
      swiper.slideNext();
    } else {
      const swiperEl = document.querySelector(`.${s.swiper}`) as HTMLElement & {
        swiper?: {
          slidePrev: () => void;
          slideNext: () => void;
          slideTo: (index: number) => void;
        };
      };
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.slideNext();
      }
    }
  };

  const handleDotClick = (index: number) => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideToLoop(index);
    } else {
      const swiperEl = document.querySelector(`.${s.swiper}`) as HTMLElement & {
        swiper?: {
          slidePrev: () => void;
          slideNext: () => void;
          slideTo: (index: number) => void;
          slideToLoop: (index: number) => void;
        };
      };
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.slideToLoop(index);
      }
    }
  };

  if (isLoading) {
    return <CoursesShowcaseSkeleton />;
  }

  if (isError) {
    return (
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.header}>
            <div className={s.headerLeft}>
              <p className={s.eyebrow}>Початок навчання</p>
              <h2 className={s.title}>Почни свій шлях з BFB тут</h2>
            </div>
          </div>
          <div className={s.error}>Не вдалося завантажити курси</div>
        </div>
      </section>
    );
  }

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <p className={s.eyebrow}>Початок навчання</p>
            <h2 className={s.title}>Почни свій шлях з BFB тут</h2>
          </div>
          <div className={s.headerRight}>
            {useSlider && (
              <SliderNav
                activeIndex={activeIndex}
                dots={displayedCourses.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onDotClick={handleDotClick}
              />
            )}
          </div>
        </div>

        <div className={s.coursesSlider}>
          {useSlider ? (
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={5}
              slidesPerGroup={1}
              loop={true}
              allowSlideNext={true}
              allowSlidePrev={true}
              onSlideChange={(sw) => {
                const realIndex = sw.realIndex;
                setActiveIndex(realIndex);
              }}
              onSwiper={(swiper) => {
                // Swiper initialized
              }}
              breakpoints={{
                768: {
                  slidesPerView: 3,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 16,
                },
              }}
              className={s.swiper}
            >
              {displayedCourses.map((course) => {
                const normalizedWc =
                  course.wcProduct &&
                  ({
                    prices: {
                      price: course.wcProduct.prices?.price ?? "0",
                      regular_price:
                        course.wcProduct.prices?.regular_price ?? "0",
                      sale_price: course.wcProduct.prices?.sale_price ?? "0",
                    },
                    on_sale: course.wcProduct.on_sale,
                    total_sales: course.wcProduct.total_sales,
                    average_rating: course.wcProduct.average_rating,
                    rating_count: course.wcProduct.rating_count,
                    featured: course.wcProduct.featured,
                  } as const);
                return (
                  <SwiperSlide key={course.id} className={s.slide}>
                    <CourseCard
                      id={course.id}
                      name={course.name}
                      description={course.description}
                      price={
                        typeof course.price === "string"
                          ? parseInt(course.price)
                          : course.price || 5000
                      }
                      originalPrice={
                        typeof course.originalPrice === "string"
                          ? parseInt(course.originalPrice)
                          : course.originalPrice || 7000
                      }
                      isFavorite={false}
                      image={course.image}
                      rating={
                        typeof course.rating === "number"
                          ? course.rating
                          : Math.round(
                              parseFloat(
                                course?.wcProduct?.average_rating?.toString() ||
                                  "0"
                              )
                            )
                      }
                      reviewsCount={
                        typeof course.reviewsCount === "number"
                          ? course.reviewsCount
                          : (course?.wcProduct?.rating_count as number) || 0
                      }
                      requirements={
                        course?.requirements ||
                        course?.courseData?.Required_equipment ||
                        ""
                      }
                      dateCreated={course.dateCreated}
                      wcProduct={normalizedWc}
                      allProducts={allProducts}
                      subscriptionDiscount={20}
                      courseData={course.courseData}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className={s.grid}>
              {displayedCourses.map((course) => {
                const normalizedWc =
                  course.wcProduct &&
                  ({
                    prices: {
                      price: course.wcProduct.prices?.price ?? "0",
                      regular_price:
                        course.wcProduct.prices?.regular_price ?? "0",
                      sale_price: course.wcProduct.prices?.sale_price ?? "0",
                    },
                    on_sale: course.wcProduct.on_sale,
                    total_sales: course.wcProduct.total_sales,
                    average_rating: course.wcProduct.average_rating,
                    rating_count: course.wcProduct.rating_count,
                    featured: course.wcProduct.featured,
                  } as const);
                return (
                  <div key={course.id} className={s.slide}>
                    <CourseCard
                      id={course.id}
                      name={course.name}
                      description={course.description}
                      price={
                        typeof course.price === "string"
                          ? parseInt(course.price)
                          : course.price || 5000
                      }
                      originalPrice={
                        typeof course.originalPrice === "string"
                          ? parseInt(course.originalPrice)
                          : course.originalPrice || 7000
                      }
                      isFavorite={false}
                      image={course.image}
                      rating={
                        typeof course.rating === "number"
                          ? course.rating
                          : Math.round(
                              parseFloat(
                                course?.wcProduct?.average_rating?.toString() ||
                                  "0"
                              )
                            )
                      }
                      reviewsCount={
                        typeof course.reviewsCount === "number"
                          ? course.reviewsCount
                          : (course?.wcProduct?.rating_count as number) || 0
                      }
                      requirements={
                        course?.requirements ||
                        course?.courseData?.Required_equipment ||
                        ""
                      }
                      dateCreated={course.dateCreated}
                      wcProduct={normalizedWc}
                      allProducts={allProducts}
                      subscriptionDiscount={20}
                      courseData={course.courseData}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={s.footer}>
          <Link href="/courses" className={s.allCoursesBtn}>
            До усіх курсів
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesShowcase;
