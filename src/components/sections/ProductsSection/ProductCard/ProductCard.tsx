"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";
import FavoriteButton from "@/components/ui/Buttons/FavoriteButton";
import CartButton from "@/components/ui/Buttons/CartButton";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import SubscriptionBadge from "@/components/ui/SubscriptionBadge/SubscriptionBadge";
import { useAuthStore } from "@/store/auth";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import { normalizeImageUrl } from "@/lib/imageUtils";
import {
  calculatePrice,
  formatPrice as formatPriceUtil,
  getPriceSellRegistry,
  normalizePriceParams,
} from "@/lib/priceUtils";

interface ProductCardProps {
  id: string;
  slug?: string;
  name: string;
  productType?: string;
  variations?: number[];
  color?: string;
  size?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
  isHit?: boolean;
  image?: string | string[] | Array<{ src: string }>;
  category?: string;
  categories?: Array<{ id: number; name: string; slug: string }>;
  stockStatus?: string;
  stockQuantity?: number | null;
  dateCreated?: string;
  sku?: string;
  wcProduct?: {
    id: number;
    name: string;
    type: string;
    variations: number[];
    average_rating: string;
    rating_count: number;
    total_sales: number;
    featured: boolean;
    on_sale: boolean;
    price: string;
    regular_price: string;
    sale_price: string;
    images: Array<{ src: string; alt: string }>;
    sku?: string;
    meta_data?: Array<{ key: string; value: string }>;
  };
  metaData?: Array<{ key: string; value: string }>;
  allProducts?: Array<{ total_sales?: number }>;
  isNoCertificationFilter?: boolean;
  isFluid?: boolean;
  useRedGreenIconOnMobile?: boolean;
  removeFromFavoritesOnAddToCart?: boolean;
}

const ProductCard = ({
  id,
  slug,
  name,
  productType,
  variations,
  color,
  size,
  price = 0,
  originalPrice,
  discount,
  isNew = false,
  isHit = false,
  image,
  categories,
  stockStatus,
  stockQuantity,
  dateCreated,
  sku,
  wcProduct,
  allProducts,
  metaData,
  isNoCertificationFilter = false,
  isFluid = false,
  useRedGreenIconOnMobile = false,
  removeFromFavoritesOnAddToCart = false,
}: ProductCardProps) => {
  const favorite = useFavoriteStore(selectIsFavorite(id));

  const effectiveProductType = productType ?? wcProduct?.type;
  const effectiveVariations = variations ?? wcProduct?.variations;

  const variantInfo = [
    color ? `Колір: ${color}` : null,
    size ? `Розмір: ${size}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const isNoCertificationProduct = categories?.some((cat) => cat.id === 78);

  const imageUrl = normalizeImageUrl(wcProduct?.images?.[0]?.src || image);

  const [imageError, setImageError] = React.useState(false);
  const handleImageError = () => {
    setImageError(true);
  };

  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const priceFromApi = price || 0;
  const originalPriceFromApi = originalPrice;
  const isPriceLoading = false;

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (!price || Number.isNaN(num) || !Number.isFinite(num)) return "0";
    return num.toLocaleString("uk-UA");
  };

  const calculateDiscount = (salePrice: string, regularPrice: string) => {
    if (!salePrice || !regularPrice || salePrice === regularPrice) return 0;
    return Math.round(
      ((parseFloat(regularPrice) - parseFloat(salePrice)) /
        parseFloat(regularPrice)) *
        100
    );
  };

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Використовуємо уніфіковану функцію для нормалізації цін
  const normalizedPrices = normalizePriceParams({
    wcProduct,
    price,
    originalPrice,
  });

  const priceSellRegistry = getPriceSellRegistry({
    metaData,
    meta_data: wcProduct?.meta_data,
    wcProduct: wcProduct ? { meta_data: wcProduct.meta_data } : undefined,
  });

  const priceCalculation = calculatePrice({
    price: normalizedPrices.price,
    regularPrice: normalizedPrices.regularPrice,
    salePrice: normalizedPrices.salePrice,
    isLoggedIn,
    priceSellRegistry,
  });

  const {
    finalPrice,
    originalPrice: calculatedOriginalPrice,
    totalDiscount,
    shouldShowOldPrice,
  } = priceCalculation;

  const formattedFinalPrice = Number.isFinite(finalPrice)
    ? formatPriceUtil(finalPrice)
    : "0";
  const formattedRegularPrice =
    calculatedOriginalPrice > 0
      ? formatPriceUtil(calculatedOriginalPrice)
      : normalizedPrices.regularPrice && normalizedPrices.regularPrice > 0
      ? formatPriceUtil(normalizedPrices.regularPrice)
      : null;
  const formattedSalePrice =
    normalizedPrices.salePrice && normalizedPrices.salePrice > 0
      ? formatPriceUtil(normalizedPrices.salePrice)
      : null;
  const formattedCurrentPrice =
    normalizedPrices.price && normalizedPrices.price > 0
      ? formatPriceUtil(normalizedPrices.price)
      : null;

  const showDiscount = totalDiscount > 0;

  const actualDiscountPercent = priceSellRegistry
    ? (typeof priceSellRegistry === "string"
        ? parseFloat(priceSellRegistry)
        : priceSellRegistry) || 0
    : 0;

  const subscriptionPrice = isLoggedIn ? finalPrice : null;

  const formatPriceFallback = (priceValue: number) => {
    return priceValue ? priceValue.toLocaleString() : "0";
  };

  const isNewProduct = (dateCreated?: string) => {
    if (!dateCreated) return false;
    const createdDate = new Date(dateCreated);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  };

  const isActuallyNew = isNewProduct(dateCreated) || isNew;

  const isHitProduct = (
    wcProduct?: {
      average_rating?: string;
      rating_count?: number;
      total_sales?: number;
      featured?: boolean;
      on_sale?: boolean;
    },
    allProducts?: Array<{
      total_sales?: number;
      average_rating?: string;
      rating_count?: number;
      featured?: boolean;
      on_sale?: boolean;
    }>
  ) => {
    if (!wcProduct || !allProducts || allProducts.length === 0) return false;

    const totalSales = parseInt(wcProduct.total_sales?.toString() || "0");
    const rating = parseFloat(wcProduct.average_rating?.toString() || "0");
    const ratingCount = parseInt(wcProduct.rating_count?.toString() || "0");
    const isFeatured = wcProduct.featured;
    const isOnSaleFlag = wcProduct.on_sale;

    if (totalSales === 0) return false;

    const minTopProducts = Math.max(3, Math.floor(allProducts.length * 0.2));
    const salesValues = allProducts
      .map((p) => parseInt(p.total_sales?.toString() || "0"))
      .filter((sales) => sales > 0)
      .sort((a, b) => b - a)
      .slice(0, minTopProducts);

    const topSalesThreshold =
      salesValues.length > 0 ? Math.min(...salesValues) : 0;
    const currentProductSales = totalSales;

    const topRatingProducts = allProducts.filter((p) => {
      const prodRating = parseFloat(p.average_rating?.toString() || "0");
      const prodRatingCount = parseInt(p.rating_count?.toString() || "0");
      return prodRating >= 4.0 && prodRatingCount >= 5;
    });

    const isTopBySales =
      currentProductSales >= topSalesThreshold && salesValues.length > 0;

    const isTopByRating = rating >= 4.0 && ratingCount >= 5;

    const isFeaturedHit = isFeatured && rating >= 3.5;

    const isSaleHit = isOnSaleFlag && (totalSales >= 10 || rating >= 3.5);

    const isHitResult =
      isTopBySales || isTopByRating || isFeaturedHit || isSaleHit || isHit;

    return isHitResult;
  };

  const isActuallyHit = isHitProduct(wcProduct, allProducts);

  const hasNoCertification = categories?.some((cat) => cat.id === 78);

  const shouldShowDisabledButton =
    hasNoCertification || isNoCertificationFilter;

  const getHref = () => {
    if (slug && slug.trim() !== "" && !/^\d+$/.test(slug)) {
      if (slug.startsWith("/")) {
        return slug;
      }

      let processedSlug = slug;
      if (slug.includes("%")) {
        try {
          processedSlug = decodeURIComponent(slug);
        } catch {
          processedSlug = slug;
        }
      }

      if (processedSlug.trim() !== "" && !/^\d+$/.test(processedSlug)) {
        return `/products/${processedSlug}`;
      }
    }

    return `/products/${id}`;
  };

  const isOutOfStock = stockStatus === "outofstock";

  return (
    <Link
      href={getHref()}
      className={`${styles.productCard} ${
        isFluid ? styles.productCardFluid : ""
      } ${isOutOfStock ? styles.productCardOutOfStock : ""}`}
      data-category={hasNoCertification ? "78" : undefined}
      data-outofstock={isOutOfStock ? "true" : undefined}
    >
      <div className={styles.cardImage}>
        <Image
          src={imageError ? "/placeholder.svg" : imageUrl}
          alt={name || "Товар без назви"}
          width={280}
          height={280}
          className={styles.productImage}
          onError={handleImageError}
        />

        <BadgeContainer>
          {isActuallyNew && <Badge variant="new" />}
          {totalDiscount > 0 && (
            <Badge variant="discount" text={`-${Math.round(totalDiscount)}%`} />
          )}
          {isActuallyHit && <Badge variant="hit" />}
        </BadgeContainer>

        <FavoriteButton
          id={id}
          slug={slug}
          name={name}
          price={price || 0}
          originalPrice={normalizedPrices.regularPrice || originalPrice}
          image={imageUrl}
          metaData={metaData}
          className={styles.favoriteBtn}
          activeClassName={styles.favoriteActive}
          useRedGreenIconOnMobile={useRedGreenIconOnMobile}
          productType={effectiveProductType}
          variations={effectiveVariations}
          wcProduct={
            wcProduct
              ? {
                  prices: {
                    price:
                      wcProduct.price || String(normalizedPrices.price) || "0",
                    regular_price:
                      wcProduct.regular_price ||
                      (normalizedPrices.regularPrice
                        ? String(normalizedPrices.regularPrice)
                        : "0"),
                    sale_price:
                      wcProduct.sale_price ||
                      (normalizedPrices.salePrice
                        ? String(normalizedPrices.salePrice)
                        : "0"),
                  },
                  on_sale: wcProduct.on_sale,
                }
              : undefined
          }
        />
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.productName}>{name || "Товар без назви"}</h3>
        {variantInfo ? (
          <div className={styles.variantInfo}>{variantInfo}</div>
        ) : null}
        <div className={styles.subscriptionBlock}>
          <div className={styles.subscriptionPrice}>
            {!isLoggedIn && actualDiscountPercent > 0 && (
              <div className={styles.subscriptionDiscount}>
                <SubscriptionBadge>
                  -{Math.round(actualDiscountPercent)}% з підпискою
                </SubscriptionBadge>
              </div>
            )}

            <div className={styles.pricing}>
              {isPriceLoading ? (
                <>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonPrice}`}
                  ></div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonOriginalPrice}`}
                  ></div>
                </>
              ) : isLoggedIn ? (
                <>
                  <span className={styles.currentPrice}>
                    <span className={styles.currentPriceValue}>
                      {formattedFinalPrice}
                    </span>
                  </span>
                  {shouldShowOldPrice && formattedRegularPrice && (
                    <span className={styles.originalPrice}>
                      <span className={styles.originalPriceValue}>
                        {formattedRegularPrice}
                      </span>
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className={styles.currentPrice}>
                    <span className={styles.currentPriceValue}>
                      {formattedCurrentPrice || formattedFinalPrice}
                    </span>
                  </span>
                  {formattedRegularPrice &&
                    totalDiscount > 0 &&
                    formattedCurrentPrice !== formattedRegularPrice && (
                      <span className={styles.originalPrice}>
                        <span className={styles.originalPriceValue}>
                          {formattedRegularPrice}
                        </span>
                      </span>
                    )}
                </>
              )}
            </div>
          </div>
          <CartButton
            id={id}
            name={name}
            slug={slug}
            productType={effectiveProductType}
            variations={effectiveVariations}
            price={
              normalizedPrices.salePrice ||
              normalizedPrices.price ||
              normalizedPrices.regularPrice ||
              price ||
              0
            }
            originalPrice={
              normalizedPrices.regularPrice && normalizedPrices.regularPrice > 0
                ? normalizedPrices.regularPrice
                : originalPrice
            }
            regularPrice={
              normalizedPrices.regularPrice && normalizedPrices.regularPrice > 0
                ? normalizedPrices.regularPrice
                : undefined
            }
            salePrice={
              normalizedPrices.salePrice && normalizedPrices.salePrice > 0
                ? normalizedPrices.salePrice
                : undefined
            }
            image={imageUrl}
            metaData={metaData}
            removeFromFavoritesOnAddToCart={removeFromFavoritesOnAddToCart}
            requireAuth={false}
            className={`${styles.cartBtn} ${
              isNoCertificationProduct ? styles.cartBtnNoCert : ""
            }`}
            activeClassName={styles.cartBtnActive}
          />
        </div>

        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>Немає в наявності</div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
