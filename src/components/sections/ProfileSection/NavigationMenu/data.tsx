import {
  HouseIcon,
  User2Icon,
  DumbbellsIcon,
  BagIcon,
  DocumentIcon,
  BagMoneyIcon,
  LockIcon2,
  EntranceIcon,
  QuestionBorderIcon,
} from "../../../Icons/Icons";
import type { NavigationItem } from "./types";

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Головна",
    href: "/profile",
    icon: HouseIcon,
  },
  {
    id: "trainer-profile",
    label: "Профіль тренера",
    href: "/profile/trainer-profile",
    icon: User2Icon,
    badge: 0,
  },
  {
    id: "courses",
    label: "Курси",
    href: "/profile/courses",
    icon: DumbbellsIcon,
  },
  {
    id: "orders",
    label: "Замовлення",
    href: "/profile/orders",
    icon: BagIcon,
  },
  {
    id: "personal-data",
    label: "Особисті дані",
    href: "/profile/personal-data",
    icon: DocumentIcon,
  },
  {
    id: "subscription",
    label: "Підписка",
    href: "/profile/subscription",
    icon: BagMoneyIcon,
  },
  {
    id: "change-password",
    label: "Змінити пароль",
    href: "/profile/change-password",
    icon: LockIcon2,
  },
  {
    id: "profile-guide",
    label: "Як заповнити профіль",
    href: "/profile/profile-guide",
    icon: QuestionBorderIcon,
  },
  { id: "logout", label: "Вийти", href: "/logout", icon: EntranceIcon },
];
