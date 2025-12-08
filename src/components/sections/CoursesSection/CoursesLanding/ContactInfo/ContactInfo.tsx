"use client";
import React, { useMemo } from "react";
import s from "./ContactInfo.module.css";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
} from "@/components/Icons/Icons";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";

const ContactInfo: React.FC = () => {
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(() => getContactData(themeSettings), [themeSettings]);
  return (
    <div className={s.contactInfo}>
      <div className={s.content}>
        <div className={s.titleTextBlock}>
          <h2 className={s.title}>Готові стати частиною BFB?</h2>
          <p className={s.description}>
            Залишайте заявку, навчайтесь у зручному форматі, отримуйте
            сертифікат і починайте новий етап. Ми працюємо з тими, хто цінує
            усвідомленість і розвиток у спільноті.
          </p>
        </div>

        <div className={s.contactDetails}>
          <div className={s.contactItemBlock}>
            <div className={s.contactItem}>
              <span className={s.label}>Телефон:</span>
              <span className={s.value}>
                {contactData.phone || "+38 (99) 999 99 99"}
              </span>
            </div>

            <div className={s.contactItem}>
              <span className={s.label}>Час роботи у вихідні:</span>
              <span className={s.value}>
                {contactData.weekends || "10:00 - 20:00"}
              </span>
            </div>
          </div>

          <div className={s.contactItemBlock}>
            <div className={s.contactItem}>
              <span className={s.label}>Email:</span>
              <span className={s.value}>
                {contactData.email || "bfb.board.ukraine@gmail.com"}
              </span>
            </div>

            <div className={s.contactItem}>
              <span className={s.label}>Час роботи у будні:</span>
              <span className={s.value}>
                {contactData.weekdays || "09:00 - 22:00"}
              </span>
            </div>
          </div>
          <div className={s.contactIconsBlock}>
            <div className={s.socialIcons}>
              <div className={s.socialIconsContainer}>
                {contactData.socialLinks.length > 0 ? (
                  <>
                    <div className={s.socialIconBlock}>
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
                              className={s.socialIcon}
                            >
                              <Icon />
                            </a>
                          ) : (
                            <div key={index} className={s.socialIcon}>
                              <Icon />
                            </div>
                          );
                        })}
                    </div>
                    <div className={s.socialIconBlock}>
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
                              className={s.socialIcon}
                            >
                              <Icon />
                            </a>
                          ) : (
                            <div key={index} className={s.socialIcon}>
                              <Icon />
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={s.socialIconBlock}>
                      <div className={s.socialIcon}>
                        <InstagramIcon />
                      </div>
                      <div className={s.socialIcon}>
                        <FacebookIcon />
                      </div>
                    </div>
                    <div className={s.socialIconBlock}>
                      <div className={s.socialIcon}>
                        <TelegramIcon />
                      </div>
                      <div className={s.socialIcon}>
                        <WhatsappIcon />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
