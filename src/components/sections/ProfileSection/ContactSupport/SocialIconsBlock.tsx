"use client";

import React, { useEffect, useState } from "react";
import styles from "./ContactSupport.module.css";
import {
  InstagramIcon,
  TelegramIcon,
  FacebookIcon,
  WhatsappIcon,
} from "../../../Icons/Icons";

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

  if (isMobile) {
    return (
      <div className={styles.contactIconsBlock}>
        <div className={styles.socialIcons}>
          <div className={styles.socialIconsContainerMobile}>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[0].url)}
              title={links[0].name}
            >
              <InstagramIcon />
            </div>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[1].url)}
              title={links[1].name}
            >
              <FacebookIcon />
            </div>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[2].url)}
              title={links[2].name}
            >
              <TelegramIcon />
            </div>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[3].url)}
              title={links[3].name}
            >
              <WhatsappIcon />
            </div>
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
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[0].url)}
              title={links[0].name}
            >
              <InstagramIcon />
            </div>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[2].url)}
              title={links[2].name}
            >
              <TelegramIcon />
            </div>
          </div>
          <div className={styles.socialIconBlock}>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[1].url)}
              title={links[1].name}
            >
              <FacebookIcon />
            </div>
            <div
              className={styles.socialIcon}
              onClick={() => onClick(links[3].url)}
              title={links[3].name}
            >
              <WhatsappIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
