"use client";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import { calculatePrice, formatPrice } from "@/lib/priceUtils";
import { normalizeImageUrl } from "@/lib/imageUtils";
import type { Product } from "@/lib/products";
import type { ProductVariation } from "../sections/ProductsSection/ProductPage/types";

export function useProductActions(
  product: Product | null,
  selectedVariation: ProductVariation | null,
  isLoggedIn: boolean
) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoriteStore(selectIsFavorite(
    selectedVariation ? selectedVariation.id.toString() : String(product?.id || "")
  ));
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);

  const addToCart = async (selectedImageIndex: number = 0) => {
    if (!product) return;

    setIsAddingToCart(true);

    // Розрахунок цін для кошика - передаємо базові ціни без знижки авторизації
    const basePrice = selectedVariation?.price || product.price || 0;
    const baseRegularPrice = selectedVariation?.regular_price || product.regularPrice;

    const parsedPrice = parseFloat(basePrice.toString());
    const parsedOriginalPrice = baseRegularPrice ? parseFloat(baseRegularPrice.toString()) : undefined;

    const previewImage =
      normalizeImageUrl(product.images?.[selectedImageIndex]?.src) ||
      normalizeImageUrl(product.images?.[0]?.src) ||
      "";

    // Витягуємо колір і розмір з варіації
    let selectedColor = "";
    let selectedSize = "";

    if (selectedVariation) {
      selectedVariation.attributes.forEach((attr: any) => {
        const attrName = attr.name.toLowerCase();
        if (attrName.includes("колір") || attrName.includes("color")) {
          selectedColor = attr.option;
        } else if (attrName.includes("розмір") || attrName.includes("size")) {
          selectedSize = attr.option;
        }
      });
    }

    // Створюємо назву товару - очищаємо від зайвих слів
    let productName = (product.name || "Товар без назви").replace(
      /\s*-\s*.*$/gi,
      ""
    ); // видаляємо все після тире з пробілом

    // Динамічно видаляємо вибрані розмір і колір з назви
    if (selectedSize) {
      productName = productName
        .replace(new RegExp(`,\\s*${selectedSize}`, "gi"), "")
        .replace(new RegExp(`\\s*-\\s*${selectedSize}`, "gi"), "")
        .replace(new RegExp(`\\s*${selectedSize}\\s*$`, "gi"), "");
    }
    if (selectedColor) {
      productName = productName
        .replace(new RegExp(`,\\s*${selectedColor}`, "gi"), "")
        .replace(new RegExp(`\\s*-\\s*${selectedColor}`, "gi"), "")
        .replace(new RegExp(`\\s*${selectedColor}\\s*$`, "gi"), "");
    }

    productName = productName.trim(); // видаляємо зайві пробіли

    try {
      await addItem(
        {
          id:
            selectedVariation?.id.toString() ||
            product.id?.toString() ||
            "unknown",
          name: productName,
          price: parsedPrice,
          image: previewImage,
          color: selectedColor,
          size: selectedSize,
          originalPrice: parsedOriginalPrice,
          regularPrice: selectedVariation?.regular_price || product.regularPrice ? parseFloat((selectedVariation?.regular_price || product.regularPrice).toString()) : undefined,
          salePrice: selectedVariation?.price || product.price ? parseFloat((selectedVariation?.price || product.price).toString()) : undefined,
          sku: product.sku,
          stockQuantity: product.stockQuantity,
          variationId: selectedVariation?.id,
        },
        quantity
      );
    } catch (error) {
      alert((error as Error).message);
      throw error;
    } finally {
      // Показуємо повідомлення кілька секунд, потім повертаємося до звичайного стану
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1500);
    }
  };

  const toggleFavorite = () => {
    if (!product?.id || !product?.name) return;

    // Використовуємо дані варіації, якщо вона вибрана
    const favoriteItem = {
      id: selectedVariation ? selectedVariation.id.toString() : product.id.toString(),
      name: product.name,
      price: parseFloat(String(selectedVariation?.price || product.price || 0)) || undefined,
      originalPrice: parseFloat(String(selectedVariation?.regular_price || product.regularPrice || 0)) || undefined,
      image: normalizeImageUrl(product.images?.[0]?.src),
      variationId: selectedVariation?.id,
      color: undefined, // спростимо, колір можна додати пізніше якщо потрібно
      size: undefined, // спростимо, розмір можна додати пізніше якщо потрібно
      stockQuantity: product.stockQuantity,
    };

    toggleFav(favoriteItem);
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const resetQuantity = () => setQuantity(1);

  return {
    quantity,
    isAddingToCart,
    isFavorite,
    setQuantity,
    addToCart,
    toggleFavorite,
    incrementQuantity,
    decrementQuantity,
    resetQuantity,
  };
}
