"use client";
import React from "react";
import s from "./ContactInfo.module.css";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
} from "../../../Icons/Icons";

const ContactInfo: React.FC = () => {
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
                  </div>
                </div>
              </div>
            </div>
            <div className={s.contactEmailNumber}>
              <a href="tel:+380954372575" className={s.valueNumber}>
                +380 95 437 25 75
              </a>
              <a
                href="mailto:bfb.board.ukraine@gmail.com"
                className={s.valueEmail}
              >
                bfb.board.ukraine@gmail.com
              </a>
            </div>
          </div>

          <div className={s.contactAddressBlock}>
            <p className={s.valueAddress}>Мукачево, вул. Духновича 40</p>
            <div className={s.contactItem}>
              <p className={s.valueSchedule}>пн-пт: 09:00 - 22:00</p>
              <p className={s.valueSchedule}>сб-нд: 10:00 - 20:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
