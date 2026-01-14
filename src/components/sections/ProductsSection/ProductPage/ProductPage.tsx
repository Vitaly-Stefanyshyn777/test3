"use client";
import React, { useEffect, useRef, useState } from "react";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import Image from "next/image";
import { useProductQuery } from "@/components/hooks/useProductsQuery";
import { useProductsByCategory } from "@/components/hooks/useFilteredProducts";
import ProductCard from "@/components/sections/ProductsSection/ProductCard/ProductCard";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import {
  Favorite2Icon,
  FavoriteBlacIcon,
  BasketHeader,
  MinuswIcon,
  PlusIcon,
  CheckMarkIcon,
  CloseButtonIcon,
  СhevronIcon,
  GiftIcon,
} from "@/components/Icons/Icons";
import styles from "./ProductPage.module.css";
import FAQSection from "../../FAQSection/FAQSection";
import { useAuthStore } from "@/store/auth";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import { normalizeImageUrl } from "@/lib/imageUtils";
import { useCartStore } from "@/store/cart";
import { calculatePrice, formatPrice } from "@/lib/priceUtils";
import ProductPageSkeleton from "./ProductPageSkeleton";

export default function ProductPage({ productSlug }: { productSlug: string }) {
  // productSlug може бути як slug так і ID для сумісності
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProductQuery(productSlug);
  // Товари для спорту (категорія 30)
  const { data: relatedCategoryProducts = [] } = useProductsByCategory("30");

  // Визначаємо категорію FAQ на основі категорій продукту
  const getFaqCategoryId = (): number | undefined => {
    if (!product?.categories || product.categories.length === 0) {
      return undefined; // Використаємо автоматичне визначення в FAQSection
    }

    // Якщо продукт належить до категорії "Борди" - використовуємо 70
    if (
      product.categories.some(
        (cat) =>
          cat.id === 71 || // Категорія "Борди" за ID
          cat.id === 30 || // Інша категорія бордів за ID
          cat.slug.toLowerCase().includes("board") || // Slug містить "board"
          cat.slug.toLowerCase().includes("борд") // Slug містить "борд"
      )
    ) {
      return 70; // Борди
    }

    // За замовчуванням для продуктів використовуємо категорію "Борди"
    return 70;
  };

  const faqCategoryId = getFaqCategoryId();

  // Перевіряємо, чи товар відноситься до бордів (за ID або slug)
  const isBoardProduct = (): boolean => {
    if (!product?.categories || product.categories.length === 0) {
      return false;
    }

    return product.categories.some(
      (cat) =>
        cat.id === 71 || // Категорія "Борди" за ID
        cat.id === 30 || // Інша категорія бордів за ID
        cat.slug.toLowerCase().includes("board") || // Slug містить "board"
        cat.slug.toLowerCase().includes("борд") // Slug містить "борд"
    );
  };

  const baseItemsPerView = 5;
  const [slideIdx, setSlideIdx] = useState(0);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [variationsData, setVariationsData] = useState<
    Array<{
      id: number;
      price: string;
      regular_price: string;
      sale_price: string;
      attributes: Array<{
        id: number;
        name: string;
        slug: string;
        option: string;
      }>;
    }>
  >([]);
  const [variationsLoading, setVariationsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<{
    id: number;
    price: string;
    regular_price: string;
    sale_price: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isFavorite = useFavoriteStore(selectIsFavorite(product?.id || ""));
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const productId = product?.id?.toString() || productSlug;
  const isInCart = !!cartItems[productId] && cartItems[productId].quantity > 0;
  const cartQuantity = cartItems[productId]?.quantity || 0;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const imagesLength = product?.images?.length ?? 0;
  const maxVisibleThumbs = 7;
  const [thumbStart, setThumbStart] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const itemsPerView = isMobile ? 4 : baseItemsPerView;
  const thumbNavThreshold = isMobile ?? false ? 4 : maxVisibleThumbs;
  const shouldShowThumbNav = imagesLength > thumbNavThreshold;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Оптимізація: завантажуємо варіації лише коли продукт має варіації
  useEffect(() => {
    const loadVariations = async () => {
      if (!product?.wcProduct?.variations?.length) {
        setVariationsLoading(false);
        return;
      }

      // Завантажуємо варіації лише якщо вони дійсно потрібні
      setVariationsLoading(true);

      try {
        // Завантажуємо лише перші 10 варіацій для оптимізації
        const variations = await Promise.all(
          product.wcProduct.variations
            .slice(0, 10)
            .map(async (variationId: number) => {
              const response = await fetch(
                `/api/wc/v3/products/${product.id}/variations/${variationId}`
              );
              if (!response.ok) return null;
              return response.json();
            })
        );

        const validVariations = variations.filter(Boolean);
        setVariationsData(validVariations);

        // Знаходимо варіацію за замовчуванням - першу доступну
        // (логіка вибору буде оброблена окремим useEffect)
        const defaultVariation = validVariations[0];

        if (defaultVariation) {
          setSelectedVariation({
            id: defaultVariation.id,
            price: defaultVariation.price,
            regular_price: defaultVariation.regular_price,
            sale_price: defaultVariation.sale_price,
          });
        }
      } catch (error) {
        console.warn("Не вдалося завантажити варіації продукту:", error);
      } finally {
        setVariationsLoading(false);
      }
    };

    if (product) {
      loadVariations();
    }
  }, [product]); // Завантажуємо варіації лише при зміні продукту

  // Спрощена логіка вибору варіації - шукаємо точну комбінацію або першу доступну
  useEffect(() => {
    if (!variationsData.length) return;

    // Знаходимо варіацію за точною комбінацією розмір + колір
    // Якщо комбінація не знайдена або не вибрана, беремо першу доступну варіацію
    const matchingVariation =
      variationsData.find((v) => {
        if (selectedSize && selectedColor) {
          // Шукаємо точну комбінацію
          return (
            v.attributes?.some(
              (attr: any) =>
                attr.slug === "pa_size" && attr.option === selectedSize
            ) &&
            v.attributes?.some(
              (attr: any) =>
                attr.slug === "pa_color" && attr.option === selectedColor
            )
          );
        }
        return false; // Якщо не вибрано повну комбінацію, не шукаємо
      }) || variationsData[0]; // За замовчуванням перша варіація

    if (matchingVariation) {
      setSelectedVariation({
        id: matchingVariation.id,
        price: matchingVariation.price,
        regular_price: matchingVariation.regular_price,
        sale_price: matchingVariation.sale_price,
      });
    }
  }, [selectedSize, selectedColor, variationsData]);

  useEffect(() => {
    setSlideIdx(0);
  }, [isMobile]);
  const onThumbPrev = () => {
    if (!imagesLength) return;
    if (isMobile && thumbsRef.current) {
      // На мобільному прокручуємо мініатюри
      const thumbButtons = Array.from(
        thumbsRef.current.querySelectorAll("button")
      ).filter((btn) => btn.querySelector("img") !== null) as HTMLElement[];
      if (thumbButtons.length > 0) {
        const scrollAmount = thumbButtons[0].offsetWidth + 8; // thumbnail width + gap
        thumbsRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      setSelectedImageIndex((idx) => (idx - 1 + imagesLength) % imagesLength);
      if (imagesLength > maxVisibleThumbs) {
        setThumbStart((s) => (s - 1 + imagesLength) % imagesLength);
      }
    }
  };
  const onThumbNext = () => {
    if (!imagesLength) return;
    if (isMobile && thumbsRef.current) {
      // На мобільному прокручуємо мініатюри
      const thumbButtons = Array.from(
        thumbsRef.current.querySelectorAll("button")
      ).filter((btn) => btn.querySelector("img") !== null) as HTMLElement[];
      if (thumbButtons.length > 0) {
        const scrollAmount = thumbButtons[0].offsetWidth + 8; // thumbnail width + gap
        thumbsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      setSelectedImageIndex((idx) => (idx + 1) % imagesLength);
      if (imagesLength > maxVisibleThumbs) {
        setThumbStart((s) => (s + 1) % imagesLength);
      }
    }
  };

  // Тримати вибране у видимому вікні коли >= 8 елементів
  useEffect(() => {
    if (imagesLength <= maxVisibleThumbs) return;
    const end = (thumbStart + maxVisibleThumbs - 1) % imagesLength;
    const inWindow = (() => {
      if (thumbStart <= end) {
        return selectedImageIndex >= thumbStart && selectedImageIndex <= end;
      }
      // wrap-around window
      return selectedImageIndex >= thumbStart || selectedImageIndex <= end;
    })();

    if (!inWindow) {
      // зсуваємо вікно так, щоб selected опинився останнім елементом
      setThumbStart(
        (selectedImageIndex - (maxVisibleThumbs - 1) + imagesLength) %
          imagesLength
      );
    }
  }, [selectedImageIndex, imagesLength, thumbStart]);
  type SectionKey =
    | "description"
    | "delivery"
    | "payment"
    | "return"
    | "characteristics";
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    description: false, // Закрита за замовчуванням
    delivery: false, // Закрита за замовчуванням
    payment: false, // Закрита за замовчуванням
    return: false, // Закрита за замовчуванням
    characteristics: false, // Закрита за замовчуванням
  });

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isOutOfStock = product?.stockStatus === "outofstock";
  const isControlsDisabled = isOutOfStock; // Продукти не вимагають авторизації
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  if (isLoading) return <ProductPageSkeleton />;
  if (isError || !product)
    return <div className={styles.error}>Товар не знайдено</div>;

  // Функція для розрахунку "Новинка" (30 днів – як у ProductCard)
  const isNewProduct = (dateCreated?: string) => {
    if (!dateCreated) {
      return false;
    }

    const createdDate = new Date(dateCreated);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  };

  // Функція для розрахунку "Хіт" на основі топ 10 продажів
  const isHitProduct = () => {
    if (!product || !relatedCategoryProducts) return false;

    // Отримуємо всі продукти з WooCommerce API
    const wcProducts = (
      relatedCategoryProducts as unknown as Array<Record<string, unknown>>
    ).filter((p) => (p as { total_sales?: unknown }).total_sales !== undefined);

    if (wcProducts.length === 0) return false;

    // Отримуємо всі значення продажів та сортуємо
    const salesValues = wcProducts
      .map((p) =>
        parseInt(
          (
            (p as { total_sales?: unknown }).total_sales as unknown as
              | string
              | number
              | undefined
          )?.toString() || "0"
        )
      )
      .filter((sales) => sales > 0)
      .sort((a, b) => b - a); // Сортуємо від більшого до меншого

    // Беремо топ 10 найбільших продажів
    const top10Sales = salesValues.slice(0, 10);

    // Перевіряємо чи поточний товар в топ 10
    const currentProductSales = parseInt(
      (product as unknown as { total_sales?: unknown }).total_sales
        ? (
            (product as unknown as { total_sales?: unknown })
              .total_sales as unknown as string | number
          ).toString()
        : "0"
    );
    return top10Sales.includes(currentProductSales);
  };

  // Визначаємо чи є продукт новинкою
  const isActuallyNew = isNewProduct(product.dateCreated);

  // Визначаємо чи є продукт хітом
  const isActuallyHit = isHitProduct();

  // Розрахунок цін з урахуванням авторизації та знижок
  const priceCalculation = calculatePrice({
    price: selectedVariation?.price || product?.price || 0,
    regularPrice: selectedVariation?.regular_price || product?.regularPrice,
    isLoggedIn,
  });

  const { finalPrice, originalPrice, totalDiscount, shouldShowOldPrice } =
    priceCalculation;
  const hasDiscount = totalDiscount > 0;

  // Отримуємо унікальні розміри та кольори з атрибутів продукту або варіацій
  // Спочатку пробуємо отримати з основних атрибутів продукту
  const productSizeAttribute = product.attributes?.find(
    (attr) => attr.slug === "pa_size"
  );
  const productSizes = productSizeAttribute?.options || [];

  // Якщо немає в основних атрибутах, отримуємо з варіацій
  const availableSizes =
    productSizes.length > 0
      ? productSizes
      : Array.from(
          new Set(
            variationsData
              .flatMap((v) => v.attributes || [])
              .filter((attr) => attr.slug === "pa_size")
              .map((attr) => attr.option)
          )
        );

  // Аналогічно для кольорів
  const productColorAttribute = product.attributes?.find(
    (attr) => attr.slug === "pa_color"
  );
  const productColors = productColorAttribute?.options || [];

  const availableColors =
    productColors.length > 0
      ? productColors
      : Array.from(
          new Set(
            variationsData
              .flatMap((v) => v.attributes || [])
              .filter((attr) => attr.slug === "pa_color")
              .map((attr) => attr.option)
          )
        );

  // Якщо немає динамічних розмірів, використовуємо порожній масив (не статичні розміри)
  const sizes = availableSizes.length > 0 ? availableSizes : [];

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    // Базові ціни з варіації або продукту (без знижки авторизації)
    const basePrice = selectedVariation?.price || product.price || 0;
    const baseRegularPrice =
      selectedVariation?.regular_price || product.regularPrice;
    const baseSalePrice = selectedVariation?.sale_price || product.salePrice;

    // Базова ціна для кошика - використовуємо sale_price якщо є, інакше price
    // Це та ціна, яка буде відображатися як основна
    const priceToUse =
      baseSalePrice && parseFloat(baseSalePrice) > 0
        ? parseFloat(baseSalePrice)
        : parseFloat(basePrice.toString());
    const previewImage =
      normalizeImageUrl(product.images?.[selectedImageIndex]?.src) ||
      normalizeImageUrl(product.images?.[0]?.src) ||
      normalizeImageUrl(product.image);

    // Витягуємо колір і розмір з варіації
    let selectedColor = "";
    let selectedSize = "";

    if (selectedVariation && variationsData.length > 0) {
      const variation = variationsData.find(
        (v) => v.id === selectedVariation.id
      );
      if (variation?.attributes) {
        variation.attributes.forEach((attr) => {
          const attrName = attr.name.toLowerCase();
          if (attrName.includes("колір") || attrName.includes("color")) {
            selectedColor = attr.option;
          } else if (attrName.includes("розмір") || attrName.includes("size")) {
            selectedSize = attr.option;
          }
        });
      }
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

    productName = productName.trim();

    try {
      await addItem(
        {
          id:
            selectedVariation?.id.toString() ||
            product.id?.toString() ||
            productSlug,
          name: productName,
          price: priceToUse,
          image: previewImage,
          color: selectedColor,
          size: selectedSize,
          originalPrice: baseRegularPrice
            ? parseFloat(baseRegularPrice)
            : undefined,
          regularPrice: baseRegularPrice
            ? parseFloat(baseRegularPrice)
            : undefined,
          salePrice: baseSalePrice ? parseFloat(baseSalePrice) : undefined,
          sku: product.sku,
          stockQuantity: product.stockQuantity,
          variationId: selectedVariation?.id,
        },
        quantity
      );
    } catch (error) {
      alert((error as Error).message);
      return;
    }

    // Показуємо повідомлення кілька секунд, потім повертаємося до звичайного стану
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1500);
  };

  // const toggleFavorite = () => {
  //   setIsFavorite(!isFavorite);
  // };

  // Функція для визначення статусу наявності на основі stock_status
  const getStockStatusText = (stockStatus: string): string => {
    switch (stockStatus) {
      case "instock":
        return "В наявності";
      case "outofstock":
        return "Немає в наявності";
      case "onbackorder":
        return "Під замовлення";
      default:
        return "В наявності";
    }
  };

  const isAvailable =
    typeof product.stockQuantity === "number"
      ? product.stockQuantity > 0
      : product.stockStatus !== "outofstock";

  const stockStatusText = getStockStatusText(product.stockStatus || "instock");

  type ProductLike = {
    id: number | string;
    slug?: string;
    name: string;
    price?: string | number;
    regular_price?: string | number;
    regularPrice?: string | number;
    on_sale?: boolean;
    onSale?: boolean;
    images?: Array<{ src: string }>;
    categories?: Array<{ name: string }>;
    stockStatus?: string;
    isNew?: boolean;
    isHit?: boolean;
  };

  const mappedRelated = Array.isArray(relatedCategoryProducts)
    ? (relatedCategoryProducts as ProductLike[]).slice(0, 12).map((p) => ({
        id: String(p.id),
        slug: p.slug,
        name: p.name,
        price: Number(p.price) || 0,
        originalPrice: Number(p.regular_price || p.regularPrice) || undefined,
        discount:
          p.on_sale || p.onSale
            ? Math.max(
                0,
                Math.round(
                  ((Number(p.regular_price || p.regularPrice) -
                    Number(p.price)) /
                    Number(p.regular_price || p.regularPrice)) *
                    100
                )
              )
            : 0,
        isNew: !!p.isNew,
        isHit: !!p.isHit,
        image: normalizeImageUrl(p.images?.[0]?.src),
        category: p.categories?.[0]?.name,
        stockStatus: p.stockStatus,
      }))
    : [];

  // Показуємо 5 карток, але перелистуємо по 1
  const totalSlides = Math.max(
    1,
    mappedRelated.length > itemsPerView
      ? mappedRelated.length - itemsPerView + 1
      : 1
  );
  const start = slideIdx; // стартове вікно зрушується на 1 елемент
  const visible = mappedRelated.slice(start, start + itemsPerView);
  const onPrev = () =>
    setSlideIdx((idx) => (idx - 1 + totalSlides) % totalSlides);
  const onNext = () => setSlideIdx((idx) => (idx + 1) % totalSlides);

  return (
    <div
      className={`${styles.productPage} ${
        isOutOfStock ? styles.productPageOutOfStock : ""
      }`}
    >
      <div className={styles.productContainer}>
        <div className={styles.imageSection}>
          <div
            className={`${styles.thumbnails} ${
              !shouldShowThumbNav ? styles.thumbnailsNoNav : ""
            }`}
            ref={thumbsRef}
          >
            {shouldShowThumbNav && (
              <button
                type="button"
                className={styles.thumbNavUp}
                onClick={onThumbPrev}
                aria-label="Попереднє зображення"
              >
                <СhevronIcon />
              </button>
            )}
            {(isMobile
              ? product.images.map((_, i) => i)
              : imagesLength > maxVisibleThumbs
              ? Array.from({ length: maxVisibleThumbs }).map(
                  (_, i) => (thumbStart + i) % imagesLength
                )
              : product.images.map((_, i) => i)
            ).map((globalIndex) => (
              <button
                key={`thumb-${globalIndex}`}
                className={`${styles.thumbnail} ${
                  selectedImageIndex === globalIndex ? styles.active : ""
                }`}
                onClick={() => setSelectedImageIndex(globalIndex)}
              >
                <Image
                  src={normalizeImageUrl(product.images[globalIndex]?.src)}
                  alt={product.images[globalIndex]?.alt || product.name}
                  width={80}
                  height={80}
                  className={styles.thumbnailImage}
                />
              </button>
            ))}
            {shouldShowThumbNav && (
              <button
                type="button"
                className={styles.thumbNavDown}
                onClick={onThumbNext}
                aria-label="Наступне зображення"
              >
                <span className={styles.downRotate}>
                  <СhevronIcon />
                </span>
              </button>
            )}
          </div>

          <div className={styles.mainImage}>
            <Image
              src={normalizeImageUrl(product.images[selectedImageIndex]?.src)}
              alt={product.name}
              width={500}
              height={500}
              className={styles.productImage}
            />
            {/* Маркери на зображенні */}
            <BadgeContainer className={styles.imageBadges}>
              {isActuallyNew && (
                <Badge variant="new" className={styles.imageBadge} />
              )}
              {totalDiscount > 0 && (
                <Badge
                  variant="discount"
                  text={`-${Math.round(totalDiscount)}%`}
                  className={styles.imageBadge}
                />
              )}
              {isActuallyHit && (
                <Badge variant="hit" className={styles.imageBadge} />
              )}
            </BadgeContainer>
          </div>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.productInfoBlock}>
            <div className={styles.categoryTagBlock}>
              <div className={styles.categoryTag}>
                {product.categories?.[0]?.name || "Без категорії"}
              </div>
              <div className={styles.titleWithBadges}>
                <h1 className={styles.productTitle}>{product.name}</h1>
                <div className={styles.productBadges}>
                  {isActuallyHit && <Badge variant="hit" />}
                </div>
              </div>
              {product.shortDescription?.trim() && (
                <p className={styles.productText}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: product.shortDescription.trim(),
                    }}
                  />
                </p>
              )}
            </div>

            {isMobile && (
              <div className={styles.detailsRow}>
                <div className={styles.availability}>
                  <span className={styles.checkmark}>
                    {isAvailable ? <CheckMarkIcon /> : <CloseButtonIcon />}
                  </span>
                  <span className={styles.detailText}>{stockStatusText}</span>
                </div>
                <div className={styles.productCode}>
                  <span>Код товару: </span>
                  {product.sku || product.id || ""}
                </div>
              </div>
            )}

            <div className={styles.productDescriptionBlock}>
              {/* Відображаємо секції тільки якщо продукт має варіації або відповідні атрибути */}
              {(product.wcProduct?.type === "variable" ||
                availableColors.length > 0 ||
                product.images.length > 1) &&
                (availableColors.length > 0 || product.images.length > 1) && (
                  <div className={styles.colorSection}>
                    <h3>Колір:</h3>
                    <div className={styles.colorOptions}>
                      {availableColors.length > 0
                        ? availableColors.map((color) => {
                            // Перевіряємо, чи це URL фото (починається з http)
                            const isImageUrl =
                              typeof color === "string" &&
                              color.startsWith("http");

                            if (isImageUrl) {
                              // Відображаємо як фото
                              return (
                                <button
                                  key={`color-${color}`}
                                  className={`${styles.colorImageOption} ${
                                    selectedColor === color
                                      ? styles.selected
                                      : ""
                                  }`}
                                  onClick={() => setSelectedColor(color)}
                                  title="Колір з фото"
                                >
                                  <Image
                                    src={color}
                                    alt="Колір варіації"
                                    width={80}
                                    height={80}
                                    className={styles.colorImage}
                                  />
                                </button>
                              );
                            } else {
                              // Відображаємо як текст
                              return (
                                <button
                                  key={`color-${color}`}
                                  className={`${styles.colorButton} ${
                                    selectedColor === color
                                      ? styles.selected
                                      : ""
                                  }`}
                                  onClick={() => setSelectedColor(color)}
                                  title={color}
                                >
                                  {color}
                                </button>
                              );
                            }
                          })
                        : product.images.map((img, index) => (
                            <button
                              key={`color-thumb-${index}`}
                              className={`${styles.colorImageOption} ${
                                selectedImageIndex === index
                                  ? styles.selected
                                  : ""
                              }`}
                              onClick={() => {
                                setSelectedImageIndex(index);
                              }}
                              title={img.alt || `Колір ${index + 1}`}
                            >
                              <Image
                                src={img.src}
                                alt={img.alt || "color option"}
                                width={80}
                                height={80}
                                className={styles.colorImage}
                              />
                            </button>
                          ))}
                    </div>
                  </div>
                )}

              {(product.wcProduct?.type === "variable" || sizes.length > 0) &&
                sizes.length > 0 && (
                  <div className={styles.sizeSection}>
                    <h3>Розмір:</h3>
                    <div className={styles.sizeOptions}>
                      {sizes.map((size) => (
                        <button
                          key={size}
                          className={`${styles.sizeButton} ${
                            selectedSize === size ? styles.selected : ""
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className={styles.currenInfoBlock}>
              <div className={styles.priceSection}>
                {variationsLoading ? (
                  <>
                    <div
                      className={`${styles.skeleton} ${styles.skeletonPrice}`}
                    ></div>
                    <div
                      className={`${styles.skeleton} ${styles.skeletonOriginalPrice}`}
                    ></div>
                  </>
                ) : (
                  <>
                    <div className={styles.currentPrice}>
                      {formatPrice(finalPrice)}
                    </div>
                    {shouldShowOldPrice && (
                      <div className={styles.originalPrice}>
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className={styles.mobileActionsWrapper}>
                <div className={styles.subscriptionOffer}>
                  <span className={styles.subscriptionIcon}>
                    <GiftIcon />
                  </span>
                  <span>
                    Оформіть підписку — отримайте знижки та доступ до
                    ексклюзивних функцій!
                  </span>
                </div>

                {isBoardProduct() && !isLoggedIn ? (
                  <div className={styles.registerCallout}>
                    <div
                      className={styles.registerBlock}
                      onClick={() => setIsRegisterOpen(true)}
                      style={{ cursor: "pointer" }}
                    >
                      <p className={styles.registerText}>
                        Зареєструйтесь, щоб придбати борд
                      </p>
                    </div>

                    <button
                      className={styles.registerBtn}
                      onClick={() => setIsRegisterOpen(true)}
                    >
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
                          onClick={() =>
                            !isControlsDisabled &&
                            setQuantity(Math.max(1, quantity - 1))
                          }
                          disabled={isControlsDisabled}
                        >
                          <MinuswIcon />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            !isControlsDisabled &&
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          min="1"
                          disabled={isControlsDisabled}
                        />
                        <button
                          onClick={() =>
                            !isControlsDisabled && setQuantity(quantity + 1)
                          }
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
                          addToCart();
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
                        } ${
                          isControlsDisabled ? styles.favoriteBtnDisabled : ""
                        }`}
                        onClick={() => {
                          if (isControlsDisabled) return;
                          toggleFav({
                            id: product?.id || "",
                            name: product?.name || "",
                            // price: product?.price || 0,
                            image: product?.image,
                          });
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
                    {product.sku || product.id || ""}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.expandableSections}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionHeaderText}>Опис товару</span>
              </div>
              <div className={styles.sectionContent}>
                {(product.description?.trim() ||
                  product.shortDescription?.trim()) && (
                  <div
                    className={styles.sectionContentText}
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description?.trim() ||
                        product.shortDescription?.trim() ||
                        "",
                    }}
                  />
                )}
              </div>
            </div>

            <div className={styles.section}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection("delivery")}
              >
                <span className={styles.sectionHeaderText}>Доставка</span>
                <span
                  className={`${styles.chevron} ${
                    expandedSections.delivery ? "" : styles.rotated
                  }`}
                >
                  <СhevronIcon />
                </span>
              </button>
              {expandedSections.delivery && (
                <div className={styles.sectionContent}>
                  <div className={styles.sectionContentText}>
                    <p className={styles.sectionContentTextOne}>
                      Нова пошта – доставка у відділення або кур’єром за 1–3
                      дні. <br />
                      Укрпошта - бюджетний варіант доставки, термін 2-5
                      <br />
                      Самовивіз (за наявності шоуруму) - уточнюйте локацію.{" "}
                      <br />
                    </p>
                    <p className={styles.sectionContentTextTwo}>
                      {" "}
                      Для уточнень звертайтесь в Instagram.{" "}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.section}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection("payment")}
              >
                <span className={styles.sectionHeaderText}>Оплата</span>
                <span
                  className={`${styles.chevron} ${
                    expandedSections.payment ? "" : styles.rotated
                  }`}
                >
                  <СhevronIcon />
                </span>
              </button>
              {expandedSections.payment && (
                <div className={styles.sectionContent}>
                  <p className={styles.sectionContentText}>
                    Онлайн-оплата – банківською карткою Visa/MasterCard. <br />{" "}
                    Оплата при отриманні (накладений платіж) – можливість огляду
                    перед покупкою. <br /> Оплата через Apple Pay / Google Pay –
                    швидко та зручно.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.section}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection("return")}
              >
                <span className={styles.sectionHeaderText}>
                  Обмін та повернення
                </span>
                <span
                  className={`${styles.chevron} ${
                    expandedSections.return ? "" : styles.rotated
                  }`}
                >
                  <СhevronIcon />
                </span>
              </button>
              {expandedSections.return && (
                <div className={styles.sectionContent}>
                  <p className={styles.sectionContentText}>
                    Обмін та повернення можливі протягом 14 днів відповідно до
                    Закону України «Про захист прав споживачів».
                  </p>
                  <p className={styles.sectionContentText}>
                    Товари без слідів носіння, зі збереженими бирками та в
                    оригінальній упаковці можна повернути. Доставка повернення -
                    за рахунок покупця, якщо товар не має браку.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.sectionCharacteristics}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection("characteristics")}
              >
                <span className={styles.sectionHeaderText}>Характеристики</span>
                <span
                  className={`${styles.chevron} ${
                    expandedSections.characteristics ? "" : styles.rotated
                  }`}
                >
                  <СhevronIcon />
                </span>
              </button>
              {expandedSections.characteristics && (
                <div className={styles.sectionContent}>
                  <div className={styles.sectionContentBlock}>
                    {(product.dimensions?.length?.trim() ||
                      product.dimensions?.width?.trim() ||
                      product.dimensions?.height?.trim() ||
                      product.weight?.trim()) && (
                      <>
                        <div className={styles.characteristicsTitle}>
                          Габарити та вага:
                        </div>
                        <div className={styles.characteristics}>
                          {product.dimensions?.length?.trim() && (
                            <div className={styles.characteristic}>
                              <span>Довжина:</span>
                              <span
                                style={{
                                  textAlign: "center",
                                  color: "#0e0e0e",
                                }}
                              >
                                {product.dimensions.length} см
                              </span>
                            </div>
                          )}
                          {product.dimensions?.width?.trim() && (
                            <div className={styles.characteristic}>
                              <span>Ширина:</span>
                              <span
                                style={{
                                  textAlign: "center",
                                  color: "#0e0e0e",
                                }}
                              >
                                {product.dimensions.width} см
                              </span>
                            </div>
                          )}
                          {product.dimensions?.height?.trim() && (
                            <div className={styles.characteristic}>
                              <span>Висота:</span>
                              <span
                                style={{
                                  textAlign: "center",
                                  color: "#0e0e0e",
                                }}
                              >
                                {product.dimensions.height} см
                              </span>
                            </div>
                          )}
                          {product.weight?.trim() && (
                            <div className={styles.characteristic}>
                              <span>Вага:</span>
                              <span
                                style={{
                                  textAlign: "center",
                                  color: "#0e0e0e",
                                }}
                              >
                                {product.weight} кг
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FAQSection categoryId={faqCategoryId} />
      <div className={styles.relatedProducts}>
        <div className={styles.relatedProductsHeader}>
          <p className={styles.relatedProductsSubtitle}>Інвентар</p>
          <h2>З цим товаром купують</h2>
        </div>
        <div className={styles.relatedGrid}>
          {visible.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              name={item.name}
              price={item.price}
              originalPrice={item.originalPrice}
              discount={item.discount}
              isNew={item.isNew}
              isHit={item.isHit}
              image={item.image}
              category={item.category}
              stockStatus={item.stockStatus}
              isFluid
            />
          ))}
        </div>
        {mappedRelated.length > 5 && (
          <SliderNav
            activeIndex={slideIdx}
            dots={totalSlides}
            onPrev={onPrev}
            onNext={onNext}
            onDotClick={(i) => setSlideIdx(i)}
          />
        )}
      </div>

      {!isLoggedIn && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}

      {/* Overlay для товарів, яких немає в наявності */}
      {isOutOfStock && (
        <div className={styles.outOfStockOverlay}>Немає в наявності</div>
      )}
    </div>
  );
}
