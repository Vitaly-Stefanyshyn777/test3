"use client";
import React from "react";
import styles from "./CoursesGrid.module.css";
import CourseCard from "../CourseCard/CourseCard";
import { useCoursesQuery } from "@/lib/coursesQueries";
import CoursesGridSkeleton from "./CoursesGridSkeleton";

const CoursesGrid = () => {
  const { data: courses = [], isLoading, isError } = useCoursesQuery();

  // Courses loaded

  if (isLoading) {
    return <CoursesGridSkeleton />;
  }

  if (isError) {
    return <div className={styles.error}>Помилка завантаження курсів</div>;
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
