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
import ProductPageSkeleton from "./ProductPageSkeleton";

export default function ProductPage({ productSlug }: { productSlug: string }) {
  // productSlug може бути як slug так і ID для сумісності
  const { data: product, isLoading, isError } = useProductQuery(productSlug);
  // Товари для спорту (категорія 30)
  const { data: relatedCategoryProducts = [] } = useProductsByCategory("30");

  // Визначаємо категорію FAQ на основі категорій продукту
  const getFaqCategoryId = (): number | undefined => {
    if (!product?.categories || product.categories.length === 0) {
      return undefined; // Використаємо автоматичне визначення в FAQSection
    }

    // Перевіряємо категорії продукту
    // Якщо продукт належить до категорії "Борди" або інших категорій продуктів - використовуємо 70
    // Можна додати інші маппінги за потреби
    const productCategorySlugs = product.categories.map((cat) =>
      cat.slug.toLowerCase()
    );

    // Якщо є категорія, пов'язана з продуктами/бордами
    if (
      productCategorySlugs.some(
        (slug) =>
          slug.includes("board") ||
          slug.includes("борд") ||
          slug.includes("product") ||
          slug.includes("товар")
      )
    ) {
      return 70; // Борди
    }

    // За замовчуванням для продуктів використовуємо категорію "Борди"
    return 70;
  };

  const faqCategoryId = getFaqCategoryId();

  const baseItemsPerView = 5;
  const [slideIdx, setSlideIdx] = useState(0);

  const [selectedSize, setSelectedSize] = useState("Big");
  const [quantity, setQuantity] = useState(1);
  const isFavorite = useFavoriteStore(selectIsFavorite(product?.id || ""));
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);
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
  const isControlsDisabled = !isLoggedIn;
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

  // Функція для розрахунку знижки
  const calculateDiscount = () => {
    if (!product.regularPrice || !product.price) return 0;
    const regularPrice = parseFloat(product.regularPrice.toString());
    const salePrice = parseFloat(product.price.toString());
    if (regularPrice <= salePrice) return 0;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  const discountPercentage = calculateDiscount();
  const hasDiscount = discountPercentage > 0;

  const sizes = ["Standart", "Medium", "Big"];

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addToCart = () => {
    if (!product) return;
    const parsedPrice = (() => {
      const raw = product.price ?? 0;
      const num = parseFloat(raw.toString());
      return Number.isFinite(num) && !Number.isNaN(num) ? num : 0;
    })();
    const parsedOriginalPrice = (() => {
      if (!product.regularPrice) return undefined;
      const num = parseFloat(product.regularPrice.toString());
      return Number.isFinite(num) && !Number.isNaN(num) ? num : undefined;
    })();
    const previewImage =
      normalizeImageUrl(product.images?.[selectedImageIndex]?.src) ||
      normalizeImageUrl(product.images?.[0]?.src) ||
      normalizeImageUrl(product.image);

    addItem(
      {
        id: product.id?.toString() || productSlug,
        name: product.name || "Товар без назви",
        price: parsedPrice,
        image: previewImage,
        originalPrice: parsedOriginalPrice,
        sku: product.sku,
      },
      quantity
    );
  };

  // const toggleFavorite = () => {
  //   setIsFavorite(!isFavorite);
  // };

  const isAvailable =
    typeof product.stockQuantity === "number"
      ? product.stockQuantity > 0
      : true;

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
    <div className={styles.productPage}>
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
              {hasDiscount && (
                <Badge
                  variant="discount"
                  text={`-${discountPercentage}%`}
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
              <div className={styles.categoryTag}>Борди</div>
              <div className={styles.titleWithBadges}>
                <h1 className={styles.productTitle}>{product.name}</h1>
                <div className={styles.productBadges}>
                  {isActuallyHit && <Badge variant="hit" />}
                </div>
              </div>
              <p className={styles.productText}>
                Комфортний килимок для пілатесу забезпечує зручність під час
                занять пілатесом та м&#39;якою гімнастикою.
              </p>
            </div>

            <div className={styles.productDescriptionBlock}>
              <div className={styles.colorSection}>
                <h3>Колір:</h3>
                <div className={styles.colorOptions}>
                  {product.images.map((img, index) => (
                    <button
                      key={`color-thumb-${index}`}
                      className={`${styles.colorImageOption} ${
                        selectedImageIndex === index ? styles.selected : ""
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
            </div>

            <div className={styles.currenInfoBlock}>
              <div className={styles.priceSection}>
                <div className={styles.currentPrice}>
                  {(() => {
                    const raw = product?.price ?? 0;
                    const num = parseFloat(raw.toString());
                    const safe =
                      Number.isFinite(num) && !Number.isNaN(num) ? num : 0;
                    return `${safe.toLocaleString()} ₴`;
                  })()}
                </div>
                {hasDiscount && product.regularPrice && (
                  <div className={styles.originalPrice}>
                    {(() => {
                      const raw = product?.regularPrice ?? 0;
                      const num = parseFloat(raw.toString());
                      const safe =
                        Number.isFinite(num) && !Number.isNaN(num) ? num : 0;
                      return `${safe.toLocaleString()} ₴`;
                    })()}
                  </div>
                )}
              </div>

              <div className={styles.subscriptionOffer}>
                <span className={styles.subscriptionIcon}>
                  <GiftIcon />
                </span>
                <span>
                  Оформіть підписку — отримайте знижки та доступ до ексклюзивних
                  функцій!
                </span>
              </div>

              {!isLoggedIn && (
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
              )}

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
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
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
                    }`}
                    onClick={() => {
                      if (isControlsDisabled) return;
                      addToCart();
                    }}
                    disabled={isControlsDisabled}
                  >
                    <BasketHeader />
                    Додати в кошик
                  </button>
                  <button
                    className={`${styles.favoriteBtn} ${
                      isFavorite ? styles.favoriteActive : ""
                    } ${isControlsDisabled ? styles.favoriteBtnDisabled : ""}`}
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

              <div className={styles.detailsRow}>
                <div className={styles.availability}>
                  <span className={styles.checkmark}>
                    {isAvailable ? <CheckMarkIcon /> : <CloseButtonIcon />}
                  </span>
                  <span className={styles.detailText}>
                    {isAvailable ? "В наявності" : "Немає в наявності"}
                  </span>
                </div>
                <div className={styles.productCode}>
                  <p className={styles.productText}>Код товару:</p>{" "}
                  {product.sku || product.id || "10001"}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.expandableSections}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionHeaderText}>Опис товару</span>
              </div>
              <div className={styles.sectionContent}>
                {product.description?.trim() ||
                product.shortDescription?.trim() ? (
                  <div
                    className={styles.sectionContentText}
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description?.trim() ||
                        product.shortDescription?.trim() ||
                        "",
                    }}
                  />
                ) : (
                  <p className={styles.sectionContentText}>
                    Поки що опис відсутній
                  </p>
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
                    expandedSections.delivery ? styles.rotated : ""
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
                    expandedSections.payment ? styles.rotated : ""
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
                    expandedSections.return ? styles.rotated : ""
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
                    expandedSections.characteristics ? styles.rotated : ""
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
              isFluid
            />
          ))}
        </div>
        <SliderNav
          activeIndex={slideIdx}
          dots={totalSlides}
          onPrev={onPrev}
          onNext={onNext}
          onDotClick={(i) => setSlideIdx(i)}
        />
      </div>

      {!isLoggedIn && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}
    </div>
  );
}
