"use client";
import { useState, useMemo } from "react";

export interface Trainer {
  id: string;
  name: string;
  location: string;
  specialization: string;
  image: string;
  country?: string;
  city?: string;
  trainingDirection?: string;
  forWhom?: string;
  workFormat?: string;
}

export interface FilterState {
  country: string;
  city: string;
  cities: string[];
  trainingDirection: string;
  forWhom: string;
  workFormat: string;
}

const mockTrainers: Trainer[] = [
  {
    id: "1",
    name: "Катерина Гончар",
    location: "м. Київ",
    specialization: "Функціональний баланс, реабілітація",
    image: "/images/happy-man.jpg",
    country: "Київ",
    city: "Київ",
    trainingDirection: "Реабілітаційний підхід",
    forWhom: "Універсальний",
    workFormat: "Індивідуальні",
  },
  {
    id: "2",
    name: "Анна Петренко",
    location: "м. Харків",
    specialization: "Йога, стретчинг",
    image: "/images/happy-woman.jpg",
    country: "Харків",
    city: "Харків",
    trainingDirection: "Зниження напруги",
    forWhom: "Жінки",
    workFormat: "Групові",
  },
  {
    id: "3",
    name: "Марія Іваненко",
    location: "м. Дніпро",
    specialization: "Силові тренування",
    image: "/images/sitting-woman.jpg",
    country: "Дніпро",
    city: "Дніпро",
    trainingDirection: "Розвиток координації",
    forWhom: "Чоловіки",
    workFormat: "Індивідуальні",
  },

  ...Array.from({ length: 9 }, (_, i) => ({
    id: `${i + 4}`,
    name: `Тренер ${i + 4}`,
    location: `м. ${["Київ", "Харків", "Дніпро"][i % 3]}`,
    specialization: `Спеціалізація ${i + 4}`,
    image: `/images/${
      ["happy-man1.jpg", "happy-woman1.jpg", "studying.jpg"][i % 3]
    }`,
    country: ["Київ", "Харків", "Дніпро"][i % 3],
    city: ["Київ", "Харків", "Дніпро"][i % 3],
    trainingDirection: [
      "Зниження напруги",
      "Реабілітаційний підхід",
      "Розвиток координації",
    ][i % 3],
    forWhom: ["Універсальний", "Жінки", "Чоловіки"][i % 3],
    workFormat: ["Індивідуальні", "Групові"][i % 2],
  })),
];

export const useTrainers = () => {
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    city: "",
    cities: [],
    trainingDirection: "",
    forWhom: "",
    workFormat: "",
  });

  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const filteredTrainers = useMemo(() => {
    return mockTrainers.filter((trainer) => {
      if (filters.country && trainer.country !== filters.country) {
        return false;
      }

      if (
        filters.city &&
        !trainer.city?.toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.cities.length > 0 &&
        !filters.cities.includes(trainer.city || "")
      ) {
        return false;
      }

      if (
        filters.trainingDirection &&
        trainer.trainingDirection !== filters.trainingDirection
      ) {
        return false;
      }

      if (filters.forWhom && trainer.forWhom !== filters.forWhom) {
        return false;
      }

      if (filters.workFormat && trainer.workFormat !== filters.workFormat) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const sortedTrainers = useMemo(() => {
    return [...filteredTrainers].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "location":
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });
  }, [filteredTrainers, sortBy]);

  const totalPages = Math.ceil(sortedTrainers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrainers = sortedTrainers.slice(startIndex, endIndex);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      country: "",
      city: "",
      cities: [],
      trainingDirection: "",
      forWhom: "",
      workFormat: "",
    });
    setCurrentPage(1);
  };

  return {
    trainers: paginatedTrainers,
    allTrainers: sortedTrainers,
    filters,
    updateFilters,
    resetFilters,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
  };
};
