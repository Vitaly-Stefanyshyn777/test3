"use client";

import React, { useEffect, useState } from "react";
import styles from "./ContactSupport.module.css";
import {
  InstagramIcon,
  TelegramIcon,
  FacebookIcon,
  WhatsappIcon,
} from "@/components/Icons/Icons";

type Props = {
  onClick: (url: string) => void;
  links: { name: string; url: string }[];
};

export default function SocialIconsBlock({ onClick, links }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Перевірка та забезпечення наявності всіх 4 елементів
  const safeLinks = Array.from({ length: 4 }, (_, i) => 
    links[i] || { name: "", url: "#" }
  );

  if (isMobile) {
    return (
      <div className={styles.contactIconsBlock}>
        <div className={styles.socialIcons}>
          <div className={styles.socialIconsContainerMobile}>
            {safeLinks[0] && safeLinks[0].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[0].url)}
                title={safeLinks[0].name}
              >
                <InstagramIcon />
              </div>
            )}
            {safeLinks[1] && safeLinks[1].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[1].url)}
                title={safeLinks[1].name}
              >
                <FacebookIcon />
              </div>
            )}
            {safeLinks[2] && safeLinks[2].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[2].url)}
                title={safeLinks[2].name}
              >
                <TelegramIcon />
              </div>
            )}
            {safeLinks[3] && safeLinks[3].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[3].url)}
                title={safeLinks[3].name}
              >
                <WhatsappIcon />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactIconsBlock}>
      <div className={styles.socialIcons}>
        <div className={styles.socialIconsContainer}>
          <div className={styles.socialIconBlock}>
            {safeLinks[0] && safeLinks[0].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[0].url)}
                title={safeLinks[0].name}
              >
                <InstagramIcon />
              </div>
            )}
            {safeLinks[2] && safeLinks[2].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[2].url)}
                title={safeLinks[2].name}
              >
                <TelegramIcon />
              </div>
            )}
          </div>
          <div className={styles.socialIconBlock}>
            {safeLinks[1] && safeLinks[1].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[1].url)}
                title={safeLinks[1].name}
              >
                <FacebookIcon />
              </div>
            )}
            {safeLinks[3] && safeLinks[3].name && (
              <div
                className={styles.socialIcon}
                onClick={() => onClick(safeLinks[3].url)}
                title={safeLinks[3].name}
              >
                <WhatsappIcon />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
