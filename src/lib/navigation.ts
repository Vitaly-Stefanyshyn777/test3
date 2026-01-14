export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
}

// Функція для отримання правильного якоря для LearningFormats залежно від пристрою
export const getLearningFormatsAnchor = (): string => {
  if (typeof window === 'undefined') return '/#LearningFormats'; // SSR fallback

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return isMobile ? '/#LearningMobileFormats' : '/#LearningFormats';
};

export const mainNavigation: NavigationItem[] = [
  {
    href: "/trainers",
    label: "Тренери",
  },
  {
    href: "/#LearningFormats",
    label: "Навчання B.F.B",
  },

  {
    href: "/products",
    label: "Інвентар",
  },
  {
    href: "/courses",
    label: "Воркшопи",
  },
];

export const additionalNavigation: NavigationItem[] = [
  {
    href: "/courses",
    label: "Онлайн тренування",
  },
  {
    href: "/courses",
    label: "Навчальні програми",
  },
  {
    href: "/contacts",
    label: "Контакти",
  },
];

export const burgerMenuNavigation = {
  main: [
    {
      href: "/",
      label: "Головна",
    },
    {
      href: "/about-bfb",
      label: "Про BFB",
    },
    {
      href: "/courses-landing",
      label: "Інструкторство B.F.B",
    },
    {
      href: "/trainers",
      label: "Каталог тренерів",
    },
    {
      href: "/products",
      label: "Каталог товарів",
    },
  ],
  additional: [
    {
      href: "/courses",
      label: "Онлайн тренування",
    },
    {
      href: "/our-courses",
      label: "Навчальні програми",
    },
    {
      href: "/contacts",
      label: "Контакти",
    },
  ],
};
