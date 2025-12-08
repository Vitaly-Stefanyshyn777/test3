"use client";
import React, { useState, useEffect } from "react";
import styles from "./TrainerProfile.module.css";
// import SectionDivider from "../SectionDivider/SectionDivider";
import PersonalDataSection from "./PersonalDataSection";
import SuperpowerSection from "./SuperpowerSection";
import TagsSection from "./TagsSection";
import type {
  TrainerProfileForm,
  TrainingLocation,
  WorkExperienceEntry,
} from "./types";
import { useUpdateTrainerProfile } from "../../../../lib/useMutation";
import { useAuthStore } from "../../../../store/auth";
import { useUserProfileQuery } from "../../../hooks/useUserProfileQuery";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/api";
import WorkExperienceSection from "./WorkExperienceSection";
import TrainingLocationsSection from "./TrainingLocationsSection";
import TrainingLocationModal from "./TrainingLocationModal";
import CertificatesSection from "./CertificatesSection";

const emptyExperience: WorkExperienceEntry = {
  gym: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  description: "",
};

// Форматуємо дату для work_experience (формат MM/DD/YYYY)
const formatWorkExperienceDate = (year: string, month: string) => {
  if (!year || !month) return "";
  // Місяць має бути в форматі MM, рік YYYY
  const monthPadded = month.padStart(2, "0");
  return `${monthPadded}/01/${year}`;
};

const parseExperienceDate = (value?: string | null) => {
  if (!value) {
    return { month: "", year: "" };
  }
  const [year, month] = value.split("-");
  return {
    month: (month ?? "").slice(0, 2),
    year: year ?? "",
  };
};

const TrainerProfile: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const [formData, setFormData] = useState<TrainerProfileForm>({
    position: "",
    experience: "",
    location: "",
    desiredBoards: "",
    superpower: "",
    favoriteExercises: [
      "Ведення груп і персональних занять",
      "Ведення груп і персональних занять",
      "Ведення груп і персональних занять",
    ],
    specializations: [
      "Розвиток усіх груп м'язів",
      "Розвиток усіх груп м'язів",
      "Розвиток усіх груп м'язів",
    ],
    trainingLocations: [],
  });

  const [newFavoriteExercise, setNewFavoriteExercise] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { mutateAsync: updateProfile, isPending } = useUpdateTrainerProfile();
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const authUserId = useAuthStore((s) => s.user?.id);

  const [workExperienceDraft, setWorkExperienceDraft] =
    useState<WorkExperienceEntry>(emptyExperience);
  const [currentMeta, setCurrentMeta] = useState<Record<string, unknown>>({});
  const [certificateUrls, setCertificateUrls] = useState<string[]>([]);
  const [personalErrors, setPersonalErrors] = useState<{
    position?: string;
    experience?: string;
    location?: string;
    desiredBoards?: string;
  }>({});

  // Використовуємо React Query для автоматичного оновлення даних після збереження
  // Спочатку отримуємо базовий профіль для ID
  const { data: baseProfile } = useUserProfileQuery();

  // Потім отримуємо повний профіль тренера з усіма meta полями через той самий endpoint, що використовує fetchTrainer
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["trainer-profile-full", baseProfile?.id, token],
    queryFn: async () => {
      if (!baseProfile?.id) return null;
      const id = String(baseProfile.id);
      // Використовуємо токен поточного користувача для запиту його профілю
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // Використовуємо той самий endpoint, що і fetchTrainer, щоб отримати всі meta поля
      const response = await api.get("/api/proxy", {
        params: {
          path: `/wp-json/wp/v2/users/${id}?context=edit`,
        },
        headers,
      });
      return response.data;
    },
    enabled: !!baseProfile?.id && !!token,
    staleTime: 60_000,
  });

  // Оновлюємо форму при зміні профілю з React Query (як в PersonalData)
  useEffect(() => {
    if (!profile) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] useEffect: profile відсутній");
      }
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[TrainerProfile] useEffect: отримано profile:", {
        id: profile.id,
        hasMeta: !!profile.meta,
        metaKeys: profile.meta
          ? Object.keys(profile.meta as Record<string, unknown>)
          : [],
      });
    }

    try {
      const rawData = profile as Record<string, unknown>;
      const meta = rawData.meta as Record<string, unknown> | undefined;
      const acf = rawData.acf as Record<string, unknown> | undefined;

      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] useEffect: rawData:", {
          hasMeta: !!meta,
          hasAcf: !!acf,
          metaKeys: meta ? Object.keys(meta) : [],
          acfKeys: acf ? Object.keys(acf) : [],
        });
        console.log("[TrainerProfile] useEffect: acf дані:", {
          position: acf?.position || rawData.position,
          experience: acf?.expierence || rawData.experience,
          city: acf?.city || rawData.location_city,
          boards: acf?.boards || rawData.boards,
          super_power: acf?.super_power || rawData.super_power,
          favourite_exercise:
            acf?.favourite_exercise || rawData.favourite_exercise,
          speciality: acf?.speciality || rawData.my_specialty,
        });
        console.log("[TrainerProfile] useEffect: повні acf дані:", acf);
        console.log("[TrainerProfile] useEffect: повні rawData дані:", rawData);
        const metaRecord = meta as Record<string, unknown> | undefined;
        const rawDataMeta = rawData.meta as Record<string, unknown> | undefined;
        console.log(
          "[TrainerProfile] useEffect: детальна перевірка position:",
          {
            "acf?.position": acf?.position,
            "rawData.position": rawData.position,
            "meta?.input_text_position": metaRecord?.input_text_position,
            "acf?.input_text_position": acf?.input_text_position,
            "rawData.meta?.input_text_position":
              rawDataMeta?.input_text_position,
          }
        );
      }

      // Зберігаємо поточні acf дані для об'єднання при збереженні
      // Також зберігаємо my_wlocation з meta, якщо його немає в acf (бо це поле не змінювалося)
      const acfData = acf ? { ...acf } : {};
      // Зберігаємо локації з meta, якщо вони є (вони не оновлюються через acf)
      if (meta?.my_wlocation && !acfData.my_wlocation) {
        acfData.my_wlocation = meta.my_wlocation;
      }
      if (meta?.hl_data_my_wlocation && !acfData.hl_data_my_wlocation) {
        acfData.hl_data_my_wlocation = meta.hl_data_my_wlocation;
      }
      // Також зберігаємо локації з rawData, якщо вони є там
      if (
        rawData.my_wlocation &&
        Array.isArray(rawData.my_wlocation) &&
        rawData.my_wlocation.length > 0 &&
        !acfData.my_wlocation
      ) {
        acfData.my_wlocation = rawData.my_wlocation;
      }
      if (Object.keys(acfData).length > 0) {
        setCurrentMeta(acfData as Record<string, unknown>);
      }

      // Відновлюємо локації залів з hl_data_my_wlocation (перевіряємо rawData, acf та meta)
      let restoredLocations: TrainingLocation[] = [];

      // Перевіряємо всі можливі джерела локацій
      let rawWlocation: unknown = undefined;

      // Пріоритет 1: rawData.my_wlocation (перевіряємо, що це масив і він не порожній)
      if (
        rawData.my_wlocation &&
        Array.isArray(rawData.my_wlocation) &&
        rawData.my_wlocation.length > 0
      ) {
        rawWlocation = rawData.my_wlocation;
      }
      // Пріоритет 2: acf.my_wlocation
      else if (
        acf?.my_wlocation &&
        Array.isArray(acf.my_wlocation) &&
        acf.my_wlocation.length > 0
      ) {
        rawWlocation = acf.my_wlocation;
      }
      // Пріоритет 3: acf.hl_data_my_wlocation
      else if (
        acf?.hl_data_my_wlocation &&
        Array.isArray(acf.hl_data_my_wlocation) &&
        acf.hl_data_my_wlocation.length > 0
      ) {
        rawWlocation = acf.hl_data_my_wlocation;
      }
      // Пріоритет 4: meta.my_wlocation
      else if (
        meta?.my_wlocation &&
        Array.isArray(meta.my_wlocation) &&
        meta.my_wlocation.length > 0
      ) {
        rawWlocation = meta.my_wlocation;
      }
      // Пріоритет 5: meta.hl_data_my_wlocation
      else if (
        meta?.hl_data_my_wlocation &&
        Array.isArray(meta.hl_data_my_wlocation) &&
        meta.hl_data_my_wlocation.length > 0
      ) {
        rawWlocation = meta.hl_data_my_wlocation;
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] Відновлення локацій:", {
          hasRawDataMyWlocation: !!rawData.my_wlocation,
          rawDataMyWlocationType: typeof rawData.my_wlocation,
          rawDataMyWlocationIsArray: Array.isArray(rawData.my_wlocation),
          rawDataMyWlocationValue: rawData.my_wlocation,
          hasAcfMyWlocation: !!acf?.my_wlocation,
          hasAcfHlDataMyWlocation: !!acf?.hl_data_my_wlocation,
          hasMetaMyWlocation: !!meta?.my_wlocation,
          hasMetaHlDataMyWlocation: !!meta?.hl_data_my_wlocation,
          rawWlocation: rawWlocation,
          rawWlocationType: typeof rawWlocation,
          isArray: Array.isArray(rawWlocation),
          length: Array.isArray(rawWlocation) ? rawWlocation.length : 0,
        });
      }

      // Обробляємо rawWlocation якщо він є масивом
      if (Array.isArray(rawWlocation) && rawWlocation.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] Обробка локацій, кількість:",
            rawWlocation.length
          );
        }
        restoredLocations = (
          rawWlocation as Array<Record<string, unknown>>
        ).map((item, index) => {
          if (process.env.NODE_ENV !== "production") {
            console.log(`[TrainerProfile] Обробка локації ${index}:`, {
              item: item,
              title: item.hl_input_text_title,
              phone: item.hl_input_text_phone,
              email: item.hl_input_text_email,
            });
          }
          // Формуємо координати з lat та lng, якщо вони є
          let coordinates = "";
          const lat = item.hl_input_text_coord_lat as string | undefined;
          const lng = item.hl_input_text_coord_ln as string | undefined;
          if (lat && lng) {
            coordinates = `${lat}, ${lng}`;
          }
          return {
            title: (item.hl_input_text_title as string) || "",
            email: (item.hl_input_text_email as string) || "",
            phone: (item.hl_input_text_phone as string) || "",
            telegram: (item.hl_input_text_telegram as string) || "",
            instagram: (item.hl_input_text_instagram as string) || "",
            facebook: (item.hl_input_text_facebook as string) || "",
            schedule_five: (item.hl_input_text_schedule_five as string) || "",
            schedule_two: (item.hl_input_text_schedule_two as string) || "",
            address: (item.hl_input_text_address as string) || "",
            coordinates: coordinates,
            photos: Array.isArray(item.hl_img_link_photo)
              ? (item.hl_img_link_photo as string[])
              : [],
          };
        });

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] Відновлено локацій:",
            restoredLocations.length,
            restoredLocations
          );
        }
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] rawWlocation не є масивом або порожній:",
            {
              rawWlocation,
              isArray: Array.isArray(rawWlocation),
              type: typeof rawWlocation,
            }
          );
        }
      }

      // Оновлюємо formData з даними з сервера (використовуємо acf як пріоритет)
      // Обробляємо favourite_exercise та speciality з acf (масиви об'єктів з полями exercise/point)
      const favouriteExerciseArray = acf?.favourite_exercise as
        | Array<{ exercise?: string }>
        | undefined;
      const favoriteExercises = favouriteExerciseArray
        ? favouriteExerciseArray
            .map((item) => item.exercise || "")
            .filter(Boolean)
        : Array.isArray(rawData.favourite_exercise)
        ? (rawData.favourite_exercise as string[])
        : [];

      const specialityArray = acf?.speciality as
        | Array<{ point?: string }>
        | undefined;
      const specializations = specialityArray
        ? specialityArray.map((item) => item.point || "").filter(Boolean)
        : Array.isArray(rawData.my_specialty)
        ? (rawData.my_specialty as string[])
        : [];

      const newFormData = {
        // Перевіряємо всі можливі джерела для position (як в utils.ts)
        // Пріоритет: rawData.position (основне джерело) > meta.input_text_position > acf.position > acf.input_text_position
        position: (() => {
          // Пріоритет 1: rawData.position (основне джерело, куди зберігається з meta.input_text_position)
          if (rawData.position && String(rawData.position).trim()) {
            return String(rawData.position).trim();
          }
          // Пріоритет 2: meta.input_text_position (джерело для збереження)
          if (
            meta?.input_text_position &&
            String(meta.input_text_position).trim()
          ) {
            return String(meta.input_text_position).trim();
          }
          // Пріоритет 3: acf.position (fallback, якщо є)
          if (acf?.position && String(acf.position).trim()) {
            return String(acf.position).trim();
          }
          // Пріоритет 4: acf.input_text_position (fallback)
          if (
            acf?.input_text_position &&
            String(acf.input_text_position).trim()
          ) {
            return String(acf.input_text_position).trim();
          }
          // Якщо нічого не знайдено, зберігаємо поточне значення з formData (щоб не втратити при refetch)
          return (formData.position || "") as string;
        })(),
        experience: (acf?.expierence || rawData.experience || "") as string, // Примітка: в acf може бути "expierence" (опечатка)
        location: (acf?.city || rawData.location_city || "") as string,
        desiredBoards: (acf?.boards || rawData.boards || "") as string,
        superpower: (acf?.super_power || rawData.super_power || "") as string,
        favoriteExercises: favoriteExercises,
        specializations: specializations,
        trainingLocations: restoredLocations, // Використовуємо відновлені локації
      };

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[TrainerProfile] newFormData.trainingLocations перед setFormData:",
          {
            count: newFormData.trainingLocations.length,
            locations: newFormData.trainingLocations,
          }
        );
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] useEffect: новий formData:", {
          ...newFormData,
          trainingLocationsCount: newFormData.trainingLocations.length,
          trainingLocations: newFormData.trainingLocations.map((l) => ({
            title: l.title,
            phone: l.phone,
            email: l.email,
          })),
        });
      }

      setFormData(newFormData);

      // Відновлюємо досвід роботи (перевіряємо acf.work_experience, rawData.my_experience, meta та acf.my_experience)
      // Пріоритет 1: acf.work_experience (нова структура: {name, date_start, date_ended, description})
      // Пріоритет 2: acf.my_experience (стара структура: {hl_input_text_gym, hl_input_date_date_start, ...})
      // Пріоритет 3: rawData.my_experience
      // Пріоритет 4: meta.my_experience
      let rawExperience: unknown = undefined;

      // Перевіряємо acf.work_experience (нова структура)
      if (
        acf?.work_experience &&
        Array.isArray(acf.work_experience) &&
        acf.work_experience.length > 0
      ) {
        rawExperience = acf.work_experience;
      }
      // Перевіряємо acf.my_experience (стара структура)
      else if (
        acf?.my_experience &&
        Array.isArray(acf.my_experience) &&
        acf.my_experience.length > 0
      ) {
        rawExperience = acf.my_experience;
      }
      // Перевіряємо rawData.my_experience
      else if (
        rawData.my_experience &&
        Array.isArray(rawData.my_experience) &&
        rawData.my_experience.length > 0
      ) {
        rawExperience = rawData.my_experience;
      }
      // Перевіряємо meta.my_experience
      else if (
        meta?.my_experience &&
        Array.isArray(meta.my_experience) &&
        meta.my_experience.length > 0
      ) {
        rawExperience = meta.my_experience;
      }
      // Перевіряємо meta.hl_data_my_experience
      else if (
        meta?.hl_data_my_experience &&
        Array.isArray(meta.hl_data_my_experience) &&
        meta.hl_data_my_experience.length > 0
      ) {
        rawExperience = meta.hl_data_my_experience;
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] Відновлення досвіду роботи:", {
          hasAcfWorkExperience: !!acf?.work_experience,
          hasAcfMyExperience: !!acf?.my_experience,
          hasRawDataMyExperience: !!rawData.my_experience,
          hasMetaMyExperience: !!meta?.my_experience,
          hasMetaHlDataMyExperience: !!meta?.hl_data_my_experience,
          rawExperience: rawExperience,
          isArray: Array.isArray(rawExperience),
          length: Array.isArray(rawExperience) ? rawExperience.length : 0,
        });
      }

      if (Array.isArray(rawExperience) && rawExperience.length) {
        const first = rawExperience[0] as Record<string, unknown>;

        // Перевіряємо, яка структура: нова (work_experience) чи стара (my_experience)
        const isNewStructure =
          first.name !== undefined || first.date_start !== undefined;

        let experienceData: WorkExperienceEntry;

        if (isNewStructure) {
          // Нова структура: {name, date_start, date_ended, description}
          // Парсимо дати з формату "MM/DD/YYYY"
          const parseNewDate = (dateStr: string | undefined) => {
            if (!dateStr) return { month: "", year: "" };
            const parts = (dateStr as string).split("/");
            if (parts.length === 3) {
              return { month: parts[0].padStart(2, "0"), year: parts[2] };
            }
            return { month: "", year: "" };
          };

          const start = parseNewDate(first.date_start as string | undefined);
          const end = parseNewDate(first.date_ended as string | undefined);

          experienceData = {
            gym: (first.name as string) || "",
            startMonth: start.month,
            startYear: start.year,
            endMonth: end.month,
            endYear: end.year,
            description: (first.description as string) || "",
          };
        } else {
          // Стара структура: {hl_input_text_gym, hl_input_date_date_start, hl_input_date_date_end, hl_textarea_ex_description}
          const start = parseExperienceDate(
            first.hl_input_date_date_start as string | undefined
          );
          const end = parseExperienceDate(
            first.hl_input_date_date_end as string | undefined
          );

          experienceData = {
            gym: (first.hl_input_text_gym as string) || "",
            startMonth: start.month,
            startYear: start.year,
            endMonth: end.month,
            endYear: end.year,
            description: (first.hl_textarea_ex_description as string) || "",
          };
        }

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] Встановлюємо workExperienceDraft:",
            experienceData
          );
        }
        setWorkExperienceDraft(experienceData);
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] Досвід роботи не знайдено, встановлюємо emptyExperience"
          );
        }
        setWorkExperienceDraft(emptyExperience);
      }

      // Відновлюємо сертифікати з профілю (тільки з поля certificate)
      const rawCertificates = meta?.certificate || rawData.certificate;

      if (Array.isArray(rawCertificates) && rawCertificates.length > 0) {
        const certUrls = rawCertificates.filter(
          (url): url is string => typeof url === "string" && url.length > 0
        );
        setCertificateUrls(certUrls);
      } else {
        setCertificateUrls([]);
      }
    } catch (e) {
      console.warn("[TrainerProfile] Не вдалося завантажити профіль:", e);
    }
  }, [profile]);

  const handleInputChange = (
    field: keyof TrainerProfileForm,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (
      field === "position" ||
      field === "experience" ||
      field === "location" ||
      field === "desiredBoards"
    ) {
      setPersonalErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddFavoriteExercise = () => {
    if (newFavoriteExercise.trim()) {
      setFormData((prev) => ({
        ...prev,
        favoriteExercises: [
          ...prev.favoriteExercises,
          newFavoriteExercise.trim(),
        ],
      }));
      setNewFavoriteExercise("");
    }
  };

  const handleRemoveFavoriteExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      favoriteExercises: prev.favoriteExercises.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    // Валідація особистих даних
    const nextErrors: typeof personalErrors = {};
    if (!formData.position.trim()) {
      nextErrors.position = "Поле обов'язкове";
    }
    if (!formData.location.trim()) {
      nextErrors.location = "Поле обов'язкове";
    }
    if (!formData.experience) {
      nextErrors.experience = "Оберіть досвід";
    }
    if (!formData.desiredBoards) {
      nextErrors.desiredBoards = "Оберіть кількість бордів";
    }
    if (Object.keys(nextErrors).length > 0) {
      setPersonalErrors(nextErrors);
      return;
    }

    // Використовуємо токен з useAuthStore (як в інших компонентах)
    const authToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("wp_jwt_override") ||
          localStorage.getItem("wp_jwt") ||
          undefined
        : undefined);

    if (process.env.NODE_ENV !== "production") {
      console.log("[TrainerProfile] Токен для збереження:", {
        fromStore: !!token,
        fromLocalStorage: !!(
          typeof window !== "undefined" &&
          (localStorage.getItem("wp_jwt_override") ||
            localStorage.getItem("wp_jwt"))
        ),
        hasToken: !!authToken,
      });
    }

    // Починаємо з поточних acf даних, щоб не втратити існуючі поля
    // Виключаємо з оновлення: Аватар, Місце проведення тренувань, Сертифікати, Галерея
    const acf: Record<string, unknown> = { ...currentMeta };

    // Видаляємо поля, які не повинні оновлюватися
    delete acf.avatar;
    delete acf.my_wlocation;
    delete acf.hl_data_my_wlocation;
    delete acf.certificate;
    delete acf.gallery;

    if (process.env.NODE_ENV !== "production") {
      console.group("[TrainerProfile] handleSave");
      console.log("certificateFiles:", certificateFiles);
      console.log("certificateFiles.length:", certificateFiles.length);
      console.log("formData.trainingLocations:", formData.trainingLocations);
      console.log("formData.desiredBoards:", formData.desiredBoards);
      console.log("formData.position:", formData.position);
      console.log("Поточні meta дані:", currentMeta);
    }

    // Оновлюємо тільки змінені поля в форматі acf
    // Примітка: position зберігається в meta.input_text_position, а не в acf.position
    // Тому ми не додаємо його в acf, а збережемо окремо в meta
    if (formData.experience !== undefined) {
      acf.expierence = formData.experience || ""; // Примітка: в acf може бути "expierence" (опечатка)
    }
    if (formData.location !== undefined) {
      acf.city = formData.location || "";
    }
    if (formData.desiredBoards !== undefined) {
      acf.boards = formData.desiredBoards || "";
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[TrainerProfile] Зберігаємо boards:",
          formData.desiredBoards
        );
      }
    }
    if (formData.superpower !== undefined) {
      acf.super_power = formData.superpower || "";
    }
    // favourite_exercise має бути масивом об'єктів з полем exercise
    if (formData.favoriteExercises && formData.favoriteExercises.length) {
      acf.favourite_exercise = formData.favoriteExercises.map((exercise) => ({
        exercise: exercise,
      }));
    } else {
      acf.favourite_exercise = [];
    }
    // speciality має бути масивом об'єктів з полем point
    if (formData.specializations && formData.specializations.length) {
      acf.speciality = formData.specializations.map((point) => ({
        point: point,
      }));
    } else {
      acf.speciality = [];
    }
    // Досвід роботи (my_experience) - зберігаємо в acf
    const hasExperienceDraft =
      workExperienceDraft.gym.trim() ||
      (workExperienceDraft.startMonth && workExperienceDraft.startYear) ||
      workExperienceDraft.description.trim();

    if (process.env.NODE_ENV !== "production") {
      console.log("[TrainerProfile] Збереження досвіду роботи:", {
        workExperienceDraft,
        hasExperienceDraft,
        gym: workExperienceDraft.gym,
        startMonth: workExperienceDraft.startMonth,
        startYear: workExperienceDraft.startYear,
        endMonth: workExperienceDraft.endMonth,
        endYear: workExperienceDraft.endYear,
        description: workExperienceDraft.description,
      });
    }

    if (hasExperienceDraft) {
      // Зберігаємо в acf.work_experience (нова структура: {name, date_start, date_ended, description})
      const experienceData = {
        name: workExperienceDraft.gym,
        date_start: formatWorkExperienceDate(
          workExperienceDraft.startYear,
          workExperienceDraft.startMonth
        ),
        date_ended: formatWorkExperienceDate(
          workExperienceDraft.endYear,
          workExperienceDraft.endMonth
        ),
        description: workExperienceDraft.description || "",
      };

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[TrainerProfile] Зберігаємо досвід роботи в acf.work_experience:",
          experienceData
        );
      }

      acf.work_experience = [experienceData];
    } else if (currentMeta.work_experience) {
      // Якщо досвід не заповнений, але є в поточних даних, зберігаємо його
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[TrainerProfile] Зберігаємо існуючий досвід з currentMeta.work_experience:",
          currentMeta.work_experience
        );
      }
      acf.work_experience = currentMeta.work_experience;
    } else if (currentMeta.my_experience) {
      // Fallback на стару структуру
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[TrainerProfile] Зберігаємо існуючий досвід з currentMeta.my_experience:",
          currentMeta.my_experience
        );
      }
      acf.my_experience = currentMeta.my_experience;
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] Досвід роботи порожній, не зберігаємо");
      }
    }

    // Місце проведення тренувань (my_wlocation) - НЕ оновлюємо, виключено з оновлення
    // Сертифікати (certificate) - НЕ оновлюємо, виключено з оновлення
    // Галерея (gallery) - НЕ оновлюємо, виключено з оновлення

    // Отримуємо ID з профілю (як в PersonalData)
    const numericOrServerId = (profile as unknown as { id?: number | string })
      ?.id;
    const targetId = String(numericOrServerId ?? authUserId ?? "");

    const payload: { id?: string | number; acf: Record<string, unknown> } = {
      acf,
    };
    if (targetId) payload.id = targetId;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[TrainerProfile] Фінальний payload:",
        JSON.stringify(payload, null, 2)
      );
      console.log("[TrainerProfile] acf keys:", Object.keys(acf));
    }

    // Submitting payload
    try {
      await updateProfile({ payload, token: authToken });
      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] Профіль оновлено, оновлюємо дані...");
      }

      // Зберігаємо локації та position разом в meta (щоб не втратити одне при збереженні іншого)
      // Зберігаємо завжди, навіть якщо масив порожній (щоб очистити старі дані)
      try {
        const locationsPayload = (formData.trainingLocations || []).map(
          (loc) => {
            const [lat, lng] = loc.coordinates
              ? loc.coordinates.split(",").map((c) => c.trim())
              : ["", ""];
            return {
              hl_input_text_title: loc.title || "",
              hl_input_text_email: loc.email || "",
              hl_input_text_phone: loc.phone || "",
              hl_input_text_telegram: loc.telegram || "",
              hl_input_text_instagram: loc.instagram || "",
              hl_input_text_facebook: loc.facebook || "",
              hl_input_text_schedule_five: loc.schedule_five || "",
              hl_input_text_schedule_two: loc.schedule_two || "",
              hl_input_text_address: loc.address || "",
              hl_input_text_coord_lat: lat || "",
              hl_input_text_coord_ln: lng || "",
              hl_img_link_photo: loc.photos || [],
            };
          }
        );

        // ВАРІАНТ 1: Перед PATCH витягувати свіжий профіль з бекенду (не з кешу, не зі стейту)
        // ВАРІАНТ 2: Відправляти тільки змінені значення, НЕ весь meta
        let freshMeta: Record<string, unknown> = {};
        try {
          const freshProfileRes = await fetch(
            `/api/proxy?path=${encodeURIComponent(
              `/wp-json/wp/v2/users/${targetId}?context=edit`
            )}`,
            {
              method: "GET",
              headers: {
                "x-internal-admin": "1",
              },
            }
          );
          if (freshProfileRes.ok) {
            const freshProfile = await freshProfileRes.json();
            freshMeta = (freshProfile?.meta as Record<string, unknown>) || {};
            if (process.env.NODE_ENV !== "production") {
              console.log(
                "[TrainerProfile] Отримано свіжі meta дані з бекенду:",
                {
                  metaKeys: Object.keys(freshMeta),
                  hasPhone: !!freshMeta.input_text_social_phone,
                  hasTelegram: !!freshMeta.input_text_social_telegram,
                  hasInstagram: !!freshMeta.input_text_social_instagram,
                }
              );
            }
          }
        } catch (error) {
          console.error(
            "[TrainerProfile] Помилка отримання свіжих даних:",
            error
          );
        }

        // Відправляємо тільки змінені поля + зберігаємо важливі поля з іншого компонента
        const metaToSave: Record<string, unknown> = {
          // Зберігаємо важливі поля з PersonalData, якщо вони є в свіжих даних
          ...(freshMeta.input_text_social_phone !== undefined
            ? { input_text_social_phone: freshMeta.input_text_social_phone }
            : {}),
          ...(freshMeta.input_text_social_telegram !== undefined
            ? {
                input_text_social_telegram:
                  freshMeta.input_text_social_telegram,
              }
            : {}),
          ...(freshMeta.input_text_social_instagram !== undefined
            ? {
                input_text_social_instagram:
                  freshMeta.input_text_social_instagram,
              }
            : {}),
          // Відправляємо тільки змінені поля (локації та position)
          hl_data_my_wlocation: locationsPayload,
          ...(formData.position !== undefined
            ? { input_text_position: formData.position || "" }
            : {}),
        };

        if (process.env.NODE_ENV !== "production") {
          console.log("[TrainerProfile] Відправляємо тільки змінені поля:", {
            metaKeys: Object.keys(metaToSave),
            locationsCount: locationsPayload.length,
            hasPosition: formData.position !== undefined,
            position: formData.position || "",
          });
        }

        const metaPayload = {
          id: targetId,
          meta: metaToSave, // Відправляємо тільки змінені поля + важливі поля з іншого компонента
        };

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] Зберігаємо локації та position в meta:",
            {
              ...metaPayload,
              locationsCount: locationsPayload.length,
              hasPosition: formData.position !== undefined,
              position: formData.position || "",
            }
          );
        }

        // Використовуємо адмінський проксі для збереження meta полів (як для локацій)
        // ВАЖЛИВО: використовуємо PATCH замість PUT, бо PUT може перезаписати всі поля
        const metaProxyUrl = `/api/proxy?path=${encodeURIComponent(
          `/wp-json/wp/v2/users/${targetId}`
        )}`;
        const metaRes = await fetch(metaProxyUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-internal-admin": "1", // Дозволяє використовувати адмінський токен з cookie
          },
          body: JSON.stringify(metaPayload),
        });

        if (!metaRes.ok) {
          const errorText = await metaRes.text();
          console.error(
            "[TrainerProfile] Помилка збереження локацій та position:",
            {
              status: metaRes.status,
              statusText: metaRes.statusText,
              error: errorText,
            }
          );
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.log(
              "[TrainerProfile] Локації та position збережено в meta:",
              {
                locationsCount: locationsPayload.length,
                hasPosition: formData.position !== undefined,
                position: formData.position || "",
              }
            );
          }
        }
      } catch (metaError) {
        console.error(
          "[TrainerProfile] Помилка збереження локацій та position в meta:",
          metaError
        );
      }
      // Після збереження явно викликаємо refetch для оновлення даних
      // (invalidateQueries може не оновити дані одразу через кеш)
      // Чекаємо трохи, щоб сервер встиг обробити запит
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data: refetchedData } = await refetchProfile();
      if (process.env.NODE_ENV !== "production") {
        const refetchedMeta = refetchedData?.meta as
          | Record<string, unknown>
          | undefined;
        const refetchedRawData = refetchedData as
          | Record<string, unknown>
          | undefined;
        console.log(
          "[TrainerProfile] Дані оновлено після refetch:",
          refetchedData
            ? {
                hasMeta: !!refetchedMeta,
                metaKeys: refetchedMeta ? Object.keys(refetchedMeta) : [],
                position:
                  refetchedMeta?.input_text_position ||
                  refetchedRawData?.input_text_position ||
                  refetchedRawData?.position,
                boards:
                  refetchedMeta?.input_text_boards ||
                  refetchedRawData?.input_text_boards,
                fullMeta: refetchedMeta,
                fullRawData: refetchedRawData,
              }
            : "no data"
        );
        console.log("[TrainerProfile] useEffect автоматично оновить форму");
      }
      // Profile updated
    } catch (e) {
      console.error("[TrainerProfile] Помилка оновлення профілю:", e);
    } finally {
      if (process.env.NODE_ENV !== "production") {
        console.groupEnd();
      }
    }
  };

  const handleModalSave = (location: TrainingLocation) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[TrainerProfile] handleModalSave отримав локацію:", {
        title: location.title,
        photos: location.photos,
        photosCount: location.photos?.length || 0,
      });
    }
    setFormData((prev) => {
      const current = [...(prev.trainingLocations || [])];
      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        editingIndex < current.length
      ) {
        current[editingIndex] = location;
      } else {
        current.push(location);
      }
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[TrainerProfile] Оновлені локації:",
          current.map((l) => ({
            title: l.title,
            photos: l.photos,
            photosCount: l.photos?.length || 0,
          }))
        );
      }
      return { ...prev, trainingLocations: current };
    });
    setEditingIndex(null);
    closeModal();
  };

  const openModal = () => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.classList.add("modalOpen");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.classList.remove("modalOpen");
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
    setIsModalOpen(false);
  };

  // Listen to edit/delete events from TrainingLocationsSection
  useEffect(() => {
    const handleEdit = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index as number;
      const loc = formData.trainingLocations?.[idx];
      if (!loc) return;
      setEditingIndex(idx);
      openModal();
    };
    const handleDelete = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index as number;
      setFormData((prev) => ({
        ...prev,
        trainingLocations: (prev.trainingLocations || []).filter(
          (_, i) => i !== idx
        ),
      }));
    };
    window.addEventListener("trainerLocationEdit", handleEdit as EventListener);
    window.addEventListener(
      "trainerLocationDelete",
      handleDelete as EventListener
    );
    return () => {
      window.removeEventListener(
        "trainerLocationEdit",
        handleEdit as EventListener
      );
      window.removeEventListener(
        "trainerLocationDelete",
        handleDelete as EventListener
      );
    };
  }, [formData.trainingLocations]);

  useEffect(() => {
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.classList.remove("modalOpen");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className={styles.trainerProfile}>
      <div className={styles.header}>
        <h2 className={styles.title}>Профіль тренера</h2>
      </div>

      {/* <SectionDivider /> */}
      <div className={styles.divider1}></div>

      <div className={styles.form}>
        <PersonalDataSection
          formData={formData}
          onChange={(field, value) => handleInputChange(field, value)}
          errors={personalErrors}
        />
        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>
        <SuperpowerSection
          value={formData.superpower}
          onChange={(value) => handleInputChange("superpower", value)}
        />
        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>
        <TagsSection
          title="Моя улюблена вправа:"
          placeholder="Улюблена вправа"
          values={formData.favoriteExercises}
          newValue={newFavoriteExercise}
          onNewValueChange={setNewFavoriteExercise}
          onAdd={handleAddFavoriteExercise}
          onRemove={handleRemoveFavoriteExercise}
        />
        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>
        <TagsSection
          title="Спеціалізація:"
          placeholder="Спеціалізація"
          values={formData.specializations}
          newValue={newSpecialization}
          onNewValueChange={setNewSpecialization}
          onAdd={handleAddSpecialization}
          onRemove={handleRemoveSpecialization}
        />
        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>
        <WorkExperienceSection
          value={workExperienceDraft}
          onChange={(field, value) =>
            setWorkExperienceDraft((prev) => ({ ...prev, [field]: value }))
          }
        />
        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>
        <TrainingLocationsSection
          onAddClick={openModal}
          locations={formData.trainingLocations || []}
        />
        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>
        <CertificatesSection
          onChange={setCertificateFiles}
          initialCertificates={certificateUrls}
        />
        {/* Bottom Action Buttons */}
        <div className={styles.bottomActions}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isPending}
          >
            Зберегти дані
          </button>
          <button className={styles.clearBtn}>Стерти всю інформацію</button>
        </div>
      </div>

      <TrainingLocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        initialLocation={
          editingIndex !== null && formData.trainingLocations
            ? formData.trainingLocations[editingIndex] || null
            : null
        }
      />
    </div>
  );
};

export default TrainerProfile;
