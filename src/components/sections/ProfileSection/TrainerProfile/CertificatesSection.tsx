"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import styles from "./TrainerProfile.module.css";
import { CloudUploadIcon, DumpUploadIcon } from "@/components/Icons/Icons";

type Props = {
  onChange?: (files: File[]) => void;
  initialCertificates?: string[]; // URL сертифікатів з профілю
  onGetCertificatesUrls?: (getUrls: () => string[]) => void; // Callback для отримання поточного стану сертифікатів
  onGetCertificatesFiles?: (getFiles: () => File[]) => void; // Callback для отримання локальних файлів для завантаження
};
import { uploadCoachMedia } from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";

export default function CertificatesSection({
  onChange,
  initialCertificates = [],
  onGetCertificatesUrls,
  onGetCertificatesFiles,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [serverCertificates, setServerCertificates] = useState<string[]>(
    initialCertificates
  );
  const [isMobile, setIsMobile] = useState(false);
  const uploadInputId = "trainer-cert-upload";
  
  // Комбінуємо прев'ю з локальних файлів та URL з сервера
  const previews = useMemo(() => {
    const filePreviews = files.map((f) => URL.createObjectURL(f));
    return [...serverCertificates, ...filePreviews];
  }, [files, serverCertificates]);
  
  const token = useAuthStore((s) => s.token);

  // Використовуємо ref для зберігання функцій, щоб уникнути нескінченного циклу
  const getCertificatesUrlsRef = useRef<() => string[]>(() => serverCertificates);
  const getCertificatesFilesRef = useRef<() => File[]>(() => files);

  // Оновлюємо ref при зміні стану
  useEffect(() => {
    getCertificatesUrlsRef.current = () => serverCertificates;
    getCertificatesFilesRef.current = () => files;
  }, [serverCertificates, files]);

  // Надаємо функції для отримання поточного стану сертифікатів та файлів батьківському компоненту
  useEffect(() => {
    if (onGetCertificatesUrls) {
      onGetCertificatesUrls(() => getCertificatesUrlsRef.current());
    }
    if (onGetCertificatesFiles) {
      onGetCertificatesFiles(() => getCertificatesFilesRef.current());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGetCertificatesUrls, onGetCertificatesFiles]);

  // Оновлюємо сертифікати з профілю, коли вони змінюються
  useEffect(() => {
    if (initialCertificates === undefined) {
      // Якщо initialCertificates undefined, нічого не робимо
      return;
    }
    
    if (Array.isArray(initialCertificates)) {
      if (initialCertificates.length > 0) {
        setServerCertificates(initialCertificates);
      } else {
        // Якщо initialCertificates порожній масив, не очищаємо serverCertificates
        // щоб не втратити дані після завантаження
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[CertificatesSection] initialCertificates порожній масив, зберігаємо поточні serverCertificates"
          );
        }
      }
    }
  }, [initialCertificates]);

  // Зберігаємо лише прев’ю, щоб після перезавантаження показати користувачу останній стан
  useEffect(() => {
    try {
      const saved = localStorage.getItem("trainer_certificates_preview");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          // Ми не можемо відновити File[] без бекенду; показ прев’ю зробимо лише для поточної сесії
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "trainer_certificates_preview",
        JSON.stringify(previews)
      );
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputEl = event.currentTarget;
    const selected = inputEl.files;
    if (!selected || selected.length === 0) return;

    // Перевірка розміру файлів перед завантаженням (ліміт 10 МБ)
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
        console.log("[CertificatesSection] Файли додано локально:", {
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
      console.log("[CertificatesSection] Видалення за індексом:", {
        index,
        serverCertificatesLength: serverCertificates.length,
        filesLength: files.length,
        previewsLength: previews.length,
      });
    }
    
    // Просто видаляємо за індексом з previews
    // Якщо індекс в межах serverCertificates - видаляємо з serverCertificates
    // Інакше - з files
    if (index < serverCertificates.length) {
      // Видаляємо з серверних сертифікатів
      const newServerCertificates = serverCertificates.filter((_, i) => i !== index);
      if (process.env.NODE_ENV !== "production") {
        console.log("[CertificatesSection] Видалення з serverCertificates:", {
          before: serverCertificates.length,
          after: newServerCertificates.length,
        });
      }
      setServerCertificates(newServerCertificates);
    } else {
      // Видаляємо з локальних файлів
      const fileIndex = index - serverCertificates.length;
      const newFiles = files.filter((_, i) => i !== fileIndex);
      if (process.env.NODE_ENV !== "production") {
        console.log("[CertificatesSection] Видалення з files:", {
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
      <h3 className={styles.sectionTitle}>Сертифікати:</h3>

      <div className={styles.certificatesContainer}>
        {previews.length > 0 && (
          <div className={styles.certificatePlaceholders}>
            {previews.map((url, i) => (
              <div className={styles.certificatePlaceholder} key={i}>
                <div className={styles.certificateContent}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Certificate ${i + 1}`}
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
                  aria-label="Видалити сертифікат"
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
            <label
              htmlFor={uploadInputId}
              className={styles.uploadArea}
            >
              <div className={styles.uploadIcon}>
                <CloudUploadIcon />
              </div>
              <p className={styles.uploadTextMobile}>
                Загрузіть ваш сертифікат
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
          <label
            htmlFor={uploadInputId}
            className={styles.uploadArea}
          >
            <div className={styles.uploadIcon}>
              <CloudUploadIcon />
            </div>
            <p className={styles.uploadText}>
              <span className={styles.uploadLink}>Загрузіть</span>
              <span className={styles.uploadHint}>
                {" "}
                або перетащіть сюди файл
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
