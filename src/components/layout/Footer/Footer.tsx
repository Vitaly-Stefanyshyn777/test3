"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import s from "./Footer.module.css";
import {
  LogoHeader,
  InstagramIcon,
  FacebookIcon,
  TelegramIcon,
  WhatsappIcon,
  PrivateIcon,
  ApplePayIcon,
  GooglePayIcon,
  MastercardIcon,
  VisardIcon,
  MonoPayIcon,
} from "../../Icons/Icons";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import LoginModal from "@/components/auth/LoginModal/LoginModal";
import { useAuthStore } from "@/store/auth";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";
import { useMemo } from "react";

const Footer = () => {
  const pathname = usePathname();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);

  // Отримуємо контактні дані з theme_settings
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings]
  );

  // Не показуємо футер на сторінках order-success та checkout
  if (pathname === "/order-success" || pathname === "/checkout") {
    return null;
  }

  return (
    <footer className={s.footer}>
      <div className={s.logoContainer}>
        <div className={s.logo}>
          <div className={s.brandLinkContainer}>
            <div className={s.logoIcon}>
              <LogoHeader />
            </div>
            <div className={s.brandNameContainer}>
              <Image
                src="/images/Frame-1321318176.svg"
                alt="B.F.B Fitness"
                width={166}
                height={25}
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </div>
        </div>
        <div className={s.authButtons}>
          <button
            className={s.loginButton}
            onClick={openLoginModal}
          >
            Вхід
          </button>
          <button
            className={s.registerButton}
            onClick={() => setIsRegisterOpen(true)}
          >
            Реєстрація
          </button>
        </div>
      </div>
      <div className={s.footerTop}>
        <div className={s.divider}></div>

        {/* Основний контент футера */}
        <div className={s.footerMain}>
          {/* Контакти */}
          <div className={s.contactsContainer}>
            <div className={s.contactsSection}>
              <h3 className={s.sectionTitle}>КОНТАКТИ:</h3>
              <div className={s.contactInfo}>
                <a
                  href={`tel:${contactData.phone.replace(/\s/g, "") || "+380954372575"}`}
                  className={`${s.contactLink} ${s.phoneLink}`}
                >
                  {contactData.phone || "+380 95 437 25 75"}
                </a>
                <a
                  href={`mailto:${contactData.email || "bfb.board.ukraine@gmail.com"}`}
                  className={`${s.contactLink} ${s.mailLink}`}
                >
                  {contactData.email || "bfb.board.ukraine@gmail.com"}
                </a>
              </div>
              <div className={s.socialIcons}>
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
                        className={s.iconButton}
                      >
                        <Icon />
                      </a>
                    ) : (
                      <button key={index} className={s.iconButton}>
                        <Icon />
                      </button>
                    );
                  })
                ) : (
                  <>
                    <a
                      href="https://www.instagram.com/bfb.official_ukraine?igsh=enFybWFmZGE3NG8z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.iconButton}
                    >
                      <InstagramIcon />
                    </a>
                    <button className={s.iconButton}>
                      <FacebookIcon />
                    </button>
                    <button className={s.iconButton}>
                      <TelegramIcon />
                    </button>
                    <button className={s.iconButton}>
                      <WhatsappIcon />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Адреса */}
            <div className={s.addressSection}>
              <h3 className={s.sectionTitle}>АДРЕСА:</h3>
              <address className={s.address}>
                <p className={s.addressText}>
                  {contactData.address || "Мукачево, вул. Духновича 40"}
                </p>
                {contactData.weekdays && (
                  <p className={s.scheduleItem}>
                    понеділок - пятниця: {contactData.weekdays}
                  </p>
                )}
                {contactData.weekends && (
                  <p className={s.scheduleItem}>
                    субота - неділя: {contactData.weekends}
                  </p>
                )}
                {!contactData.weekdays && !contactData.weekends && (
                  <>
                    <p className={s.scheduleItem}>
                      понеділок - пятниця: 09:00 - 22:00
                    </p>
                    <p className={s.scheduleItem}>субота - неділя: 10:00 - 20:00</p>
                  </>
                )}
              </address>
            </div>
          </div>

          {/* Навігація */}
          <div className={s.navigationSections}>
            <div className={s.navSection}>
              <h3 className={s.sectionTitle}>ПРО ПЛАТФОРМУ</h3>
              <ul className={s.navList}>
                <li className={s.navItem}>
                  <Link href="/" className={s.navLink}>
                    Головна
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/about-bfb" className={s.navLink}>
                    Про BFB
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/courses-landing" className={s.navLink}>
                    Про Інструкторство
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/contacts" className={s.navLink}>
                    Контакти
                  </Link>
                </li>
              </ul>
            </div>

            <div className={s.navSection}>
              <h3 className={s.sectionTitle}>ПОСЛУГИ & ТОВАРИ</h3>
              <ul className={s.navList}>
                <li className={s.navItem}>
                  <Link href="/trainers" className={s.navLink}>
                    Каталог тренерів
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/products" className={s.navLink}>
                    Каталог товарів
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/courses" className={s.navLink}>
                    Онлайн тренування
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/our-courses" className={s.navLink}>
                    Навчальні програми
                  </Link>
                </li>
              </ul>
            </div>

            <div className={s.navSection}>
              <h3 className={s.sectionTitle}>ДОКУМЕНТАЦІЯ</h3>
              <ul className={s.navList}>
                <li className={s.navItem}>
                  <Link href="/privacy" className={s.navLink}>
                    Політика конфіденційності
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/terms" className={s.navLink}>
                    Умови співпраці
                  </Link>
                </li>
                <li className={s.navItem}>
                  <Link href="/refunds" className={s.navLink}>
                    Умови повернення, обміну та оплати
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={s.divider}></div>

      {/* Нижня частина футера */}
      <div className={s.footerBottom}>
        <div>
          <p className={s.copyright}>©2024 BFB. All Rights Reserved.</p>
        </div>
        <div className={s.paymentMethods}>
          <a
            href="https://www.privat24.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <PrivateIcon />
          </a>
          <a
            href="https://www.apple.com/apple-pay/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <ApplePayIcon />
          </a>
          <a
            href="https://pay.google.com/about/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <GooglePayIcon />
          </a>
          <a
            href="https://www.visa.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <VisardIcon />
          </a>
          <a
            href="https://www.mastercard.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <MastercardIcon />
          </a>
          <a
            href="https://www.monobank.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <MonoPayIcon />
          </a>
        </div>

        <p className={s.credits}>
          Сайт розроблено агентами:{" "}
          <a
            href="https://before-after.agency/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.creditsLink}
          >
            Before/After
          </a>
        </p>
      </div>
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </footer>
  );
};

export default Footer;
