"use client";
import React from "react";
import TrainersShowcase from "@/components/TrainersShowcase/TrainersShowcase";

const OurCoursesTrainers = () => {
  return (
    <TrainersShowcase
      title="Кейси учнів"
      subtitle="Результати"
      showPagination
      itemsPerPage={4}
    />
  );
};

export default OurCoursesTrainers;
