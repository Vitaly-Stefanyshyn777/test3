export interface WorkExperienceEntry {
  gym: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description: string;
}

export interface TrainerProfileForm {
  position: string;
  experience: string;
  location: string;
  desiredBoards: string;
  superpower: string;
  favoriteExercises: string[];
  specializations: string[];
  trainingLocations?: TrainingLocation[];
}

export interface TrainingLocation {
  title: string;
  email?: string;
  phone?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  schedule_five?: string; // будні
  schedule_two?: string; // вихідні
  address?: string; // текстова адреса
  coordinates?: string; // координати у форматі "lat, lng"
  photos?: string[]; // фото залу
}
