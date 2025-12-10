"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import styles from "./TrainerProfile.module.css";
import { CloudUploadIcon, DumpUploadIcon } from "@/components/Icons/Icons";
import { uploadCoachMedia } from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";

type Props = {
  onChange?: (files: File[]) => void;
  initialImages?: string[]; // URL зображень з профілю
  onUploadSuccess?: () => void; // Callback після успішного завантаження
  userId?: string | number; // ID користувача для збереження
  onGetGalleryUrls?: (getUrls: () => string[]) => void; // Callback для отримання поточного стану галереї
  onGetFiles?: (getFiles: () => File[]) => void; // Callback для отримання локальних файлів для завантаження
};

export default function PersonalGallerySection({
  onChange,
  initialImages = [],
  onUploadSuccess,
  userId,
  onGetGalleryUrls,
  onGetFiles,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [serverImages, setServerImages] = useState<string[]>(initialImages);
  const [isMobile, setIsMobile] = useState(false);
  const uploadInputId = "trainer-gallery-upload";

  // Комбінуємо прев'ю з локальних файлів та URL з сервера
  const previews = useMemo(() => {
    const filePreviews = files.map((f) => URL.createObjectURL(f));
    return [...serverImages, ...filePreviews];
  }, [files, serverImages]);

  const token = useAuthStore((s) => s.token);

  // Використовуємо ref для зберігання функцій, щоб уникнути нескінченного циклу
  const getGalleryUrlsRef = useRef<() => string[]>(() => serverImages);
  const getFilesRef = useRef<() => File[]>(() => files);

  // Оновлюємо ref при зміні стану
  useEffect(() => {
    getGalleryUrlsRef.current = () => serverImages;
    getFilesRef.current = () => files;
  }, [serverImages, files]);

  // Надаємо функції для отримання поточного стану галереї та файлів батьківському компоненту
  // Викликаємо тільки один раз при монтуванні або зміні callback-ів
  useEffect(() => {
    if (onGetGalleryUrls) {
      onGetGalleryUrls(() => getGalleryUrlsRef.current());
    }
    if (onGetFiles) {
      onGetFiles(() => getFilesRef.current());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGetGalleryUrls, onGetFiles]); // Не додаємо serverImages та files до залежностей

  // Оновлюємо зображення з профілю, коли вони змінюються
  useEffect(() => {
    if (
      initialImages &&
      Array.isArray(initialImages) &&
      initialImages.length > 0
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[PersonalGallerySection] Оновлення initialImages:",
          initialImages
        );
      }
      setServerImages(initialImages);
    } else if (
      initialImages &&
      Array.isArray(initialImages) &&
      initialImages.length === 0
    ) {
      // Якщо initialImages порожній масив, не очищаємо serverImages
      // щоб не втратити дані після завантаження
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[PersonalGallerySection] initialImages порожній масив, зберігаємо поточні serverImages"
        );
      }
    }
    // Якщо initialImages undefined, не робимо нічого - зберігаємо поточні serverImages
  }, [initialImages]);

  // Зберігаємо лише прев'ю, щоб після перезавантаження показати користувачу останній стан
  useEffect(() => {
    try {
      const saved = localStorage.getItem("trainer_gallery_preview");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          // Ми не можемо відновити File[] без бекенду; показ прев'ю зробимо лише для поточної сесії
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("trainer_gallery_preview", JSON.stringify(previews));
    } catch {}
  }, [previews]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };
    handler(mql);
    const listener = (ev: MediaQueryListEvent) => handler(ev);
    if (mql.addEventListener) mql.addEventListener("change", listener);
    else mql.addListener(listener);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", listener);
      else mql.removeListener(listener);
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget;
    const selected = inputEl.files;
    if (!selected || selected.length === 0) return;

    // Перевірка розміру файлів (ліміт 10 МБ)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ в байтах
    const oversizedFiles: string[] = [];

    for (const file of Array.from(selected)) {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      }
    }

    if (oversizedFiles.length > 0) {
      setError(
        `Файл${
          oversizedFiles.length > 1 ? "и" : ""
        } перевищують ліміт 10 МБ: ${oversizedFiles.join(", ")}`
      );
      if (inputEl) inputEl.value = "";
      return;
    }

    try {
      setError(null);
      // Додаємо файли тільки локально, завантаження на сервер відбудеться при збереженні
      const filesArray = Array.from(selected);
      const next = [...files, ...filesArray];
      setFiles(next);
      onChange?.(next);

      if (process.env.NODE_ENV !== "production") {
        console.log("[PersonalGallerySection] Файли додано локально:", {
          filesCount: filesArray.length,
          totalFiles: next.length,
          fileNames: filesArray.map((f) => f.name),
        });
      }

      if (inputEl) inputEl.value = "";
    } catch (error) {
      setError("Не вдалося додати файл");
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  };

  const handleDelete = (index: number) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[PersonalGallerySection] Видалення за індексом:", {
        index,
        serverImagesLength: serverImages.length,
        filesLength: files.length,
        previewsLength: previews.length,
      });
    }

    // Просто видаляємо за індексом з previews
    // Якщо індекс в межах serverImages - видаляємо з serverImages
    // Інакше - з files
    if (index < serverImages.length) {
      // Видаляємо з серверних зображень
      const newServerImages = serverImages.filter((_, i) => i !== index);
      if (process.env.NODE_ENV !== "production") {
        console.log("[PersonalGallerySection] Видалення з serverImages:", {
          before: serverImages.length,
          after: newServerImages.length,
        });
      }
      setServerImages(newServerImages);
    } else {
      // Видаляємо з локальних файлів
      const fileIndex = index - serverImages.length;
      const newFiles = files.filter((_, i) => i !== fileIndex);
      if (process.env.NODE_ENV !== "production") {
        console.log("[PersonalGallerySection] Видалення з files:", {
          fileIndex,
          before: files.length,
          after: newFiles.length,
        });
      }
      setFiles(newFiles);
      onChange?.(newFiles);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Персональна галерея:</h3>

      <div className={styles.certificatesContainer}>
        {previews.length > 0 && (
          <div className={styles.certificatePlaceholders}>
            {previews.map((url, i) => (
              <div className={styles.certificatePlaceholder} key={i}>
                <div className={styles.certificateContent}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery image ${i + 1}`}
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
                  onClick={() => handleDelete(i)}
                  type="button"
                  aria-label="Видалити зображення"
                >
                  <DumpUploadIcon className={styles.deleteIcon} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          id={uploadInputId}
          type="file"
          accept="image/*"
          multiple
          className={styles.fileInput}
          onChange={handleFileUpload}
        />

        {isMobile ? (
          <div className={styles.uploadAreaOutside}>
            <label htmlFor={uploadInputId} className={styles.uploadArea}>
              <div className={styles.uploadIcon}>
                <CloudUploadIcon />
              </div>
              <p className={styles.uploadTextMobile}>
                Загрузіть або перетащіть сюди файл
              </p>
              {error ? (
                <div className={styles.errorMessage}>{error}</div>
              ) : null}
            </label>
            <p className={styles.uploadFormatsOutside}>
              .pdf .doc .jpg .png до 10 МБ
            </p>
          </div>
        ) : (
          <label htmlFor={uploadInputId} className={styles.uploadArea}>
            <div className={styles.uploadIcon}>
              <CloudUploadIcon />
            </div>
            <p className={styles.uploadText}>
              <span className={styles.uploadLink}>Загрузіть</span>
              <span className={styles.uploadHint}>
                {" "}
                або перетягніть сюди файл
              </span>
            </p>
            <p className={styles.uploadFormats}>.pdf .doc .jpg .png до 10 МБ</p>
            {error ? <div className={styles.errorMessage}>{error}</div> : null}
          </label>
        )}
      </div>
    </div>
  );
}
