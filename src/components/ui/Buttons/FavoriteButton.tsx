"use client";
import React, { useState, useEffect } from "react";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import { useRouter } from "next/navigation";
import {
  Favorite2Icon,
  FavoriteBlacIcon,
  BasketMobileRedGreenIcon,
} from "@/components/Icons/Icons";
import s from "./FavoriteButton.module.css";

function extractProductNumericId(id: string): string | null {
  const match = id.match(/(?:^|-)product-(\d+)/i);
  if (match?.[1]) return match[1];
  // чисто число
  if (/^\d+$/.test(id)) return id;
  // будь-яке перше число
  const any = id.match(/\d+/);
  return any?.[0] ?? null;
}

type Props = {
  id: string; // unique key for favorite store
  slug?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  className?: string;
  activeClassName?: string;
  useRedGreenIconOnMobile?: boolean;
  variationId?: number;
  color?: string;
  size?: string;
  stockQuantity?: number | null;
  productType?: string;
  variations?: number[];
  metaData?: Array<{ key: string; value: string }>;
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
  productType,
  variations,
  metaData,
  wcProduct,
}: Props) {
  const router = useRouter();
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
    const numeric = extractProductNumericId(id);
    return numeric ? `/products/${numeric}` : "/products";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isVariableByProps =
      productType === "variable" || (variations?.length ?? 0) > 0;

    if (!variationId && isVariableByProps) {
      router.push(getProductHref());
      return;
    }

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
      productType,
      variations,
      metaData,
      wcProduct,
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
