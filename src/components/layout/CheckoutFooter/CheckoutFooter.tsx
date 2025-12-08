"use client";

import Link from "next/link";
import s from "./CheckoutFooter.module.css";
import {
  InstagramIcon,
  FacebookIcon,
  TelegramIcon,
  WhatsappIcon,
  PrivateIcon,
  ApplePayIcon,
  GooglePayIcon,
  VisardIcon,
  MonoPayIcon,
} from "../../Icons/Icons";

export default function CheckoutFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.footerContent}>
        {/* Контакти */}
        <div className={s.contactsBlock}>
          <div className={s.contactsSection}>
            <h3 className={s.sectionTitle}>КОНТАКТИ:</h3>
            <div className={s.contactInfo}>
              <a
                href="tel:+380954372575"
                className={`${s.contactLink} ${s.phoneLink}`}
              >
                +380 95 437 25 75
              </a>
              <a
                href="mailto:bfb.board.ukraine@gmail.com"
                className={`${s.contactLink} ${s.mailLink}`}
              >
                bfb.board.ukraine@gmail.com
              </a>
            </div>
            <div className={s.socialIcons}>
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
            </div>
          </div>

          {/* Адреса */}
          <div className={s.addressSection}>
            <h3 className={s.sectionTitle}>АДРЕСА:</h3>
            <address className={s.address}>
              <p className={s.addressText}>Мукачево, вул. Духновича 40</p>
              <p className={s.scheduleItem}>
                понеділок - пятниця: 09:00 - 22:00,
              </p>
              <p className={s.scheduleItem}>субота - неділя: 10:00 - 20:00</p>
            </address>
          </div>
        </div>

        {/* Документація */}
        <div className={s.documentationSection}>
          <h3 className={s.sectionTitle}>ДОКУМЕНТАЦІЯ</h3>
          <ul className={s.list}>
            <li>
              <Link href="/privacy" className={s.listLink}>
                Політика конфіденційності
              </Link>
            </li>
            <li>
              <Link href="/terms" className={s.listLink}>
                Умови співпраці
              </Link>
            </li>
            <li>
              <Link href="/return" className={s.listLink}>
                Умови повернення, обміну та оплати
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={s.divider}></div>

      {/* Нижня частина футера */}
      <div className={s.footerBottom}>
        <p className={s.copyright}>©2024 bfb. All Rights Reserved.</p>
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
            href="https://www.monobank.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.paymentMethod}
          >
            <MonoPayIcon />
          </a>
        </div>
        <p className={s.credits}>
          Сайт розроблено агенством{" "}
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
    </footer>
  );
}
