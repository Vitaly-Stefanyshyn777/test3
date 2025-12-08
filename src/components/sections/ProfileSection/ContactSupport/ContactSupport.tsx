"use client";
import React, { useEffect, useState } from "react";
import styles from "./ContactSupport.module.css";

import ContactHeader from "./ContactHeader";
import ContactInfoBlock from "./ContactInfoBlock";
import SocialIconsBlock from "./SocialIconsBlock";
import WorkingHoursBlock from "./WorkingHoursBlock";
import MapBlock from "./MapBlock";
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

const defaultContactInfo: ContactInfo = {
  phone: "+380 95 437 25 75",
  email: "bfb.board.ukraine@gmail.com",
};

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

const defaultWorkingHours: WorkingHours = {
  weekdays: "09:00 - 22:00",
  weekends: "10:00 - 20:00",
};

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/place/%D0%92%D1%83%D0%BB%D0%B8%D1%86%D1%8F+%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%B0+%D0%94%D1%83%D1%85%D0%BD%D0%BE%D0%B2%D0%B8%D1%87%D0%B0,+40,+%D0%9C%D1%83%D0%BA%D0%B0%D1%87%D0%B5%D0%B2%D0%BE,+%D0%97%D0%B0%D0%BA%D0%B0%D1%80%D0%BF%D0%B0%D1%82%D1%81%D1%8C%D0%BA%D0%B0+%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C,+89600";

const ContactSupport: React.FC<ContactSupportProps> = ({
  title = "Контакти і підтримка",
  contactInfo = defaultContactInfo,
  socialLinks = defaultSocialLinks,
  workingHours = defaultWorkingHours,
  address = "Мукачево, вул. Духновича 40",
  mapUrl = DEFAULT_MAP_URL,
}) => {
  const [isMobile, setIsMobile] = useState(false);

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
              phone={contactInfo.phone}
              email={contactInfo.email}
            />
            <MapBlock mapUrl={mapUrl} />
          </div>
          <WorkingHoursBlock
            weekdays={workingHours.weekdays}
            weekends={workingHours.weekends}
            address={address}
          />
          <SocialIconsBlock
            onClick={handleSocialClick}
            links={socialLinks.map((l) => ({ name: l.name, url: l.url }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactSupport}>
      <ContactHeader title={title} />
      <div className={styles.contactGrid}>
        <ContactInfoBlock phone={contactInfo.phone} email={contactInfo.email} />
        <SocialIconsBlock
          onClick={handleSocialClick}
          links={socialLinks.map((l) => ({ name: l.name, url: l.url }))}
        />
        <WorkingHoursBlock
          weekdays={workingHours.weekdays}
          weekends={workingHours.weekends}
          address={address}
        />
        <MapBlock mapUrl={mapUrl} />
      </div>
    </div>
  );
};

export default ContactSupport;
