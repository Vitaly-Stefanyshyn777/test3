"use client";
import React, { useState, useEffect } from "react";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import {
  Favorite2Icon,
  FavoriteBlacIcon,
  BasketMobileRedGreenIcon,
} from "@/components/Icons/Icons";
import s from "./FavoriteButton.module.css";

type Props = {
  id: string; // unique key for favorite store
  slug?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  className?: string;
  activeClassName?: string;
  useRedGreenIconOnMobile?: boolean; // для використання червоно-зеленої іконки на мобільній версії в FavoritesModal
  variationId?: number;
  color?: string;
  size?: string;
  stockQuantity?: number | null;
  wcProduct?: {
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
    };
    on_sale?: boolean;
  };
};

export default function FavoriteButton({
  id,
  slug,
  name,
  price = 0,
  originalPrice,
  image,
  className = "",
  activeClassName = "",
  useRedGreenIconOnMobile = false,
  variationId,
  color,
  size,
  stockQuantity,
  wcProduct,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const isFav = useFavoriteStore(selectIsFavorite(id));
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav({
      id,
      slug,
      name,
      price,
      originalPrice,
      image,
      variationId,
      color,
      size,
      stockQuantity,
      wcProduct
    });
  };

  return (
    <button
      className={`${s.root} ${className} ${
        isFav ? `${s.active} ${activeClassName}` : ""
      } ${useRedGreenIconOnMobile && isMobile ? s.redGreenMode : ""}`}
      onClick={handleClick}
      aria-pressed={isFav}
      aria-label={isFav ? "Видалити з обраних" : "Додати в обрані"}
    >
      {useRedGreenIconOnMobile && isMobile ? (
        <BasketMobileRedGreenIcon />
      ) : isFav ? (
        <FavoriteBlacIcon />
      ) : (
        <Favorite2Icon />
      )}
    </button>
  );
}
