"use client";
import React from "react";
import styles from "./CoursesGrid.module.css";
import CourseCard from "../CourseCard/CourseCard";
import { useCoursesQuery } from "@/lib/coursesQueries";
import CoursesGridSkeleton from "./CoursesGridSkeleton";
import EmptyState from "@/components/ui/EmptyState";

interface CoursesGridProps {
  courses?: Array<{
    id: string;
    name: string;
    image?: string;
    price?: number | string;
    rating?: number;
    reviewsCount?: number;
    requirements?: string;
    courseData?: { excerpt?: { rendered: string } } | undefined;
  }>;
  isLoading?: boolean;
  hasFilters?: boolean; // Чи є активні фільтри
}

const CoursesGrid = ({ 
  courses: coursesFromProps, 
  isLoading: isLoadingFromProps,
  hasFilters = false 
}: CoursesGridProps = {}) => {
  const { data: coursesFromQuery = [], isLoading: isLoadingQuery, isError } = useCoursesQuery();
  
  // Використовуємо курси з пропсів якщо вони передані (навіть якщо порожній масив), інакше з query
  const courses = coursesFromProps !== undefined
    ? coursesFromProps 
    : coursesFromQuery;
  
  // Використовуємо isLoading з пропсів якщо передано, інакше з query
  const isLoading = isLoadingFromProps !== undefined 
    ? isLoadingFromProps 
    : isLoadingQuery;

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
        {courses.map(
          (course: {
            id: string;
            name: string;
            image?: string;
            price?: number;
            rating?: number;
            reviewsCount?: number;
            requirements?: string;
            courseData?: { excerpt?: { rendered: string } } | undefined;
          }) => {
            return (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.name}
                image={course.image}
                price={course.price}
                rating={course.rating}
                reviewsCount={course.reviewsCount}
                requirements={course.requirements}
                courseData={course.courseData}
              />
            );
          }
        )}
      </div>
    </div>
  );
};

export default CoursesGrid;
