"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import s from "./ContactSection.module.css";
import ContactInfo from "../ContactInfo/ContactInfo";
import ContactForm, { ContactFormValues } from "../ContactForm/ContactForm";
import ContactInfoStyles from "../ContactInfo/ContactInfo.module.css";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
} from "@/components/Icons/Icons";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";

const ContactSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(() => getContactData(themeSettings), [themeSettings]);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      reset();
    } catch (error) {
      // Silent error handling
    }
  };

  if (isMobile === null) {
    return null;
  }

  const titleTextBlock = (
    <div className={ContactInfoStyles.titleTextBlock}>
      <h2 className={ContactInfoStyles.title}>Готові стати частиною BFB?</h2>
      <p className={ContactInfoStyles.description}>
        Залишайте заявку, навчайтесь у зручному форматі, отримуйте сертифікат і
        починайте новий етап. Ми працюємо з тими, хто цінує усвідомленість і
        розвиток у спільноті.
      </p>
    </div>
  );

  const contactDetails = (
    <div className={ContactInfoStyles.contactDetails}>
      <div className={ContactInfoStyles.contactItemBlock}>
        <div className={ContactInfoStyles.contactItem}>
          <span className={ContactInfoStyles.label}>Телефон:</span>
          <span className={ContactInfoStyles.value}>
            {contactData.phone || "+380 95 437 25 75"}
          </span>
        </div>

        <div className={ContactInfoStyles.contactItem}>
          <span className={ContactInfoStyles.label}>Час роботи у вихідні:</span>
          <span className={ContactInfoStyles.value}>
            {contactData.weekends || "10:00 - 20:00"}
          </span>
        </div>
      </div>

      <div className={ContactInfoStyles.contactItemBlock}>
        <div className={ContactInfoStyles.contactItem}>
          <span className={ContactInfoStyles.label}>Email:</span>
          <span className={ContactInfoStyles.value}>
            {contactData.email || "bfb.board.ukraine@gmail.com"}
          </span>
        </div>

        <div className={ContactInfoStyles.contactItem}>
          <span className={ContactInfoStyles.label}>Час роботи у будні:</span>
          <span className={ContactInfoStyles.value}>
            {contactData.weekdays || "09:00 - 22:00"}
          </span>
        </div>
      </div>
      <div className={ContactInfoStyles.contactIconsBlock}>
        <div className={ContactInfoStyles.socialIcons}>
          <div className={ContactInfoStyles.socialIconsContainer}>
            {contactData.socialLinks.length > 0 ? (
              <>
                <div className={ContactInfoStyles.socialIconBlock}>
                  {contactData.socialLinks
                    .slice(0, 2)
                    .map((social, index) => {
                      const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
                          className={ContactInfoStyles.socialIcon}
                        >
                          <Icon />
                        </a>
                      ) : (
                        <div key={index} className={ContactInfoStyles.socialIcon}>
                          <Icon />
                        </div>
                      );
                    })}
                </div>
                <div className={ContactInfoStyles.socialIconBlock}>
                  {contactData.socialLinks
                    .slice(2, 4)
                    .map((social, index) => {
                      const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
                          className={ContactInfoStyles.socialIcon}
                        >
                          <Icon />
                        </a>
                      ) : (
                        <div key={index} className={ContactInfoStyles.socialIcon}>
                          <Icon />
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <>
                <div className={ContactInfoStyles.socialIconBlock}>
                  <div className={ContactInfoStyles.socialIcon}>
                    <InstagramIcon />
                  </div>
                  <div className={ContactInfoStyles.socialIcon}>
                    <FacebookIcon />
                  </div>
                </div>
                <div className={ContactInfoStyles.socialIconBlock}>
                  <div className={ContactInfoStyles.socialIcon}>
                    <TelegramIcon />
                  </div>
                  <div className={ContactInfoStyles.socialIcon}>
                    <WhatsappIcon />
                  </div>
                </div>
              </>
            )}
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
              <div className={ContactInfoStyles.contactInfo}>
                <div className={ContactInfoStyles.content}>
                  {titleTextBlock}
                </div>
              </div>
              <div className={s.formWrapper}>
                <ContactForm
                  register={register}
                  errors={errors}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  isPending={false}
                  isError={false}
                  isFormFilled={isFormFilled}
                />
              </div>
              <div className={ContactInfoStyles.contactInfo}>
                <div className={ContactInfoStyles.content}>
                  {contactDetails}
                </div>
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
                  isSubmitting={isSubmitting}
                  isPending={false}
                  isError={false}
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
