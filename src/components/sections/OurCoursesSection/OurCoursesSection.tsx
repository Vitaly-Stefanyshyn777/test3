"use client";
import React from "react";
import styles from "./OurCoursesSection.module.css";
import OurCoursesHero from "../CoursesSection/OurCoursesSection/OurCoursesHero/OurCoursesHero";
import OurCoursesInfo from "../CoursesSection/OurCoursesSection/OurCoursesInfo/OurCoursesInfo";
import CoursesCatalogSection from "../CoursesSection/OurCoursesSection/CoursesCatalogSection/CoursesCatalogSection";
import OurCoursesTrainers from "../CoursesSection/OurCoursesSection/OurCoursesTrainers/OurCoursesTrainers";
import FAQSection from "../FAQSection/FAQSection";

const OurCoursesSection = () => {
  return (
    <div className={styles.ourCoursesSection}>
      <OurCoursesHero />
      <OurCoursesInfo />
      <CoursesCatalogSection />
      <FAQSection />
      <OurCoursesTrainers />
    </div>
  );
};

export default OurCoursesSection;
