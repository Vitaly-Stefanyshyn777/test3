export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
}

export const mainNavigation: NavigationItem[] = [
  {
    href: "/trainers",
    label: "Тренери",
  },
  {
    href: "/courses",
    label: "Навчання B.F.B",
  },

  {
    href: "/products",
    label: "Інвентар",
  },
  {
    href: "/#events",
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
      label: "Інструкторство",
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
