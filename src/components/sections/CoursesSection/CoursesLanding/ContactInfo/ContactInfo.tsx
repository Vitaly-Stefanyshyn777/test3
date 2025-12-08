"use client";
import React from "react";
import s from "./ContactInfo.module.css";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
} from "@/components/Icons/Icons";

const ContactInfo: React.FC = () => {
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
              <span className={s.value}>+38 (99) 999 99 99</span>
            </div>

            <div className={s.contactItem}>
              <span className={s.label}>Час роботи у вихідні:</span>
              <span className={s.value}>10:00 - 20:00</span>
            </div>
          </div>

          <div className={s.contactItemBlock}>
            <div className={s.contactItem}>
              <span className={s.label}>Email:</span>
              <span className={s.value}>bfb.board.ukraine@gmail.com</span>
            </div>

            <div className={s.contactItem}>
              <span className={s.label}>Час роботи у будні:</span>
              <span className={s.value}>09:00 - 22:00</span>
            </div>
          </div>
          <div className={s.contactIconsBlock}>
            <div className={s.socialIcons}>
              <div className={s.socialIconsContainer}>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
