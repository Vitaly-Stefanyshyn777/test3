"use client";
import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useFavoriteStore } from "@/store/favorites";

// Функція для нормалізації ключа товару в кошику
function normalizeCartKey(id: string): string {
  // Якщо id містить префікс (course-, product-), витягуємо число
  const match = id.match(/(?:course|product)-(\d+)/i);
  if (match && match[1]) {
    return match[1]; // Повертаємо тільки число
  }
  return id; // Повертаємо як є для звичайних товарів
}
import {
  BasketIcon,
  SmitnikIcon,
  BasketMobileVioletIcon,
  BasketMobileVioletGreenIcon,
} from "@/components/Icons/Icons";
import s from "./CartButton.module.css";

type Props = {
  id: string;
  name: string;
  price?: number;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  image?: string;
  stockQuantity?: number | null;
  className?: string;
  activeClassName?: string;
  removeFromFavoritesOnAddToCart?: boolean;
  requireAuth?: boolean; // Додатковий проп для вимоги авторизації
};

export default function CartButton({
  id,
  name,
  price = 0,
  originalPrice,
  regularPrice,
  salePrice,
  image,
  stockQuantity,
  className = "",
  activeClassName = "",
  removeFromFavoritesOnAddToCart = false,
  requireAuth = true, // За замовчуванням вимагає авторизації (для курсів)
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const removeFromFavorites = useFavoriteStore((s) => s.remove);
  const favoriteItems = useFavoriteStore((s) => s.items);
  const isInFavorites = favoriteItems[id] !== undefined;
  const normalizedKey = normalizeCartKey(id);
  const inCart =
    (cartItems[id] && cartItems[id].quantity > 0) ||
    (cartItems[normalizedKey] && cartItems[normalizedKey].quantity > 0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Додаткова перевірка: курси вимагають авторизації, продукти - ні
    const isCourse =
      id.includes("course") || name.toLowerCase().includes("курс");
    const needsAuth = requireAuth || isCourse;

    if (needsAuth && !isLoggedIn && !inCart) {
      openLoginModal();
      return;
    }

    if (inCart) {
      // Для видалення шукаємо товар за різними ключами
      const itemToRemove = cartItems[id] || cartItems[normalizedKey];
      if (itemToRemove) {
        const keyToRemove = cartItems[id] ? id : normalizedKey;
        removeItem(keyToRemove);
      }
    } else {
      try {
        await addItem(
          { id, name, price, originalPrice, regularPrice, salePrice, image, stockQuantity },
          1
        );
      } catch (error) {
        alert((error as Error).message);
        return;
      }

      // Якщо потрібно, видаляємо товар з favorites після додавання в кошик
      if (removeFromFavoritesOnAddToCart && isInFavorites) {
        removeFromFavorites(id);
      }
    }
  };

  return (
    <button
      className={`${s.root} ${className} ${
        inCart ? `${s.active} ${activeClassName}` : ""
      }`}
      onClick={handleClick}
      aria-pressed={inCart}
      aria-label={inCart ? "Видалити з кошика" : "Додати в кошик"}
    >
      {isMobile ? (
        inCart ? (
          <BasketMobileVioletGreenIcon />
        ) : (
          <BasketMobileVioletIcon />
        )
      ) : inCart ? (
        <SmitnikIcon />
      ) : (
        <BasketIcon />
      )}
    </button>
  );
}
