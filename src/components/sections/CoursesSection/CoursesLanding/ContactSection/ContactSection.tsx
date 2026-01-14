"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import s from "./ContactSection.module.css";
import ContactInfo from "../ContactInfo/ContactInfo";
import ContactForm, { ContactFormValues } from "../ContactForm/ContactForm";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
} from "@/components/Icons/Icons";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";
import { useContactQuestion } from "@/lib/useMutation";
import { toast } from "react-toastify";

const ContactSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ContactFormValues>();

  const formValues = watch();
  const isFormFilled = !!(
    formValues.name?.trim() &&
    formValues.phone?.trim() &&
    formValues.email?.trim() &&
    formValues.instagram?.trim()
  );

  const contactMutation = useContactQuestion();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    const payload: {
      name: string;
      email?: string;
      phone?: string;
      nickname?: string;
      question?: string;
    } = { name: data.name };
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;
    if (data.instagram) payload.nickname = data.instagram; // map instagram to nickname for API
    if (data.comment) payload.question = data.comment; // map comment to question for API

    contactMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        toast.success("Ваше повідомлення успішно надіслано!");
      },
      onError: () => {
        toast.error("Не вдалося надіслати повідомлення. Спробуйте ще раз.");
      },
    });
  };

  if (isMobile === null) {
    return null;
  }

  const titleTextBlock = (
    <div className={s.mobileTitleTextBlock}>
      <h2 className={s.mobileTitle}>Готові стати частиною BFB?</h2>
      <p className={s.mobileDescription}>
        Залишайте заявку, навчайтесь у зручному форматі, отримуйте сертифікат і
        починайте новий етап. Ми працюємо з тими, хто цінує усвідомленість і
        розвиток у спільноті.
      </p>
    </div>
  );

  const contactDetails = (
    <div className={s.mobileContactDetails}>
      <div className={s.mobileContactItemBlock}>
        <div className={s.mobileContactItem}>
          <span className={s.mobileLabel}>Телефон:</span>
          <span className={s.mobileNumberValue}>
            {contactData.phone || "+380 95 437 25 75"}
          </span>
        </div>

        <div className={s.mobileContactItem}>
          <span className={s.mobileLabel}>Час роботи у вихідні:</span>
          <span className={s.mobileValue}>
            {contactData.weekends || "10:00 - 20:00"}
          </span>
        </div>
      </div>

      <div className={s.mobileContactItemBlock}>
        <div className={s.mobileContactItem}>
          <span className={s.mobileLabel}>Email:</span>
          <span className={s.mobileValue}>
            {contactData.email || "bfb.board.ukraine@gmail.com"}
          </span>
        </div>

        <div className={s.mobileContactItem}>
          <span className={s.mobileLabel}>Час роботи у будні:</span>
          <span className={s.mobileValue}>
            {contactData.weekdays || "09:00 - 22:00"}
          </span>
        </div>
      </div>

      <div className={s.mobileContactIconsBlock}>
        <div className={s.mobileSocialIcons}>
          <div className={s.mobileSocialIconsContainer}>
            <div className={s.mobileSocialIconBlock}>
              {contactData.socialLinks.length > 0 ? (
                contactData.socialLinks.map((social, index) => {
                  const iconMap: Record<
                    string,
                    React.ComponentType<{ className?: string }>
                  > = {
                    Instagram: InstagramIcon,
                    Facebook: FacebookIcon,
                    Telegram: TelegramIcon,
                    WhatsApp: WhatsappIcon,
                  };
                  const Icon = iconMap[social.name] || null;
                  if (!Icon) return null;
                  return social.link ? (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.mobileSocialIcon}
                    >
                      <Icon />
                    </a>
                  ) : (
                    <div key={index} className={s.mobileSocialIcon}>
                      <Icon />
                    </div>
                  );
                })
              ) : (
                <>
                  <a
                    href="https://www.instagram.com/bfb.official_ukraine?igsh=enFybWFmZGE3NG8z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.mobileSocialIcon}
                  >
                    <InstagramIcon />
                  </a>
                  <div className={s.mobileSocialIcon}>
                    <FacebookIcon />
                  </div>
                  <div className={s.mobileSocialIcon}>
                    <TelegramIcon />
                  </div>
                  <div className={s.mobileSocialIcon}>
                    <WhatsappIcon />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={s.contactSection}>
      <div className={s.container}>
        <div className={s.innerContainer}>
          {isMobile ? (
            <>
              <div className={s.mobileContactInfo}>
                <div className={s.mobileContent}>{titleTextBlock}</div>
              </div>
              <div className={s.formWrapper}>
                <ContactForm
                  register={register}
                  errors={errors}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting || contactMutation.isPending}
                  isPending={contactMutation.isPending}
                  isError={!!contactMutation.isError}
                  isFormFilled={isFormFilled}
                />
              </div>
              <div className={s.mobileContactDetailsWrapper}>
                <div className={s.mobileContent}>{contactDetails}</div>
              </div>
            </>
          ) : (
            <>
              <ContactInfo />
              <div className={s.formWrapper}>
                <ContactForm
                  register={register}
                  errors={errors}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting || contactMutation.isPending}
                  isPending={contactMutation.isPending}
                  isError={!!contactMutation.isError}
                  isFormFilled={isFormFilled}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
