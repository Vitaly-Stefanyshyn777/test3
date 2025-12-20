"use client";
import React from "react";
import CourseHero from "./CourseHero/CourseHero";
import CourseProgram from "./CourseProgram/CourseProgram";
import CourseProcess from "./CourseProcess/CourseProcess";
import CourseInstructor from "./CourseInstructor/CourseInstructor";
import CourseSidebar from "./CourseSidebar/CourseSidebar";
import QAASection from "../../Q&A/QAASection";
import CourseReviews from "./CourseReviews/CourseReviews";
import CoursePageSkeleton from "./CoursePageSkeleton";
import styles from "./CoursePage.module.css";
import { useCourseQuery } from "@/lib/coursesQueries";

interface CoursePageProps {
  courseIdOrSlug?: string | number;
}

const CoursePage: React.FC<CoursePageProps> = ({ courseIdOrSlug = 169 }) => {
  const { data: course, isLoading } = useCourseQuery(courseIdOrSlug);

  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  // Використовуємо ID курсу для всіх компонентів, щоб уникнути проблем з slug'ами
  const courseId = course?.id || courseIdOrSlug;

  return (
    <div className={styles.coursePage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftColumn} data-main-content>
            <CourseHero courseId={courseId} />
            <CourseProgram courseId={courseId} key={`course-program-${courseId}-${course?.course_data?.Course_program?.length || 0}`} />
            <CourseProcess />
            <CourseInstructor courseId={courseId} />
            <QAASection categoryType="training" />
            <CourseReviews courseId={courseId} />
          </div>
          <div className={styles.rightColumn}>
            <CourseSidebar courseId={courseId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
