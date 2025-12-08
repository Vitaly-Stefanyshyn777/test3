"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import s from "./Header.module.css";
import {
  BasketHeader,
  BurgerMenu,
  FacebookIcon,
  CloseButtonIcon,
  FavoriteHeader,
  InstagramIcon,
  LogoHeader,
  NumberHeader,
  TelegramIcon,
  UserHeader,
  WhatsappIcon,
} from "../../Icons/Icons";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import LoginModal from "@/components/auth/LoginModal/LoginModal";
import { useCartStore } from "@/store/cart";
import { useFavoriteStore } from "@/store/favorites";
import CartModal from "../../CartModal/CartModal";
import FavoritesModal from "../../FavoritesModal/FavoritesModal";
import { mainNavigation, burgerMenuNavigation } from "@/lib/navigation";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";
import { getContactData } from "@/lib/themeSettingsUtils";

export default function Header() {
  const [headerClass, setHeaderClass] = useState("");
  const pathname = usePathname();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isTrenersModalOpen, setIsTrenersModalOpen] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const { isLoggedIn } = useAuthStore();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const openCart = useCartStore((s) => s.open);
  const openFav = useFavoriteStore((s) => s.open);
  const toggleCart = useCartStore((s) => s.toggle);
  const toggleFav = useFavoriteStore((s) => s.toggle);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const isFavOpen = useFavoriteStore((s) => s.isOpen);

  // Використовуємо useMemo для кешування результатів
  const cartItemsMap = useCartStore((s) => s.items);
  const favoriteItemsMap = useFavoriteStore((s) => s.items);

  const cartItems = useMemo(() => Object.values(cartItemsMap), [cartItemsMap]);
  const favoriteItems = useMemo(
    () => Object.values(favoriteItemsMap),
    [favoriteItemsMap]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const favoriteCount = useMemo(() => favoriteItems.length, [favoriteItems]);

  // Отримуємо контактні дані з theme_settings
  const { data: themeSettings } = useThemeSettingsQuery();
  const contactData = useMemo(
    () => getContactData(themeSettings),
    [themeSettings]
  );

  const getHeaderColorByPath = useCallback(() => {
    if (pathname.startsWith("/trainers/")) return s.headerTrainerProfile;
    if (pathname === "/trainers") return s.headerTrainers;
    if (pathname === "/courses") return s.headerTrainerProfile;
    if (pathname.startsWith("/courses/")) return s.headerTrainerProfile;
    if (pathname === "/courses-landing") return s.headerTrainerProfile;
    if (pathname === "/photo-session") return s.headerTrainerProfile;
    if (pathname === "/about-bfb") return s.headerTrainerProfile;
    if (pathname === "/course") return s.headerTrainerProfile;
    if (pathname.startsWith("/profile")) return s.headerTrainerProfile;
    if (pathname === "/shop") return s.headerShop;
    if (pathname === "/instructing") return s.headerInstructing;
    // Treat both catalog and product detail routes as product header style
    if (pathname.startsWith("/products")) return s.headerProduct;
    return "";
  }, [pathname]);

  // Визначаємо чи є світла тема (білий фон)
  const isLightTheme = useMemo(() => {
    // Світла тема коли додано клас прокрутки (стає з білим фоном)
    if (headerClass.includes(s.headerScrolled)) return true;
    // Деякі сторінки мають білий фон хедера завжди
    if (headerClass.includes(s.headerTrainerProfile)) return true;
    return false;
  }, [headerClass]);

  useEffect(() => {
    setHeaderClass(getHeaderColorByPath());
  }, [pathname, getHeaderColorByPath]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const baseClass = getHeaderColorByPath();
          const heroSection = document.querySelector("[data-hero-section]");

          if (heroSection) {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            if (heroBottom < 0) {
              // Вийшли з хіро секції
              setHeaderClass(`${baseClass} ${s.headerScrolled}`);
            } else {
              // Ще в хіро секції
              setHeaderClass(baseClass);
            }
          } else {
            // Якщо хіро секції немає, використовуємо стару логіку
            if (window.scrollY > 100) {
              setHeaderClass(`${baseClass} ${s.headerScrolled}`);
            } else {
              setHeaderClass(baseClass);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Викликаємо один раз при монтуванні для встановлення початкового стану
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, getHeaderColorByPath]);

  const handleUserIconClick = () => {
    if (isLoggedIn) {
      window.location.href = "/profile";
    } else {
      openLoginModal();
    }
  };

  const handleLoginSuccess = async () => {
    closeLoginModal();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Блокуємо скролінг коли меню відкрите
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Очищуємо стилі при розмонтуванні компонента
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Визначення мобільної версії
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  // Відстеження стану модалки InstructingSlider
  useEffect(() => {
    const checkSliderState = () => {
      setIsSliderOpen(
        document.body.classList.contains("instructing-slider-open")
      );
    };

    checkSliderState();

    const observer = new MutationObserver(checkSliderState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Відстеження стану модалки EventsSection
  useEffect(() => {
    const checkEventsModalState = () => {
      setIsEventsModalOpen(
        document.body.classList.contains("events-modal-open")
      );
    };

    checkEventsModalState();

    const observer = new MutationObserver(checkEventsModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Відстеження стану модалки TrenersModal
  useEffect(() => {
    const checkTrenersModalState = () => {
      setIsTrenersModalOpen(
        document.body.classList.contains("treners-modal-open")
      );
    };

    checkTrenersModalState();

    const observer = new MutationObserver(checkTrenersModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Не показуємо хедер на сторінках order-success та checkout
  if (pathname === "/order-success" || pathname === "/checkout") {
    return null;
  }

  // Перевірка безпосередньо в рендері для надійності
  const shouldHideHeader =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1000px)").matches &&
    (document.body.classList.contains("instructing-slider-open") ||
      document.body.classList.contains("events-modal-open") ||
      document.body.classList.contains("treners-modal-open"));

  // Перевірка для InstructingSlider на всіх пристроях
  const shouldHideHeaderForSlider =
    typeof window !== "undefined" &&
    document.body.classList.contains("instructing-slider-open");

  // Не показуємо хедер на мобільних, коли модалка InstructingSlider, EventsSection або TrenersModal відкрита
  // Або на всіх пристроях, коли відкритий InstructingSlider
  if (
    shouldHideHeaderForSlider ||
    (isMobile && (isSliderOpen || isEventsModalOpen || isTrenersModalOpen)) ||
    shouldHideHeader
  ) {
    return null;
  }

  return (
    <header
      className={`${s.header} ${headerClass || ""} ${
        isMobile ? s.mobileHeader : ""
      }`}
      suppressHydrationWarning
    >
      <div className={s.headerTrainerProfileBlock}>
        {isMobile ? (
          <>
            <div className={s.mobileLeft}>
              <button className={s.burger} onClick={toggleMenu}>
                <BurgerMenu />
              </button>
              <button
                className={s.iconBtn}
                onClick={handleUserIconClick}
                title={
                  isHydrated
                    ? isLoggedIn
                      ? "Особистий кабінет"
                      : "Увійти"
                    : "Профіль"
                }
                suppressHydrationWarning
              >
                <UserHeader />
              </button>
            </div>

            <div className={s.mobileLogo}>
              <Link href="/">
                <div className={s.LogoIcon}>
                  {headerClass.includes(s.headerScrolled) ? (
                    <Image
                      src="/Vector2.svg"
                      alt="B.F.B Fitness Logo"
                      width={48}
                      height={48}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <Image
                      src="/Vector6.svg"
                      alt="B.F.B Fitness Logo"
                      width={34}
                      height={43}
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
              </Link>
            </div>

            <div className={s.mobileRight}>
              <button
                className={`${s.iconBtn} ${isFavOpen ? s.active : ""}`}
                onClick={toggleFav}
                title="Обране"
              >
                <FavoriteHeader />
                {favoriteCount > 0 && (
                  <span className={s.badge}>{favoriteCount}</span>
                )}
              </button>
              <button
                className={`${s.iconBtn} ${isCartOpen ? s.active : ""}`}
                onClick={toggleCart}
                title="Кошик"
              >
                <BasketHeader />
                {cartCount > 0 && <span className={s.badge}>{cartCount}</span>}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={s.left}>
              <button className={s.burger} onClick={toggleMenu}>
                <BurgerMenu />
              </button>
              <nav className={s.nav}>
                {mainNavigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className={s.logo}>
              <Link href="/">
                <div className={s.LogoIcon}>
                  {isLightTheme || pathname.startsWith("/products") ? (
                    <Image
                      src="/Vector2.svg"
                      alt="B.F.B Fitness Logo"
                      width={48}
                      height={48}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <LogoHeader />
                  )}
                </div>
              </Link>
              <Link href="/">B.F.B Fitness</Link>
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

              <div className={s.headerActions}>
                <div className={s.icons}>
                  <button
                    className={`${s.iconBtn} ${isFavOpen ? s.active : ""}`}
                    onClick={toggleFav}
                    title="Обране"
                  >
                    <FavoriteHeader />
                    {favoriteCount > 0 && (
                      <span className={s.badge}>{favoriteCount}</span>
                    )}
                  </button>
                  <button
                    className={`${s.iconBtn} ${isCartOpen ? s.active : ""}`}
                    onClick={toggleCart}
                    title="Кошик"
                  >
                    <BasketHeader />
                    {cartCount > 0 && (
                      <span className={s.badge}>{cartCount}</span>
                    )}
                  </button>
                  <button
                    className={`${s.iconBtn} ${s.userBtn}`}
                    onClick={handleUserIconClick}
                    onMouseEnter={() => !isMobile && setIsUserHovered(true)}
                    onMouseLeave={() => setIsUserHovered(false)}
                    title={
                      isHydrated
                        ? isLoggedIn
                          ? "Особистий кабінет"
                          : "Увійти"
                        : "Профіль"
                    }
                    suppressHydrationWarning
                  >
                    {!isMobile && isUserHovered ? (
                      <Image
                        src="/images/fi_232123248.svg"
                        alt="User hover icon"
                        width={16}
                        height={16}
                      />
                    ) : (
                      <UserHeader />
                    )}
                  </button>
                </div>

                <div className={s.authButtons}>
                  {isHydrated && !isLoggedIn && (
                    <button
                      className={s.register}
                      onClick={() => setIsRegisterOpen(true)}
                    >
                      Реєстрація
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSubmit={handleLoginSuccess}
      />
      <CartModal />
      <FavoritesModal />

      {/* Desktop Menu */}
      {isMenuOpen && (
        <div className={s.menuOverlay} onClick={toggleMenu}>
          <div className={s.menuContainer} onClick={(e) => e.stopPropagation()}>
            <div className={s.menuContent}>
              <div className={s.menuHeader}>
                <h5 className={s.menuTitle}>Меню</h5>
                <button className={s.menuClose} onClick={toggleMenu}>
                  <CloseButtonIcon />
                </button>
              </div>

              <div className={s.menuSection}>
                <p className={s.sectionTitle}>B.F.B Напрямок:</p>

                <div className={s.menuItemBlock}>
                  {burgerMenuNavigation.main.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={s.menuLink}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className={s.menuSection}>
                <p className={s.sectionTitle}>Додатково</p>
                <div className={s.menuItemBlock}>
                  {burgerMenuNavigation.additional.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={s.menuLink}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className={s.contactInfoContainer}>
              <div className={s.contactGrid}>
                <div className={s.contactRow}>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Телефон</h5>
                    <p className={s.contactValue}>
                      {contactData.phone || "+380 95 437 25 75"}
                    </p>
                  </div>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Час роботи у вихідні:</h5>
                    <p className={s.contactValue}>
                      {contactData.weekends || "10:00 - 20:00"}
                    </p>
                  </div>
                </div>

                <div className={s.contactRow}>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Email</h5>
                    <p className={s.contactValue}>
                      {contactData.email || "bfb.board.ukraine@gmail.com"}
                    </p>
                  </div>
                  <div className={s.contactItem}>
                    <h5 className={s.contactLabel}>Час роботи у будні:</h5>
                    <p className={s.contactValue}>
                      {contactData.weekdays || "10:00 - 20:00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={s.addressSection}>
                <h5 className={s.contactLabel}>Адреса головного залу:</h5>
                <p className={s.contactValue}>
                  {contactData.address || "м. Київ, Хрещатик, будинок 23/A"}
                </p>
              </div>

              <div className={s.socialSection}>
                {contactData.socialLinks.length > 0 ? (
                  contactData.socialLinks.map((social, index) => {
                    const iconMap: Record<string, React.ComponentType> = {
                      Instagram: InstagramIcon,
                      Facebook: FacebookIcon,
                      Telegram: TelegramIcon,
                      WhatsApp: WhatsappIcon,
                    };
                    const Icon = iconMap[social.name] || null;
                    if (!Icon) return null;
                    return (
                      <a
                        key={index}
                        href={social.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.socialIcon}
                      >
                        <Icon />
                      </a>
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
      )}
    </header>
  );
}
