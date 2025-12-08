"use client";
import React from "react";
import styles from "./CoursesLanding.module.css";
import Hero from "./Hero/Hero";
import Benefits from "./Benefits/Benefits";
import Bonuses from "./Bonuses/Bonuses";
import ContactSection from "./ContactSection/ContactSection";
import FAQSection from "../../FAQSection/FAQSection";
import TrainersShowcase from "@/components/TrainersShowcase/TrainersShowcase";

const CoursesLanding: React.FC = () => {
  return (
    <div className={styles.sectionWrap}>
      <Hero />
      <Bonuses />
      <Benefits />
      <FAQSection />
      <ContactSection />
      <TrainersShowcase
        title="Кейси учнів"
        subtitle="Результати"
        showPagination
        itemsPerPage={4}
      />
    </div>
  );
};

export default CoursesLanding;
