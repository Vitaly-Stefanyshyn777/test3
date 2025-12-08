"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./PersonalData.module.css";
import { UserIcon, PlusIcon } from "../../../Icons/Icons";
import ProfilePhotoSectionSkeleton from "./ProfilePhotoSectionSkeleton";
import { uploadCoachMedia } from "../../../../lib/bfbApi";
import { useAuthStore } from "../../../../store/auth";

type Props = {
  profileImage: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
};

export default function ProfilePhotoSection({
  profileImage,
  onChange,
  onRemove,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    try {
      setUploading(true);
      setError(null);

      if (process.env.NODE_ENV !== "production") {
        console.log("[AvatarUpload] start", {
          name: file.name,
          size: file.size,
          type: file.type,
          field_type: "img_link_data_avatar",
        });
      }

      // Використовуємо кастомний ендпоїнт для збереження аватару у мета
      const result = await uploadCoachMedia({
        token,
        fieldType: "img_link_data_avatar",
        files: [file],
      });

      const uploadedUrl =
        result?.files?.[0]?.url || result?.current_field_value || null;

      if (process.env.NODE_ENV !== "production") {
        console.log("[AvatarUpload] response", result);
        console.log("[AvatarUpload] resolvedUrl", uploadedUrl);
      }

      if (uploadedUrl) {
        // Створюємо File-обʼєкт з доданою url-властивістю для батьківського компонента
        const uploadedFile = new File([file], file.name, { type: file.type });
        Object.defineProperty(uploadedFile, "url", { value: uploadedUrl });
        onChange(uploadedFile);
      } else {
        setError("Сервер не повернув URL завантаженого зображення");
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AvatarUpload] error", e);
      }
      setError("Не вдалося завантажити фото");
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return <ProfilePhotoSectionSkeleton />;
  }

  return (
    <div className={styles.section}>
      <div className={styles.profilePhotoSection}>
        <div className={styles.profilePhotoBlock}>
          <div className={styles.profilePhoto}>
            {profileImage ? (
              // Використовуємо нативний <img> замість Next/Image, щоб уникнути блокувань
              // доменів/CSP у локальному середовищі
              <img
                key={profileImage}
                src={profileImage}
                alt="Profile"
                width={120}
                height={120}
                className={styles.profileImage}
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/images/avatar1.png";
                }}
              />
            ) : (
              <div className={styles.placeholderPhoto}>
                <UserIcon className={styles.placeholderIcon} />
              </div>
            )}
          </div>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Фото профілю</h3>
            <span className={styles.fileInfo}>PNG, JPEG до 15 МБ</span>
          </div>
        </div>

        <div className={styles.photoActions}>
          <label
            className={styles.changePhotoBtn}
            style={{ opacity: uploading ? 0.6 : 1 }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
              className={styles.fileInput}
              disabled={uploading}
            />
            <span className={styles.btnIcon}>
              <PlusIcon />
            </span>
            {uploading ? "Завантаження..." : "Змінити фото"}
          </label>
          <button
            className={`${styles.removePhotoBtn} ${
              profileImage ? styles.removePhotoBtnActive : ""
            }`}
            onClick={onRemove}
            disabled={uploading}
          >
            Видалити фото
          </button>
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
