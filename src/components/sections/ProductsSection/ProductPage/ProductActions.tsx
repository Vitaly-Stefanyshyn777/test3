"use client";
import React from "react";
import {
  Favorite2Icon,
  FavoriteBlacIcon,
  BasketHeader,
  MinuswIcon,
  PlusIcon,
  CheckMarkIcon,
  CloseButtonIcon,
  GiftIcon,
} from "@/components/Icons/Icons";
import { useProductActions } from "@/components/hooks/useProductActions";
import styles from "./ProductPage.module.css";
import type { Product } from "@/lib/products";
import type { ProductActionsProps } from "./types";

export default function ProductActions({
  product,
  selectedVariation,
  isLoggedIn,
  isMobile,
  isBoardProduct,
  isAvailable,
  stockStatusText,
  isControlsDisabled,
  cartQuantity,
  selectedImageIndex,
  onRegisterOpen,
}: ProductActionsProps) {
  const {
    quantity,
    isAddingToCart,
    isFavorite,
    setQuantity,
    addToCart,
    toggleFavorite,
    incrementQuantity,
    decrementQuantity,
  } = useProductActions(product, selectedVariation, isLoggedIn);

  return (
    <>
      {/* Мобільні дії */}
      {isMobile && (
        <div className={styles.mobileActionsWrapper}>
          <div className={styles.subscriptionOffer}>
            <span className={styles.subscriptionIcon}>
              <GiftIcon />
            </span>
            <span>
              Оформіть підписку — отримайте знижки та доступ до ексклюзивних
              функцій!
            </span>
          </div>

          {isBoardProduct && !isLoggedIn ? (
            <div className={styles.registerCallout}>
              <div
                className={styles.registerBlock}
                onClick={onRegisterOpen}
                style={{ cursor: "pointer" }}
              >
                <p className={styles.registerText}>
                  Зареєструйтесь, щоб придбати борд
                </p>
              </div>

              <button className={styles.registerBtn} onClick={onRegisterOpen}>
                Зареєструватися
              </button>
            </div>
          ) : (
            <div className={styles.actionButtons}>
              <div className={`${styles.quantitySection}`}>
                <div
                  className={`${styles.quantityControls} ${
                    isControlsDisabled ? styles.quantityDisabled : ""
                  }`}
                >
                  <button
                    onClick={() => !isControlsDisabled && decrementQuantity()}
                    disabled={isControlsDisabled}
                  >
                    <MinuswIcon />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      !isControlsDisabled &&
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    disabled={isControlsDisabled}
                  />
                  <button
                    onClick={() => !isControlsDisabled && incrementQuantity()}
                    disabled={isControlsDisabled}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
              <div className={styles.addToCartBtnWrapper}>
                <button
                  className={`${styles.addToCartBtn} ${
                    isControlsDisabled ? styles.addToCartBtnDisabled : ""
                  } ${isAddingToCart ? styles.addToCartBtnInCart : ""}`}
                  onClick={() => {
                    if (isControlsDisabled) return;
                    addToCart(selectedImageIndex);
                  }}
                  disabled={isControlsDisabled || isAddingToCart}
                >
                  <BasketHeader />
                  {isAddingToCart
                    ? `Додано в кошик ${cartQuantity}`
                    : "Додати в кошик"}
                </button>
                <button
                  className={`${styles.favoriteBtn} ${
                    isFavorite ? styles.favoriteActive : ""
                  } ${isControlsDisabled ? styles.favoriteBtnDisabled : ""}`}
                  onClick={() => {
                    if (isControlsDisabled) return;
                    toggleFavorite();
                  }}
                  title="Додати в улюблені"
                  disabled={isControlsDisabled}
                >
                  {isFavorite ? <FavoriteBlacIcon /> : <Favorite2Icon />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Десктопні дії */}
      {!isMobile && (
        <div className={styles.detailsRow}>
          <div className={styles.availability}>
            <span className={styles.checkmark}>
              {isAvailable ? <CheckMarkIcon /> : <CloseButtonIcon />}
            </span>
            <span className={styles.detailText}>{stockStatusText}</span>
          </div>
          <div className={styles.productCode}>
            <span>Код товару: </span>
            {product?.sku || product?.id || ""}
          </div>
        </div>
      )}

      {/* Загальні дії для десктопу */}
      {!isMobile && (
        <div className={styles.actionButtons}>
          <div className={`${styles.quantitySection}`}>
            <div
              className={`${styles.quantityControls} ${
                isControlsDisabled ? styles.quantityDisabled : ""
              }`}
            >
              <button
                onClick={() => !isControlsDisabled && decrementQuantity()}
                disabled={isControlsDisabled}
              >
                <MinuswIcon />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  !isControlsDisabled &&
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                disabled={isControlsDisabled}
              />
              <button
                onClick={() => !isControlsDisabled && incrementQuantity()}
                disabled={isControlsDisabled}
              >
                <PlusIcon />
              </button>
            </div>
          </div>
          <div className={styles.addToCartBtnWrapper}>
            <button
              className={`${styles.addToCartBtn} ${
                isControlsDisabled ? styles.addToCartBtnDisabled : ""
              } ${isAddingToCart ? styles.addToCartBtnInCart : ""}`}
              onClick={() => {
                if (isControlsDisabled) return;
                addToCart(selectedImageIndex);
              }}
              disabled={isControlsDisabled || isAddingToCart}
            >
              <BasketHeader />
              {isAddingToCart
                ? `Додано в кошик ${cartQuantity}`
                : "Додати в кошик"}
            </button>
            <button
              className={`${styles.favoriteBtn} ${
                isFavorite ? styles.favoriteActive : ""
              } ${isControlsDisabled ? styles.favoriteBtnDisabled : ""}`}
              onClick={() => {
                if (isControlsDisabled) return;
                toggleFavorite();
              }}
              title="Додати в улюблені"
              disabled={isControlsDisabled}
            >
              {isFavorite ? <FavoriteBlacIcon /> : <Favorite2Icon />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
