"use client";
import { useState } from "react";

interface CourseFilters {
  // Тип тренування
  cardio: boolean;
  dance: boolean;
  mindBody: boolean;
  strength: boolean;
  
  // Тренер
  trainer: string;
  
  // Тип тренування (обладнання/місце)
  withEquipment: boolean;
  bodyWeight: boolean;
  gym: boolean;
  home: boolean;
}

export const useCourses = () => {
  const [filters, setFilters] = useState<CourseFilters>({
    cardio: false,
    dance: false,
    mindBody: false,
    strength: false,
    trainer: "",
    withEquipment: false,
    bodyWeight: false,
    gym: false,
    home: false,
  });

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      cardio: false,
      dance: false,
      mindBody: false,
      strength: false,
      trainer: "",
      withEquipment: false,
      bodyWeight: false,
      gym: false,
      home: false,
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters,
  };
};
