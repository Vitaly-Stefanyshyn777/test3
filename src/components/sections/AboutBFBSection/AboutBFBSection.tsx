"use client";
import React from "react";
import Advantages from "./Advantages/Advantages";
import Founder from "./Founder/Founder";
import LearningFormats from "./LearningFormats/LearningFormats";
import Team from "./Team/Team";
import s from "./AboutBFBSection.module.css";
import TrainingFocusSection from "./Hero/TrainingFocusSection";
import TrainersShowcase from "@/components/TrainersShowcase/TrainersShowcase";

export default function AboutBFBSection() {
  return (
    <div className={s.aboutBFB}>
      <TrainingFocusSection />
      <Advantages />
      <Founder />
      <Team />
      <LearningFormats />
      <TrainersShowcase
        title="Кейси учнів"
        subtitle="Результати"
        showPagination
        itemsPerPage={4}
      />
    </div>
  );
}
