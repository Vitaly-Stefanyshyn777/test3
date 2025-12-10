"use client";
import React, { useMemo } from "react";
import styles from "./CoursesGrid.module.css";
import CourseCard from "../CourseCard/CourseCard";
import { useCoursesQuery } from "@/lib/coursesQueries";
import CoursesGridSkeleton from "./CoursesGridSkeleton";
import EmptyState from "@/components/ui/EmptyState";

type CourseItem = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  price?: number | string;
  originalPrice?: number | string;
  image?: string;
  rating?: number;
  reviewsCount?: number;
  requirements?: string;
  categories?: Array<{ id: number; name: string; slug: string }>;
  courseData?: {
    excerpt?: { rendered: string };
    Required_equipment?: string;
    Course_themes?: string[];
    What_learn?: string[];
    Course_include?: string[];
    Course_program?: Array<unknown>;
    Date_start?: string;
    Duration?: string;
    Course_coach?: { ID: number } | null;
    Blocks?: unknown;
    Online_lessons?: unknown;
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

interface CoursesGridProps {
  courses?: CourseItem[];
  isLoading?: boolean;
  hasFilters?: boolean; // Чи є активні фільтри
}

const CoursesGrid = ({ 
  courses: coursesFromProps, 
  isLoading: isLoadingFromProps,
  hasFilters = false 
}: CoursesGridProps = {}) => {
  const { data: coursesFromQuery = [], isLoading: isLoadingQuery, isError } = useCoursesQuery();
  
  const courses = useMemo<CourseItem[]>(
    () => {
      if (coursesFromProps !== undefined) return coursesFromProps;
      return Array.isArray(coursesFromQuery) ? (coursesFromQuery as CourseItem[]) : [];
    },
    [coursesFromProps, coursesFromQuery]
  );
  
  const isLoading = isLoadingFromProps !== undefined ? isLoadingFromProps : isLoadingQuery;

  // Отримуємо allProducts для розрахунку хітів (як в CoursesShowcase)
  const allProducts = useMemo(
    () =>
      courses.map((item) => item?.wcProduct).filter(Boolean) as Array<{
        total_sales?: number;
      }>,
    [courses]
  );

  // Під час завантаження завжди показуємо скелетон
  if (isLoading) {
    return <CoursesGridSkeleton />;
  }

  if (isError) {
    return <div className={styles.error}>Помилка завантаження курсів</div>;
  }

  // "Курсів не знайдено" показуємо якщо немає курсів
  if (courses.length === 0) {
    return (
      <div className={styles.productsGridContainer}>
        <EmptyState variant="courses" />
      </div>
    );
  }

  return (
    <div className={styles.productsGridContainer}>
      <div className={styles.productsGrid}>
        {courses.map((course) => {
          const courseWcProduct = (course as any).wcProduct;
          
          const normalizedWc = courseWcProduct
            ? {
                prices: {
                  price: courseWcProduct.prices?.price && courseWcProduct.prices.price !== "" && courseWcProduct.prices.price !== "0"
                    ? courseWcProduct.prices.price
                    : "0",
                  regular_price: courseWcProduct.prices?.regular_price && courseWcProduct.prices.regular_price !== "" && courseWcProduct.prices.regular_price !== "0"
                    ? courseWcProduct.prices.regular_price
                    : "0",
                  sale_price: courseWcProduct.prices?.sale_price && courseWcProduct.prices.sale_price !== "" && courseWcProduct.prices.sale_price !== "0"
                    ? courseWcProduct.prices.sale_price
                    : "0",
                },
                on_sale: courseWcProduct.on_sale || false,
                total_sales: courseWcProduct.total_sales || 0,
                average_rating: courseWcProduct.average_rating || "0",
                rating_count: courseWcProduct.rating_count || 0,
                featured: courseWcProduct.featured || false,
              }
            : undefined;

          return (
            <CourseCard
              key={course.id}
              id={course.id}
              name={course.name}
              description={course.description}
              price={
                typeof course.price === "string" ? parseInt(course.price) : course.price || 5000
              }
              originalPrice={
                typeof course.originalPrice === "string"
                  ? parseInt(course.originalPrice)
                  : course.originalPrice || 7000
              }
              image={course.image}
              rating={
                typeof course.rating === "number"
                  ? course.rating
                  : Math.round(parseFloat(course?.wcProduct?.average_rating?.toString() || "0"))
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
              wcProduct={normalizedWc || undefined}
              allProducts={allProducts}
              subscriptionDiscount={20}
              courseData={
                course.courseData
                  ? {
                      ...course.courseData,
                      Course_coach:
                        course.courseData.Course_coach === null ||
                        !course.courseData.Course_coach ||
                        !("title" in course.courseData.Course_coach)
                          ? undefined
                          : (course.courseData.Course_coach as {
                              ID: number;
                              title: string;
                              input_text_experience?: string;
                              input_text_status?: string;
                              input_text_status_1?: string;
                              input_text_status_2?: string;
                              input_text_count_training?: string;
                              input_text_history?: string;
                              input_text_certificates?: string;
                              input_text_link_instagram?: string;
                              input_text_text_instagram?: string;
                              textarea_description?: string;
                              textarea_about_me?: string;
                              textarea_my_mission?: string;
                              img_link_avatar?: string;
                              point_specialization?: string;
                            }),
                      Course_program: Array.isArray(course.courseData.Course_program)
                        ? (course.courseData.Course_program as unknown[]).filter(
                            (item): item is string => typeof item === "string"
                          )
                        : undefined,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default CoursesGrid;
