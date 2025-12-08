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
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings]
  );
  return (
    <div className={s.contactInfo}>
      <div className={s.content}>
        <div className={s.titleTextBlock}>
          <h2 className={s.title}>Контакти</h2>
        </div>

        <div className={s.contactDetailsContainer}>
          <div className={s.contactDetailsBlock}>
            <div className={s.contactIcons}>
              <div className={s.socialIcons}>
                <div className={s.socialIconsContainer}>
                  <div className={s.socialIconBlock}>
                    {contactData.socialLinks.length > 0 ? (
                      contactData.socialLinks.map((social, index) => {
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
                      })
                    ) : (
                      <>
                        <a
                          href="https://www.instagram.com/bfb.official_ukraine?igsh=enFybWFmZGE3NG8z"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.socialIcon}
                        >
                          <InstagramIcon />
                        </a>
                        <div className={s.socialIcon}>
                          <FacebookIcon />
                        </div>
                        <div className={s.socialIcon}>
                          <TelegramIcon />
                        </div>
                        <div className={s.socialIcon}>
                          <WhatsappIcon />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={s.contactEmailNumber}>
              <a
                href={`tel:${contactData.phone.replace(/\s/g, "") || "+380954372575"}`}
                className={s.valueNumber}
              >
                {contactData.phone || "+380 95 437 25 75"}
              </a>
              <a
                href={`mailto:${contactData.email || "bfb.board.ukraine@gmail.com"}`}
                className={s.valueEmail}
              >
                {contactData.email || "bfb.board.ukraine@gmail.com"}
              </a>
            </div>
          </div>

          <div className={s.contactAddressBlock}>
            <p className={s.valueAddress}>
              {contactData.address || "Мукачево, вул. Духновича 40"}
            </p>
            <div className={s.contactItem}>
              {contactData.weekdays && (
                <p className={s.valueSchedule}>пн-пт: {contactData.weekdays}</p>
              )}
              {contactData.weekends && (
                <p className={s.valueSchedule}>сб-нд: {contactData.weekends}</p>
              )}
              {!contactData.weekdays && !contactData.weekends && (
                <>
                  <p className={s.valueSchedule}>пн-пт: 09:00 - 22:00</p>
                  <p className={s.valueSchedule}>сб-нд: 10:00 - 20:00</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
