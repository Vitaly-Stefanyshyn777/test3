"use client";
import React from "react";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import {
  Favorite2Icon,
  FavoriteBlacIcon,
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
  wcProduct,
}: Props) {
  const isFav = useFavoriteStore(selectIsFavorite(id));
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav({ id, slug, name, price, originalPrice, image, wcProduct });
  };

  return (
    <button
      className={`${s.root} ${className} ${
        isFav ? `${s.active} ${activeClassName}` : ""
      }`}
      onClick={handleClick}
      aria-pressed={isFav}
      aria-label={isFav ? "Видалити з обраних" : "Додати в обрані"}
    >
      {isFav ? <FavoriteBlacIcon /> : <Favorite2Icon />}
    </button>
  );
}
