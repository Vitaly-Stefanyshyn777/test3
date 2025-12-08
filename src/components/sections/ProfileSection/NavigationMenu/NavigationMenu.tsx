"use client";
import React from "react";
import styles from "./NavigationMenu.module.css";
import { useAuthStore } from "@/store/auth";
import { usePathname } from "next/navigation";
import { navigationItems } from "./data";
import NavigationLink from "./NavigationLink";
import LogoutButton from "./LogoutButton";
import { useQueryClient } from "@tanstack/react-query";

const NavigationMenu: React.FC = () => {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return (
    <nav className={styles.navigationMenu}>
      <ul className={styles.menuList}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.id === "logout") {
            return (
              <LogoutButton
                key={item.id}
                item={item}
                isActive={isActive}
                onLogout={async () => {
                  try {
                    // Очищаємо весь React Query кеш перед виходом
                    queryClient.clear();
                    await logout();
                    window.location.href = "/";
                  } catch {}
                }}
              />
            );
          }

          return (
            <NavigationLink key={item.id} item={item} isActive={isActive} />
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationMenu;
