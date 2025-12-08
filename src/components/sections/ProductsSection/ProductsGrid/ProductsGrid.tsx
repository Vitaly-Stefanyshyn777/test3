"use client";
import React, { useState, useEffect } from "react";
import styles from "./ProductsGrid.module.css";
import ProductCard from "../ProductCard/ProductCard";
import { normalizeImageUrl } from "@/lib/imageUtils";
import EmptyState from "@/components/ui/EmptyState";
// Видалено fetchProductCategoriesFromWp - використовуємо категорії з продуктів

interface Product {
  id: number;
  slug?: string; // Slug продукту
  name: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  sku?: string; // Код товару (SKU)
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ name: string; options: string[] }>;
  on_sale?: boolean;
  featured?: boolean;
  stock_status?: string;
  date?: string; // Дата створення з WordPress API
  date_created?: string; // Дата створення з WooCommerce v3 API
  average_rating?: string;
  review_count?: number;
  is_purchasable?: boolean;
}

interface ProductsGridProps {
  products: Product[];
  isNoCertificationFilter?: boolean; // Чи застосований фільтр "Немає сертифікації"
  selectedCertificationFilter?: string; // Вибраний фільтр сертифікації (78, 79, або undefined)
}

export default function ProductsGrid({
  products,
  isNoCertificationFilter = false,
  selectedCertificationFilter,
}: ProductsGridProps) {
  // Видалено невикористовувані змінні storeProducts
  const [productCategories, setProductCategories] = useState<
    Record<number, Array<{ id: number; name: string; slug: string }>>
  >({});
  const [noCertificationProducts, setNoCertificationProducts] = useState<
    Product[]
  >([]);

  // Спрощена логіка без складних API запитів

  // Використовуємо категорії, які вже є в продуктах (спрощено)
  useEffect(() => {
    const categoriesMap = products.reduce((acc, product) => {
      acc[product.id] = product.categories || [];
      return acc;
    }, {} as Record<number, Array<{ id: number; name: string; slug: string }>>);

    setProductCategories(categoriesMap);
  }, [products]);

  // Отримуємо товари з категорією "Немає сертифікації" (ID: 78) через WooCommerce v3 API
  // Тільки якщо НЕ вибрано фільтр "Є сертифікат" (79)
  useEffect(() => {
    const fetchNoCertificationProducts = async () => {
      try {
        const response = await fetch(
          "/api/wc/v3/products?category=78&per_page=20"
        );
        if (response.ok) {
          const data = await response.json();
          setNoCertificationProducts(data);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    // Не завантажуємо продукти з категорії 78, якщо вибрано фільтр "Є сертифікат" (79)
    if (selectedCertificationFilter === "79") {
      setNoCertificationProducts([]);
      return;
    }

    // Якщо вибрано фільтр "Немає сертифікації" (78) або не вибрано жодного фільтра, завантажуємо продукти
    if (selectedCertificationFilter === "78" || !selectedCertificationFilter) {
      fetchNoCertificationProducts();
    }
  }, [selectedCertificationFilter]);

  if (products.length === 0) {
    return <EmptyState variant="products" />;
  }

  // Об'єднуємо товари: спочатку основні, потім товари без сертифікації внизу
  // Фільтруємо дублікати за ID
  const existingIds = new Set(products.map((p) => p.id));
  const uniqueNoCertProducts = noCertificationProducts.filter(
    (p) => !existingIds.has(p.id)
  );

  // Сортуємо продукти: спочатку з сертифікацією, потім без сертифікації
  const allProducts = [...products, ...uniqueNoCertProducts].sort((a, b) => {
    // Перевіряємо, чи належить продукт до категорії "Немає сертифікації" (78)
    const aIsNoCert = a.categories?.some((cat) => cat.id === 78);
    const bIsNoCert = b.categories?.some((cat) => cat.id === 78);

    // Продукти без сертифікації йдуть вниз
    if (aIsNoCert && !bIsNoCert) return 1;
    if (!aIsNoCert && bIsNoCert) return -1;
    return 0;
  });


  return (
    <div className={styles.productsGrid}>
      {allProducts.map((p, index) => {
        const id = String(p.id);
        const priceNum = Number(p.price) || 0;
        const original = p.regular_price ? Number(p.regular_price) : undefined;
        
        // Нормалізуємо image: обробляємо випадок, коли src може бути рядком-масивом
        const image = normalizeImageUrl(p.images?.[0]?.src);
        
        const storeProduct = undefined; // Спрощено

        // тихий режим — без логів

        // Лог для перевірки новинок
        if (p.date_created) {
          const createdDate = new Date(p.date_created);
          const today = new Date();
          const daysDiff = Math.floor(
            (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          // без додаткових логів та без використання isNew
        }

        return (
          <ProductCard
            key={`${p.id}-${index}`}
            id={id}
            slug={p.slug}
            name={p.name}
            price={priceNum}
            originalPrice={original}
            image={image}
            sku={p.sku}
            categories={productCategories[p.id] || p.categories}
            dateCreated={p.date_created}
            wcProduct={storeProduct}
            allProducts={products.map(() => ({ total_sales: 0 }))}
            isNoCertificationFilter={isNoCertificationFilter}
          />
        );
      })}
    </div>
  );
}
