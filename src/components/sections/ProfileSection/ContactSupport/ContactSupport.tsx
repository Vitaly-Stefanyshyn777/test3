"use client";
import React, { useEffect, useState, useMemo } from "react";
import styles from "./ContactSupport.module.css";

import ContactHeader from "./ContactHeader";
import ContactInfoBlock from "./ContactInfoBlock";
import SocialIconsBlock from "./SocialIconsBlock";
import WorkingHoursBlock from "./WorkingHoursBlock";
import MapBlock from "./MapBlock";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";
interface ContactInfo {
  phone: string;
  email: string;
}

interface SocialLink {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

interface WorkingHours {
  weekdays: string;
  weekends: string;
}

interface ContactSupportProps {
  title?: string;
  contactInfo?: ContactInfo;
  socialLinks?: SocialLink[];
  workingHours?: WorkingHours;
  address?: string;
  mapUrl?: string;
}

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/place/%D0%92%D1%83%D0%BB%D0%B8%D1%86%D1%8F+%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%B0+%D0%94%D1%83%D1%85%D0%BD%D0%BE%D0%B2%D0%B8%D1%87%D0%B0,+40,+%D0%9C%D1%83%D0%BA%D0%B0%D1%87%D0%B5%D0%B2%D0%BE,+%D0%97%D0%B0%D0%BA%D0%B0%D1%80%D0%BF%D0%B0%D1%82%D1%81%D1%8C%D0%BA%D0%B0+%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C,+89600";

const ContactSupport: React.FC<ContactSupportProps> = ({
  title = "Контакти і підтримка",
  contactInfo,
  socialLinks,
  workingHours,
  address,
  mapUrl,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Отримуємо контактні дані з theme_settings
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(() => getContactData(themeSettings), [themeSettings]);

  // Використовуємо дані з API або пропси, або fallback
  const finalContactInfo: ContactInfo = contactInfo || {
    phone: contactData.phone || "+380 95 437 25 75",
    email: contactData.email || "bfb.board.ukraine@gmail.com",
  };

  // Створюємо масив соціальних мереж, завжди з 4 елементами для SocialIconsBlock
  const defaultSocialLinks: SocialLink[] = [
    {
      name: "Instagram",
      icon: () => null,
      url: "https://www.instagram.com/bfb.official_ukraine?igsh=enFybWFmZGE3NG8z",
    },
    { name: "Telegram", icon: () => null, url: "https://t.me/bfbfitness" },
    {
      name: "Facebook",
      icon: () => null,
      url: "https://facebook.com/bfbfitness",
    },
    { name: "WhatsApp", icon: () => null, url: "https://wa.me/380954372575" },
  ];

  // Визначаємо джерело соціальних мереж
  let sourceLinks: SocialLink[] = [];
  
  if (socialLinks && socialLinks.length > 0) {
    sourceLinks = socialLinks;
  } else if (contactData.socialLinks && contactData.socialLinks.length > 0) {
    sourceLinks = contactData.socialLinks.map((social) => ({
      name: social.name || "",
      icon: () => null,
      url: social.link || "#",
    }));
  } else {
    sourceLinks = defaultSocialLinks;
  }

  // Забезпечуємо наявність рівно 4 елементів
  const finalSocialLinks: SocialLink[] = Array.from({ length: 4 }, (_, i) => 
    sourceLinks[i] || defaultSocialLinks[i]
  );

  const finalWorkingHours: WorkingHours = workingHours || {
    weekdays: contactData.weekdays || "09:00 - 22:00",
    weekends: contactData.weekends || "10:00 - 20:00",
  };

  const finalAddress = address || contactData.address || "Мукачево, вул. Духновича 40";
  const finalMapUrl = mapUrl || DEFAULT_MAP_URL;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSocialClick = (url: string) => {
    if (url !== "#") {
      window.open(url, "_blank");
    }
  };

  if (isMobile) {
    return (
      <div className={styles.contactSupport}>
        <ContactHeader title={title} />
        <div className={styles.mobileCard}>
          <div className={styles.mobileTopRow}>
            <ContactInfoBlock
              phone={finalContactInfo.phone}
              email={finalContactInfo.email}
            />
            <MapBlock mapUrl={finalMapUrl} />
          </div>
          <WorkingHoursBlock
            weekdays={finalWorkingHours.weekdays}
            weekends={finalWorkingHours.weekends}
            address={finalAddress}
          />
          <SocialIconsBlock
            onClick={handleSocialClick}
            links={finalSocialLinks.map((l) => ({ name: l.name, url: l.url }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactSupport}>
      <ContactHeader title={title} />
      <div className={styles.contactGrid}>
        <ContactInfoBlock phone={finalContactInfo.phone} email={finalContactInfo.email} />
        <SocialIconsBlock
          onClick={handleSocialClick}
          links={finalSocialLinks.map((l) => ({ name: l.name, url: l.url }))}
        />
        <WorkingHoursBlock
          weekdays={finalWorkingHours.weekdays}
          weekends={finalWorkingHours.weekends}
          address={finalAddress}
        />
        <MapBlock mapUrl={finalMapUrl} />
      </div>
    </div>
  );
};

export default ContactSupport;
