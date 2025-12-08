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

interface CoursePageProps {
  courseIdOrSlug?: string | number;
}

const CoursePage: React.FC<CoursePageProps> = ({ courseIdOrSlug = 169 }) => {
  return (
    <div className={styles.coursePage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftColumn} data-main-content>
            <CourseHero courseId={courseIdOrSlug} />
            <CourseProgram courseId={courseIdOrSlug} />
            <CourseProcess />
            <CourseInstructor courseId={courseIdOrSlug} />
            <QAASection categoryType="training" />
            <CourseReviews courseId={courseIdOrSlug} />
          </div>
          <div className={styles.rightColumn}>
            <CourseSidebar courseId={courseIdOrSlug} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
