"use client";
import React from "react";
import styles from "./OurCoursesSection.module.css";

import OurCoursesHero from "./OurCoursesHero/OurCoursesHero";
import OurCoursesInfo from "./OurCoursesInfo/OurCoursesInfo";
import OurCoursesTrainers from "./OurCoursesTrainers/OurCoursesTrainers";
import OurCoursesCatalog from "./OurCoursesCatalog/OurCoursesCatalog";

const OurCoursesSection = () => {
  return (
    <div className={styles.ourCoursesSection}>
      <OurCoursesHero />
      <OurCoursesInfo />
      <OurCoursesCatalog />
      <OurCoursesTrainers />
    </div>
  );
};

export default OurCoursesSection;
