"use client";

import React, { useEffect, useState } from "react";
import styles from "./TrainerProfile.module.css";
import {
  CloseButtonIcon,
  NumberIcon,
  TelegramIcon,
  EmailIcon,
  InstagramIcon,
  FacebookIcon,
  CloudUploadIcon,
  DumpUploadIcon,
  LocationIcon,
} from "../../../Icons/Icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: {
    title: string;
    email?: string;
    phone?: string;
    telegram?: string;
    instagram?: string;
    facebook?: string;
    schedule_five?: string;
    schedule_two?: string;
    address?: string;
    coordinates?: string; // координати у форматі "lat, lng"
    photos?: string[];
  }) => void;
  initialLocation?: {
    title: string;
    email?: string;
    phone?: string;
    telegram?: string;
    instagram?: string;
    facebook?: string;
    schedule_five?: string;
    schedule_two?: string;
    address?: string;
    coordinates?: string; // координати у форматі "lat, lng"
    photos?: string[];
  } | null;
};

import { uploadMedia } from "../../../../lib/bfbApi";
import { useAuthStore } from "../../../../store/auth";
import { useUserProfileQuery } from "../../../hooks/useUserProfileQuery";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/api";
import InputField from "../../../ui/FormFields/InputField";
import SecondaryInput from "../../../ui/FormFields/SecondaryInput";

export default function TrainingLocationModal({
  isOpen,
  onClose,
  onSave,
  initialLocation = null,
}: Props) {
  const token = useAuthStore((s) => s.token);
  const [uploadingGym, setUploadingGym] = useState(false);
  const [gymPhotos, setGymPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [weekendStart, setWeekendStart] = useState("");
  const [weekendEnd, setWeekendEnd] = useState("");
  const [weekdayStart, setWeekdayStart] = useState("");
  const [weekdayEnd, setWeekdayEnd] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(""); // координати у форматі "lat, lng"

  const [errors, setErrors] = useState<{
    phone?: string;
    weekendStart?: string;
    weekendEnd?: string;
    weekdayStart?: string;
    weekdayEnd?: string;
  }>({});

  // Отримуємо дані з сервера для фото залів (як в TrainerMap)
  const { data: baseProfile } = useUserProfileQuery();
  const { data: profile } = useQuery({
    queryKey: ["trainer-profile-full", baseProfile?.id],
    queryFn: async () => {
      if (!baseProfile?.id) return null;
      const id = String(baseProfile.id);
      const response = await api.get("/api/proxy", {
        params: {
          path: `/wp-json/wp/v2/users/${id}?context=edit`,
        },
        headers: { "x-internal-admin": "1" },
      });
      return response.data;
    },
    enabled: !!baseProfile?.id && isOpen,
    staleTime: 60_000,
  });

  // Отримуємо фото залів з профілю (hl_img_link_photo з my_wlocation)
  useEffect(() => {
    if (!isOpen) {
      setGymPhotos([]);
      return;
    }

    // Якщо є initialLocation з фото, використовуємо його
    if (initialLocation?.photos && Array.isArray(initialLocation.photos)) {
      setGymPhotos(initialLocation.photos);
      return;
    }

    // Якщо немає initialLocation, отримуємо фото з профілю
    if (!profile) return;

    const rawData = profile as Record<string, unknown>;
    const meta = rawData.meta as Record<string, unknown> | undefined;
    const acf = rawData.acf as Record<string, unknown> | undefined;

    // Отримуємо локації з сервера
    const serverLocations = (meta?.hl_data_my_wlocation ||
      rawData.hl_data_my_wlocation ||
      acf?.hl_data_my_wlocation) as Array<Record<string, unknown>> | undefined;

    if (
      !serverLocations ||
      !Array.isArray(serverLocations) ||
      serverLocations.length === 0
    ) {
      setGymPhotos([]);
      return;
    }

    // Якщо є initialLocation, шукаємо відповідну локацію за title або address
    if (initialLocation) {
      const matchingLocation = serverLocations.find(
        (loc) =>
          (loc.hl_input_text_title as string) === initialLocation.title ||
          (loc.hl_input_text_address as string) === initialLocation.address
      );

      if (matchingLocation?.hl_img_link_photo) {
        const photos = matchingLocation.hl_img_link_photo as string[];
        if (Array.isArray(photos) && photos.length > 0) {
          setGymPhotos(
            photos.filter((url): url is string => typeof url === "string")
          );
          return;
        }
      }
    }

    // Якщо не знайдено, беремо фото з першої локації
    const firstLocation = serverLocations[0];
    if (firstLocation?.hl_img_link_photo) {
      const photos = firstLocation.hl_img_link_photo as string[];
      if (Array.isArray(photos) && photos.length > 0) {
        setGymPhotos(
          photos.filter((url): url is string => typeof url === "string")
        );
      } else {
        setGymPhotos([]);
      }
    } else {
      setGymPhotos([]);
    }
  }, [profile, isOpen, initialLocation]);

  // Ініціалізуємо інші поля з initialLocation
  useEffect(() => {
    if (!initialLocation) {
      setTitle("");
      setEmail("");
      setPhone("");
      setTelegram("");
      setInstagram("");
      setFacebook("");
      setWeekendStart("");
      setWeekendEnd("");
      setWeekdayStart("");
      setWeekdayEnd("");
      setAddress("");
      setCoordinates("");
      setErrors({});
      return;
    }
    setTitle(initialLocation.title || "");
    setEmail(initialLocation.email || "");
    setPhone(initialLocation.phone || "");
    setTelegram(initialLocation.telegram || "");
    setInstagram(initialLocation.instagram || "");
    setFacebook(initialLocation.facebook || "");
    if (initialLocation.schedule_two?.includes("–")) {
      const [s, e] = initialLocation.schedule_two.split("–");
      setWeekendStart(s || "");
      setWeekendEnd(e || "");
    }
    if (initialLocation.schedule_five?.includes("–")) {
      const [s, e] = initialLocation.schedule_five.split("–");
      setWeekdayStart(s || "");
      setWeekdayEnd(e || "");
    }
    setAddress(initialLocation.address || "");
    setCoordinates(initialLocation.coordinates || "");
  }, [initialLocation]);

  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Місця проведення тренувань:</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseButtonIcon />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.contactBlock}>
            <div className={styles.contactSection}>
              <h4 className={styles.sectionLabel}>Контакта інформація залу:</h4>

              <div className={styles.inputGroupBlock}>
                <div className={styles.inputGroup}>
                  <InputField
                    wrapperClassName={styles.fullWidthInput}
                    icon={<NumberIcon className={styles.inputIcon} />}
                    label="Номер телефону"
                    value={phone}
                    hasError={!!errors.phone}
                    supportingText={errors.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPhone(value);
                      if (value.trim()) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <InputField
                    wrapperClassName={styles.fullWidthInput}
                    icon={<EmailIcon className={styles.inputIcon} />}
                    label="Пошта (необов'язково)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <InputField
                    wrapperClassName={styles.fullWidthInput}
                    icon={<InstagramIcon className={styles.inputIcon} />}
                    label="Нікнейм Instagram (необов'язково)"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <InputField
                    wrapperClassName={styles.fullWidthInput}
                    icon={<TelegramIcon className={styles.inputIcon} />}
                    label="Нікнейм Telegram (необов'язково)"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <InputField
                    wrapperClassName={styles.fullWidthInput}
                    icon={<FacebookIcon className={styles.inputIcon} />}
                    label="Facebook (необов'язково)"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.workingHoursSection}>
              <h4 className={styles.sectionLabel}>Локація (координати):</h4>
              <div className={styles.inputGroup}>
                <InputField
                  wrapperClassName={styles.fullWidthInput}
                  icon={<LocationIcon className={styles.inputIcon} />}
                  label="50.438611, 30.518611"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.workingHoursSection}>
              <h4 className={styles.sectionLabel}>Адреса:</h4>
              <div className={styles.inputGroup}>
                <InputField
                  wrapperClassName={styles.fullWidthInput}
                  icon={<LocationIcon className={styles.inputIcon} />}
                  label="Введіть адресу залу"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.workingHoursSection}>
              <h4 className={styles.sectionLabel}>Час роботи у вихідні:</h4>
              <div className={styles.timeInputs}>
                <SecondaryInput
                  wrapperClassName={styles.fullWidthInput}
                  label="З якої години"
                  value={weekendStart}
                  hasError={!!errors.weekendStart}
                  supportingText={errors.weekendStart}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWeekendStart(value);
                    if (value.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        weekendStart: undefined,
                      }));
                    }
                  }}
                />
                <span className={styles.timeSeparator}>:</span>
                <SecondaryInput
                  wrapperClassName={styles.fullWidthInput}
                  label="До якої години"
                  value={weekendEnd}
                  hasError={!!errors.weekendEnd}
                  supportingText={errors.weekendEnd}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWeekendEnd(value);
                    if (value.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        weekendEnd: undefined,
                      }));
                    }
                  }}
                />
              </div>
            </div>
            <div className={styles.workingHoursSection}>
              <h4 className={styles.sectionLabel}>Час роботи у будні:</h4>
              <div className={styles.timeInputs}>
                <SecondaryInput
                  wrapperClassName={styles.fullWidthInput}
                  label="З якої години"
                  value={weekdayStart}
                  hasError={!!errors.weekdayStart}
                  supportingText={errors.weekdayStart}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWeekdayStart(value);
                    if (value.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        weekdayStart: undefined,
                      }));
                    }
                  }}
                />
                <span className={styles.timeSeparator}>:</span>
                <SecondaryInput
                  wrapperClassName={styles.fullWidthInput}
                  label="До якої години"
                  value={weekdayEnd}
                  hasError={!!errors.weekdayEnd}
                  supportingText={errors.weekdayEnd}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWeekdayEnd(value);
                    if (value.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        weekdayEnd: undefined,
                      }));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.photosSection}>
            <h4 className={styles.sectionLabel}>Фото залу:</h4>
            <div className={styles.photoThumbnails}>
              {gymPhotos.map((url, idx) => (
                <div className={styles.photoThumbnail} key={idx}>
                  <div className={styles.photoPlaceholder}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Фото залу"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                  <button
                    className={styles.deletePhotoBtn}
                    onClick={() => {
                      const next = gymPhotos.filter((_, i) => i !== idx);
                      setGymPhotos(next);
                      // Фото будуть збережені при збереженні локації через onSave
                    }}
                  >
                    <DumpUploadIcon className={styles.deleteIcon} />
                  </button>
                </div>
              ))}
            </div>
            <label
              className={styles.uploadArea}
              style={{ opacity: uploadingGym ? 0.6 : 1 }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                style={{ display: "none" }}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0 || !token) {
                    if (process.env.NODE_ENV !== "production") {
                      console.log(
                        "[TrainingLocationModal] Немає файлів або токена:",
                        {
                          hasFiles: !!files && files.length > 0,
                          hasToken: !!token,
                        }
                      );
                    }
                    return;
                  }
                  try {
                    setUploadingGym(true);
                    if (process.env.NODE_ENV !== "production") {
                      console.log(
                        "[TrainingLocationModal] Завантаження фото залу:",
                        {
                          filesCount: files.length,
                        }
                      );
                    }
                    // Використовуємо стандартний WordPress media endpoint для завантаження файлів
                    // без збереження в gallery (тільки отримуємо URL)
                    const uploadPromises = Array.from(files).map(
                      async (file) => {
                        try {
                          const result = await uploadMedia({
                            file,
                            token,
                            fieldType: "img_link_data_gallery_", // fieldType не використовується в стандартному endpoint, але потрібен для типу
                          });
                          return result.url || null;
                        } catch (error) {
                          if (process.env.NODE_ENV !== "production") {
                            console.error(
                              "[TrainingLocationModal] Помилка завантаження файлу:",
                              file.name,
                              error
                            );
                          }
                          return null;
                        }
                      }
                    );

                    const uploadedUrls = (
                      await Promise.all(uploadPromises)
                    ).filter(
                      (url): url is string =>
                        url !== null &&
                        typeof url === "string" &&
                        url.length > 0
                    );

                    if (uploadedUrls.length > 0) {
                      if (process.env.NODE_ENV !== "production") {
                        console.log(
                          "[TrainingLocationModal] Фото завантажено, URL:",
                          uploadedUrls
                        );
                        console.log(
                          "[TrainingLocationModal] Поточні фото до додавання:",
                          gymPhotos
                        );
                      }
                      // Додаємо до існуючих фото (не замінюємо)
                      setGymPhotos((prev) => {
                        const combined = [...prev, ...uploadedUrls];
                        if (process.env.NODE_ENV !== "production") {
                          console.log(
                            "[TrainingLocationModal] Комбіновані фото:",
                            combined
                          );
                        }
                        return combined;
                      });
                    } else {
                      if (process.env.NODE_ENV !== "production") {
                        console.warn(
                          "[TrainingLocationModal] Не вдалося завантажити фото"
                        );
                      }
                    }
                    // allow re-select same files later
                    if (e.currentTarget) {
                      e.currentTarget.value = "";
                    }
                  } finally {
                    setUploadingGym(false);
                  }
                }}
              />
              <div className={styles.uploadAreaContent}>
                <div className={styles.uploadIcon}>
                  <CloudUploadIcon />
                </div>
                <p className={styles.uploadText}>
                  <span className={styles.uploadLink}>
                    {uploadingGym ? "Завантаження..." : "Загрузіть файл"}
                  </span>
                </p>
              </div>

              <p className={styles.uploadFormats}>
                .pdf .doc .jpg .png до 5 МБ
              </p>
            </label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.modalSaveBtn}
            onClick={() => {
              const nextErrors: {
                phone?: string;
                weekendStart?: string;
                weekendEnd?: string;
                weekdayStart?: string;
                weekdayEnd?: string;
              } = {};

              if (!phone.trim()) {
                nextErrors.phone = "Невірний номер";
              }
              if (!weekendStart.trim()) {
                nextErrors.weekendStart = "Обов'язкове поле";
              }
              if (!weekendEnd.trim()) {
                nextErrors.weekendEnd = "Обов'язкове поле";
              }
              if (!weekdayStart.trim()) {
                nextErrors.weekdayStart = "Обов'язкове поле";
              }
              if (!weekdayEnd.trim()) {
                nextErrors.weekdayEnd = "Обов'язкове поле";
              }

              if (
                nextErrors.phone ||
                nextErrors.weekendStart ||
                nextErrors.weekendEnd ||
                nextErrors.weekdayStart ||
                nextErrors.weekdayEnd
              ) {
                setErrors(nextErrors);
                return;
              }

              const schedule_two =
                weekendStart && weekendEnd
                  ? `${weekendStart}–${weekendEnd}`
                  : "";
              const schedule_five =
                weekdayStart && weekdayEnd
                  ? `${weekdayStart}–${weekdayEnd}`
                  : "";
              // Використовуємо title, якщо він є, інакше address
              const finalTitle = title.trim() || address.trim() || "";

              onSave({
                title: finalTitle,
                email,
                phone,
                telegram,
                instagram,
                facebook,
                schedule_five,
                schedule_two,
                address,
                coordinates: coordinates.trim(), // Додаємо координати
                photos: gymPhotos, // Додаємо фото залу
              });

              if (process.env.NODE_ENV !== "production") {
                console.log(
                  "[TrainingLocationModal] Збереження локації з фото:",
                  {
                    title: finalTitle,
                    titleFromState: title,
                    addressFromState: address,
                    photosCount: gymPhotos.length,
                    photos: gymPhotos,
                  }
                );
              }
            }}
          >
            Зберегти дані
          </button>
        </div>
      </div>
    </div>
  );
}
