import { getAllCoaches, mapCoachToUi, getCoachById } from "./coaches";

export const coachesQuery = () => ({
  queryKey: ["coaches"] as const,
  queryFn: async () => {
    const coaches = await getAllCoaches();
    return coaches.map(mapCoachToUi);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const coachQuery = (id: string) => ({
  queryKey: ["coach", id] as const,
  queryFn: async () => {
    try {
      const coach = await getCoachById(id);
      return mapCoachToUi(coach);
    } catch (error) {
      console.error("Error fetching coach:", error);
      const allCoaches = await getAllCoaches();
      const coach = allCoaches.find((c) => String(c.id) === id);
      if (coach) {
        return mapCoachToUi(coach);
      }
      throw new Error(`Тренер з ID ${id} не знайдений`);
    }
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const coachesWithFiltersQuery = (filters: Record<string, string>) => ({
  queryKey: ["coaches", "filtered", filters] as const,
  queryFn: async () => {
    const coaches = await getAllCoaches();
    const mapped = coaches.map(mapCoachToUi);
    return mapped;
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});
