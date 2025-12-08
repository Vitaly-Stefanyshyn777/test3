"use client";
import React from "react";
import CourseHero from "./CourseHero/CourseHero";
import CourseProgram from "./CourseProgram/CourseProgram";
import CourseProcess from "./CourseProcess/CourseProcess";
import CourseInstructor from "./CourseInstructor/CourseInstructor";
import CourseSidebar from "./CourseSidebar/CourseSidebar";
import QAASection from "../../Q&A/QAASection";
import CourseReviews from "./CourseReviews/CourseReviews";
import styles from "./CoursePage.module.css";

interface CoursePageProps {
  courseId?: number;
}

const CoursePage: React.FC<CoursePageProps> = ({ courseId = 169 }) => {
  return (
    <div className={styles.coursePage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftColumn} data-main-content>
            <CourseHero courseId={courseId} />
            <CourseProgram courseId={courseId} />
            <CourseProcess />
            <CourseInstructor courseId={courseId} />
            <QAASection categoryType="training" />
            <CourseReviews />
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
