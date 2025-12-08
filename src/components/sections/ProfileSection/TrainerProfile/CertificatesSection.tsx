"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./TrainerProfile.module.css";
import { CloudUploadIcon } from "../../../Icons/Icons";

type Props = {
  onChange?: (files: File[]) => void;
  initialCertificates?: string[]; // URL сертифікатів з профілю
};
import { uploadCoachMedia } from "../../../../lib/bfbApi";
import { useAuthStore } from "../../../../store/auth";

export default function CertificatesSection({
  onChange,
  initialCertificates = [],
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [serverCertificates, setServerCertificates] =
    useState<string[]>(initialCertificates);
  const [isMobile, setIsMobile] = useState(false);
  const uploadInputId = "trainer-cert-upload";

  // Комбінуємо прев'ю з локальних файлів та URL з сервера
  const previews = useMemo(() => {
    const filePreviews = files.map((f) => URL.createObjectURL(f));
    return [...serverCertificates, ...filePreviews];
  }, [files, serverCertificates]);

  const token = useAuthStore((s) => s.token);

  // Оновлюємо сертифікати з профілю, коли вони змінюються
  useEffect(() => {
    if (initialCertificates && Array.isArray(initialCertificates)) {
      setServerCertificates(initialCertificates);
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

    try {
      setUploading(true);
      setError(null);

      // Миттєвий аплоад у кастомний ендпоїнт для сертифікатів
      if (token) {
        try {
          const resp = await uploadCoachMedia({
            token,
            fieldType: "img_link_data_certificate_",
            files: Array.from(selected),
          });
          if (!resp?.success) {
            throw new Error("uploadCoachMedia failed");
          }
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error(error);
          }
          // навіть якщо бекенд впаде, локальне прев'ю залишимо
        }
      }

      const next = [...files, ...Array.from(selected)];
      setFiles(next);
      onChange?.(next);

      if (inputEl) inputEl.value = "";
    } catch (error) {
      setError("Не вдалося додати файл");
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    } finally {
      setUploading(false);
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
          disabled={uploading}
        />

        {isMobile ? (
          <div className={styles.uploadAreaOutside}>
            <label
              htmlFor={uploadInputId}
              className={styles.uploadArea}
              style={{ opacity: uploading ? 0.6 : 1 }}
            >
              <div className={styles.uploadIcon}>
                <CloudUploadIcon />
              </div>
              <p className={styles.uploadTextMobile}>
                {uploading ? "Завантаження..." : "Загрузіть ваш сертифікат"}
              </p>
              {error ? (
                <div className={styles.errorMessage}>{error}</div>
              ) : null}
            </label>
            <p className={styles.uploadFormatsOutside}>
              .pdf .doc .jpg .png до 5 МБ
            </p>
          </div>
        ) : (
          <label
            htmlFor={uploadInputId}
            className={styles.uploadArea}
            style={{ opacity: uploading ? 0.6 : 1 }}
          >
            <div className={styles.uploadIcon}>
              <CloudUploadIcon />
            </div>
            <p className={styles.uploadText}>
              <span className={styles.uploadLink}>
                {uploading ? "Завантаження..." : "Загрузіть"}
              </span>
              {!uploading && (
                <span className={styles.uploadHint}>
                  {" "}
                  або перетащіть сюди файл
                </span>
              )}
            </p>
            <p className={styles.uploadFormats}>.pdf .doc .jpg .png до 5 МБ</p>
            {error ? <div className={styles.errorMessage}>{error}</div> : null}
          </label>
        )}
      </div>
    </div>
  );
}
