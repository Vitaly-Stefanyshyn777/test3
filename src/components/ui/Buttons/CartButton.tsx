"use client";
import React from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { BasketIcon, SmitnikIcon } from "@/components/Icons/Icons";
import s from "./CartButton.module.css";

type Props = {
  id: string; // unique key in cart
  name: string;
  price?: number;
  image?: string;
  className?: string;
  activeClassName?: string;
};

export default function CartButton({
  id,
  name,
  price = 0,
  image,
  className = "",
  activeClassName = "",
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const inCart = !!cartItems[id] && cartItems[id].quantity > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Якщо користувач не залогінений і намагається додати до корзини
    if (!isLoggedIn && !inCart) {
      openLoginModal();
      return;
    }
    
    if (inCart) removeItem(id);
    else addItem({ id, name, price, image }, 1);
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
      {inCart ? <SmitnikIcon /> : <BasketIcon />}
    </button>
  );
}
