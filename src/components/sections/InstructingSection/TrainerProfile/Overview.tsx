import React, { useState } from "react";
import Image from "next/image";
import styles from "./TrainerProfile.module.css";
import { TrainerUser } from "./types";
import { getAvatarUrl, getSpecialties, getFavouriteExercises } from "./utils";
import {
  DumbbellsIcon,
  LocationIcon,
  InstagramIcon,
  TelegramIcon,
  FacebookIcon,
  WhatsappIcon,
} from "@/components/Icons/Icons";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { normalizeImageUrl } from "@/lib/imageUtils";

export default function Overview({ trainer }: { trainer: TrainerUser }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Логування для діагностики
  if (process.env.NODE_ENV !== "production") {
    console.log("[Overview] trainer дані:", {
      gallery: trainer?.gallery,
      hl_data_gallery: trainer?.hl_data_gallery,
      certificate: trainer?.certificate,
    });
  }

  const avatar = getAvatarUrl(trainer?.avatar);
  const specialties = getSpecialties(trainer);
  const favouriteExercises = getFavouriteExercises(trainer);

  const placeholderAvatar =
    "https://via.placeholder.com/300x300/f0f0f0/666?text=Тренер";
  const normalizedAvatar = avatar
    ? normalizeImageUrl(avatar)
    : placeholderAvatar;
  const [avatarUrl, setAvatarUrl] = useState(
    normalizedAvatar !== "/placeholder.svg"
      ? normalizedAvatar
      : placeholderAvatar
  );

  // Контакти тренера (телефон = також WhatsApp)
  const rawPhone =
    trainer.social_phone ||
    trainer.input_text_phone ||
    trainer.input_text_email;
  const phoneDigits = rawPhone ? rawPhone.replace(/[^\d]/g, "") : "";
  const whatsappLink = phoneDigits ? `https://wa.me/${phoneDigits}` : "";

  const instagramHandle = trainer.social_instagram;
  const instagramLink = instagramHandle
    ? instagramHandle.startsWith("http")
      ? instagramHandle
      : `https://instagram.com/${instagramHandle.replace(/^[@/]+/, "")}`
    : "";

  const telegramHandle = trainer.social_telegram;
  const telegramLink = telegramHandle
    ? telegramHandle.startsWith("http")
      ? telegramHandle
      : `https://t.me/${telegramHandle.replace(/^[@/]+/, "")}`
    : "";

  const facebookHandle = trainer.social_facebook || "";
  const facebookLink = facebookHandle
    ? facebookHandle.startsWith("http")
      ? facebookHandle
      : `https://facebook.com/${facebookHandle.replace(/^[@/]+/, "")}`
    : "";

  const contactItems: {
    type: "instagram" | "facebook" | "telegram" | "whatsapp";
    href: string;
  }[] = [];
  if (instagramLink)
    contactItems.push({ type: "instagram", href: instagramLink });
  if (facebookLink) contactItems.push({ type: "facebook", href: facebookLink });
  if (telegramLink) contactItems.push({ type: "telegram", href: telegramLink });
  if (whatsappLink) contactItems.push({ type: "whatsapp", href: whatsappLink });

  const hasContacts = contactItems.length > 0;

  // Використовуємо тільки gallery (як було раніше)
  let galleryImages: string[] = [];

  if (trainer?.gallery) {
    if (typeof trainer.gallery === "string") {
      const normalized = normalizeImageUrl(trainer.gallery);
      if (normalized !== "/placeholder.svg") {
        galleryImages = [normalized];
      }
    } else if (Array.isArray(trainer.gallery)) {
      galleryImages = trainer.gallery
        .map((item) => {
          if (typeof item === "string") {
            return normalizeImageUrl(item);
          }
          return null;
        })
        .filter(
          (url): url is string => url !== null && url !== "/placeholder.svg"
        );
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[Overview] galleryImages після обробки:", galleryImages);
  }

  const locationText =
    trainer?.location_city ||
    (Array.isArray(trainer?.locations)
      ? (trainer?.locations as string[]).join(", ")
      : trainer?.locations) ||
    "";

  const nextImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const hasSlider = galleryImages.length > 2;

  return (
    <div className={styles.overview}>
      <div className={styles.profileInfo}>
        <div className={styles.superPowerContainer}>
          <div className={styles.profileImage}>
            <Image
              src={avatarUrl}
              alt={trainer.name || "Тренер"}
              width={300}
              height={300}
              unoptimized={
                !avatar || avatarUrl.startsWith("https://via.placeholder.com")
              }
              onError={() => {
                // Якщо зображення не завантажилось, встановлюємо placeholder
                if (avatarUrl !== placeholderAvatar) {
                  setAvatarUrl(placeholderAvatar);
                }
              }}
              className={styles.avatar}
            />
          </div>

          <div className={styles.superPowerBlock}>
            {trainer.super_power && trainer.super_power.trim() !== "" && (
              <div className={styles.superPower}>
                <h3>Моя суперсила:</h3>
                <p>{trainer.super_power}</p>
              </div>
            )}
            {favouriteExercises.length > 0 && (
              <div className={styles.favoriteExercise}>
                <h3>Улюблена вправа:</h3>
                <div className={styles.exerciseItem}>
                  <span className={styles.exerciseIcon}></span>
                  <div className={styles.exerciseText}>
                    {favouriteExercises.map(
                      (exercise: string, index: number) => (
                        <span key={index} className={styles.exerciseTag}>
                          {exercise}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.ContactsContainer}>
            {hasContacts && (
              <>
                <p className={styles.ContactsText}>Контакти:</p>
                <div className={styles.IconsContainer}>
                  {contactItems.map((item, index) => (
                    <a
                      key={`${item.type}-${index}`}
                      href={item.href}
                      className={styles.IconsBlock}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.type === "instagram" && <InstagramIcon />}
                      {item.type === "facebook" && <FacebookIcon />}
                      {item.type === "telegram" && <TelegramIcon />}
                      {item.type === "whatsapp" && <WhatsappIcon />}
                    </a>
                  ))}
                </div>
              </>
            )}
            <button className={styles.contactButton}>
              Зв&apos;язатися з тренером
            </button>
          </div>
        </div>

        <div className={styles.headerContainer}>
          <div className={styles.headerBlock}>
            <div className={styles.header}>
              <h1 className={styles.title}>
                {trainer.position || "Тренер, Реабілітолог"}
              </h1>
              <h2 className={styles.name}>{trainer.name}</h2>
            </div>

            {(locationText || trainer.experience) && (
              <div className={styles.info}>
                {locationText && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>
                      <LocationIcon />
                    </span>
                    <span className={styles.infoText}>{locationText}</span>
                  </div>
                )}
                {trainer.experience && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>
                      <DumbbellsIcon />
                    </span>
                    <span className={styles.infoText}>
                      Досвід: {trainer.experience}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {specialties.length > 0 && (
            <div className={styles.specializationsContainer}>
              <div className={styles.specializations}>
                <h3>Спеціалізації:</h3>
                <div className={styles.tags}>
                  {specialties.map((spec: string, index: number) => (
                    <span key={index} className={styles.tag}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {trainer.my_experience && trainer.my_experience.length > 0 && (
            <div className={styles.workExperienceContainer}>
              <h3 className={styles.workExperienceTitle}>Досвід роботи:</h3>
              <div className={styles.experienceEntry}>
                <div className={styles.experienceEntryBlock}>
                  <div className={styles.workExperienceBlock}>
                    <div className={styles.workExperience}>
                      {trainer.my_experience.map((exp, index) => (
                        <div key={index} className={styles.experienceItem}>
                          <div className={styles.experienceRow}>
                            <div className={styles.experienceHeader}>
                              <span className={styles.company}>
                                {exp.hl_input_text_gym}
                              </span>
                              <span className={styles.period}>
                                {exp.hl_input_date_date_start} -{" "}
                                {exp.hl_input_date_date_end}
                              </span>
                            </div>
                          </div>

                          <p className={styles.experienceDescription}>
                            {exp.hl_textarea_ex_description || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {trainer.my_experience.length > 2 && (
                    <button className={styles.showMore} id="favorite-exercise">
                      Показати ще
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div id="gallery" className={styles.gallerySection}>
            <h3 className={styles.galleryTitle}>Галерея</h3>
            {galleryImages.length === 0 ? (
              <div className={styles.galleryContainer}>
                <div className={styles.galleryImageWrapper}>
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    Галерея порожня
                  </p>
                </div>
              </div>
            ) : hasSlider ? (
              <div className={styles.galleryContainer}>
                <div className={styles.galleryImageWrapper}>
                  <Image
                    src={galleryImages[currentImageIndex]}
                    alt={`Фото тренера ${currentImageIndex + 1}`}
                    width={600}
                    height={400}
                    className={styles.galleryImage}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.galleryContainer}>
                <div className={styles.galleryImageGrid}>
                  {galleryImages.slice(0, 2).map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt={`Фото тренера ${i + 1}`}
                      width={600}
                      height={400}
                      className={styles.galleryImage}
                    />
                  ))}
                </div>
              </div>
            )}
            {hasSlider && (
              <SliderNav
                activeIndex={currentImageIndex}
                dots={galleryImages.length}
                onPrev={prevImage}
                onNext={nextImage}
                onDotClick={goToImage}
                buttonBgColor="var(--bg-color)"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
