"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import s from "./CheckoutHeader.module.css";
import { LogoHeader, NumberHeader, EntranceIcon } from "../../Icons/Icons";

const LIGHT_LOGO_SRC = "/Vector2.svg";
const MOBILE_DEFAULT_LOGO_SRC = "/Vector6.svg";

export default function CheckoutHeader() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleExit = () => {
    router.push("/");
  };

  const desktopLogoGraphic = useMemo(() => {
    const isLightTheme = true;
    return isLightTheme ? (
      <Image
        src={LIGHT_LOGO_SRC}
        alt="B.F.B Fitness Logo"
        width={48}
        height={48}
        priority
      />
    ) : (
      <LogoHeader />
    );
  }, []);

  const mobileLogoSrc = isScrolled ? LIGHT_LOGO_SRC : MOBILE_DEFAULT_LOGO_SRC;

  return (
    <header className={s.header}>
      <div className={s.headerContent}>
        {isMobile ? (
          <div className={s.mobileLayout}>
            <div className={s.mobileLeft}>
              <button className={s.exitBtn} onClick={handleExit}>
                <EntranceIcon />
              </button>
            </div>

            <div className={s.mobileLogo}>
              <Link href="/" aria-label="Перейти на головну">
                <div className={s.LogoIcon}>
                  <Image
                    src={mobileLogoSrc}
                    alt="B.F.B Fitness Logo"
                    width={isScrolled ? 48 : 34}
                    height={isScrolled ? 48 : 43}
                    priority
                  />
                </div>
              </Link>
            </div>

            <div className={s.mobileRight}>
              <div className={s.contacts}>
                <p className={s.contactText}>Ми на зв&apos;язку:</p>
                <div className={s.phoneWrapper}>
                  <a href="tel:+380443338598" className={s.phoneLink}>
                    +38 (044) 333 85 98
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
        <div className={s.left}>
          <button className={s.exitBtn} onClick={handleExit}>
            <EntranceIcon />
                <span className={s.exitBtnText}>Вийти</span>
          </button>
        </div>

        <div className={s.logo}>
              <Link
                href="/"
                className={s.logoLink}
                aria-label="Перейти на головну"
              >
                <div className={s.LogoIcon}>{desktopLogoGraphic}</div>
                <div className={s.logoTextGroup}>
            <span className={s.logoTextOne}>B.F.B</span>
            <span className={s.logoText}>Fitness</span>
                </div>
          </Link>
        </div>

        <div className={s.right}>
          <div className={s.phone}>
            <NumberHeader />
            <div className={s.contacts}>
              <p className={s.contactText}>Ми на зв&apos;язку:</p>
              <div className={s.phoneWrapper}>
                    <a href="tel:+380954372575" className={s.phoneLink}>
                      +380 95 437 25 75
                </a>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </header>
  );
}
