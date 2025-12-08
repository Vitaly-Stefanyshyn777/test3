"use client";
import React, { useEffect, useState } from "react";
import styles from "./PersonalData.module.css";
import HeaderBlock from "./HeaderBlock";
import ProfilePhotoSection from "./ProfilePhotoSection";
import ContactsSection from "./ContactsSection";
import UsernameSection from "./UsernameSection";
import { adminRequest } from "@/lib/api";
import { useUserProfileQuery } from "@/components/hooks/useUserProfileQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";

interface PersonalDataForm {
  firstName: string;
  lastName: string;
  phone: string;
  telegram: string;
  email: string;
  instagram: string;
}

const PersonalData: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [formData, setFormData] = useState<PersonalDataForm>({
    firstName: "",
    lastName: "",
    phone: "",
    telegram: "",
    email: "",
    instagram: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  // TanStack Query: завантаження та оновлення профілю
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useUserProfileQuery();
  const queryClient = useQueryClient();


  const handleInputChange = (field: keyof PersonalDataForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (file: File) => {
    // Якщо ProfilePhotoSection передав завантажений URL — беремо його
    const withUrl = file as File & { url?: string };
    if (withUrl.url) {
      setProfileImage(withUrl.url);
      return;
    }
    // Інакше показуємо превʼю з FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[PersonalData] remove avatar → backend (DELETE /api/profile/avatar)"
      );
    }
    fetch("/api/profile/avatar", { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        setProfileImage(null);
      })
      .catch((e) => {
        console.error("[PersonalData] remove avatar → failed", e);
      });
  };

  const handleSave = async () => {
    const numericOrServerId = (profile as unknown as { id?: number | string })
      ?.id;
    const targetId = String(numericOrServerId ?? user?.id ?? "");
    if (!targetId) return;

    let freshAcf: Record<string, unknown> = {};
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
        freshAcf = (freshProfile?.acf as Record<string, unknown>) || {};
        freshMeta = (freshProfile?.meta as Record<string, unknown>) || {};
      }
    } catch (error) {
      console.error("[PersonalData] Помилка отримання свіжих даних:", error);
    }

    const acfToSave: Record<string, unknown> = {
      ...freshAcf,
      phone: formData.phone,
      telegram: formData.telegram,
      instagram: formData.instagram,
    };

    const metaToSave: Record<string, unknown> = {
      ...(freshMeta.input_text_position !== undefined
        ? { input_text_position: freshMeta.input_text_position }
        : {}),
      ...(freshMeta.hl_data_my_wlocation !== undefined
        ? { hl_data_my_wlocation: freshMeta.hl_data_my_wlocation }
        : {}),
    };

    const numericId = targetId ? parseInt(targetId, 10) : null;
    if (!numericId || isNaN(numericId)) {
      console.error("[PersonalData] Невірний ID користувача:", targetId);
      return;
    }

    const payload: {
      id?: number;
      first_name?: string;
      last_name?: string;
      email?: string;
      acf?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    } = {
      id: numericId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      acf: acfToSave,
    };
    
    if (Object.keys(metaToSave).length > 0) {
      payload.meta = metaToSave;
    }
    try {
      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(
          `/wp-json/wp/v2/users/${targetId}`
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-internal-admin": "1",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[PersonalData] Помилка збереження:", {
          status: res.status,
          statusText: res.statusText,
          error: errorText,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user-profile", "me"] });
        queryClient.invalidateQueries({ queryKey: ["trainer-profile-full"] });
      }
    } catch (error) {
      console.error("[PersonalData] Помилка збереження:", error);
    }
  };

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!isLoggedIn && !token) {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        telegram: "",
        email: "",
        instagram: "",
      });
      setProfileImage(null);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!profile) return;

        const data = profile as unknown as {
          first_name?: string;
          last_name?: string;
          email?: string;
          user_email?: string;
          social_phone?: string;
          social_telegram?: string;
          social_instagram?: string;
          meta?: Record<string, string>;
          avatar?: string;
          avatar_urls?: Record<string, string>;
          img_link_data_avatar?: string;
          acf?: Record<string, unknown>; // РЕДАГУВАННЯ: додаємо acf для отримання контактних даних
        };
        const normalize = (s: string) =>
          String(s || "")
            .replace(/!+$/g, "")
            .trim();
        const firstName = normalize(data?.first_name || "");
        let lastName = normalize(data?.last_name || "");

        if (firstName && lastName && firstName === lastName) {
          lastName = "";
        }
        const email = data?.email || data?.user_email || "";
        const acf = (data as { acf?: Record<string, unknown> })?.acf || {};
        const meta = (data?.meta || {}) as Record<string, string>;
        
        const newPhone = (acf.phone as string) ||
          meta.input_text_social_phone ||
          meta.phone ||
          data?.social_phone ||
          "";
        const newTelegram = (acf.telegram as string) ||
          meta.input_text_social_telegram ||
          meta.social_telegram ||
          data?.social_telegram ||
          "";
        const newInstagram = (acf.instagram as string) ||
          meta.input_text_social_instagram ||
          meta.social_instagram ||
          data?.social_instagram ||
          "";
        setFormData((prev) => {
          if (
            prev.firstName === firstName &&
            prev.lastName === lastName &&
            prev.email === email &&
            prev.phone === newPhone &&
            prev.telegram === newTelegram &&
            prev.instagram === newInstagram
          ) {
            return prev;
          }
          
          return {
            firstName,
            lastName,
            email,
            phone: newPhone,
            telegram: newTelegram,
            instagram: newInstagram,
          };
        });

        // Синхронізуємо превʼю аватарки з бекенду
        const firstUploadUrl = Object.values(meta || {}).find(
          (v) => typeof v === "string" && v.includes("/wp-content/uploads/")
        ) as string | undefined;

        // Парсимо topLevelAvatar, якщо він є JSON рядком (як в useUserProfile)
        let topLevelAvatar: string | undefined = data?.img_link_data_avatar;
        if (
          typeof topLevelAvatar === "string" &&
          topLevelAvatar.startsWith("[")
        ) {
          try {
            const parsed = JSON.parse(topLevelAvatar) as string[];
            topLevelAvatar =
              Array.isArray(parsed) && parsed.length > 0
                ? parsed[0]
                : undefined;
          } catch {
            // Якщо не вдалося розпарсити, залишаємо як є
          }
        }

        const avatar96 = data?.avatar_urls?.["96"];
        const backendAvatar =
          topLevelAvatar ||
          (meta as { img_link_data_avatar?: string })?.img_link_data_avatar ||
          data?.avatar ||
          firstUploadUrl ||
          avatar96 ||
          null;
        if (backendAvatar) {
          setProfileImage(backendAvatar);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [profile]);

  return (
    <div className={styles.personalData}>
      <HeaderBlock />

      {/* <SectionDivider /> */}
      <div className={styles.divider}></div>

      <div className={styles.form}>
        {/* Profile Photo Section */}
        <ProfilePhotoSection
          profileImage={profileImage}
          onChange={handleImageChange}
          onRemove={handleRemoveImage}
        />

        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>

        {/* Username Section */}
        <UsernameSection
          firstName={formData.firstName}
          lastName={formData.lastName}
          onChange={(first, last) => {
            handleInputChange("firstName", first);
            handleInputChange("lastName", last);
          }}
        />

        {/* <SectionDivider /> */}
        <div className={styles.divider}></div>

        {/* Contact Details Section */}
        <ContactsSection
          phone={formData.phone}
          telegram={formData.telegram}
          email={formData.email}
          instagram={formData.instagram}
          onChange={(field, value) =>
            handleInputChange(
              field as "phone" | "telegram" | "email" | "instagram",
              value
            )
          }
        />

        {/* Save Button */}
        <div className={styles.saveSection}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Зберегти дані
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalData;
