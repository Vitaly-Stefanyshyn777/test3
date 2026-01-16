"use client";
import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useFavoriteStore } from "@/store/favorites";
import { useRouter } from "next/navigation";
import {
  BasketIcon,
  SmitnikIcon,
  BasketMobileVioletIcon,
  BasketMobileVioletGreenIcon,
} from "@/components/Icons/Icons";
import s from "./CartButton.module.css";

function normalizeCartKey(id: string): string {
  const match = id.match(/(?:course|product)-(\d+)/i);
  return match?.[1] ?? id;
}

type Props = {
  id: string;
  name: string;
  slug?: string;
  productType?: string;
  variations?: number[];
  price?: number;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  image?: string;
  stockQuantity?: number | null;
  className?: string;
  activeClassName?: string;
  removeFromFavoritesOnAddToCart?: boolean;
  requireAuth?: boolean;
};

export default function CartButton({
  id,
  name,
  slug,
  productType,
  variations,
  price = 0,
  originalPrice,
  regularPrice,
  salePrice,
  image,
  stockQuantity,
  className = "",
  activeClassName = "",
  removeFromFavoritesOnAddToCart = false,
  requireAuth = true,
}: Props) {
  const router = useRouter();
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

  const isCourse = id.includes("course") || name.toLowerCase().includes("курс");

  const numericId = (() => {
    const raw = normalizeCartKey(id);
    return /^\d+$/.test(raw) ? raw : null;
  })();

  const getProductHref = () => {
    const rawSlug = slug?.trim();
    if (rawSlug) {
      if (rawSlug.startsWith("/")) return rawSlug;
      try {
        return `/products/${
          rawSlug.includes("%") ? decodeURIComponent(rawSlug) : rawSlug
        }`;
      } catch {
        return `/products/${rawSlug}`;
      }
    }
    return numericId ? `/products/${numericId}` : "/products";
  };

  const isVariableByProps =
    productType === "variable" || (variations?.length ?? 0) > 0;

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

    const needsAuth = requireAuth || isCourse;

    if (!isCourse) {
      if (isVariableByProps) {
        router.push(getProductHref());
        return;
      }
    }

    if (needsAuth && !isLoggedIn && !inCart) {
      openLoginModal();
      return;
    }

    if (inCart) {
      const itemToRemove = cartItems[id] || cartItems[normalizedKey];
      if (itemToRemove) {
        const keyToRemove = cartItems[id] ? id : normalizedKey;
        removeItem(keyToRemove);
      }
    } else {
      try {
        await addItem(
          {
            id,
            name,
            price,
            originalPrice,
            regularPrice,
            salePrice,
            image,
            stockQuantity,
          },
          1
        );
      } catch (error) {
        alert((error as Error).message);
        return;
      }

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
