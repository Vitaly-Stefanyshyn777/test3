"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Check3Icon,
  GiftIcon,
  FavoriteHeader,
  Favorite2Icon,
  FavoriteBlacIcon,
  CheckMarkIcon,
  СalendarIcon,
  СlockIcon,
  GlobeIcon,
  NotGlobeIcon,
} from "@/components/Icons/Icons";
import { useFavoriteStore } from "@/store/favorites";
import { useAuthStore } from "@/store/auth";
import TrenersModal from "@/components/auth/TrenersModal/TrenersModal";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
// import { useStickySidebar } from "@/hooks/useStickySidebar";
import styles from "./CourseSidebar.module.css";
import { normalizeImageUrl } from "@/lib/imageUtils";
import {
  useWcProductsQuery,
  useCourseQuery,
} from "@/components/hooks/useWpQueries";
import { useCourseQuery as useCourseDataQuery } from "@/lib/coursesQueries";
import { useCartStore } from "@/store/cart";
import CourseSidebarCourseInfoSkeleton from "./CourseSidebarCourseInfoSkeleton";
import CourseSidebarImageSkeleton from "./CourseSidebarImageSkeleton";
import { calculatePrice, formatPrice, getPriceSellRegistry } from "@/lib/priceUtils";

interface CourseSidebarProps {
  courseId?: string | number;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ courseId = 169 }) => {
  const [favorite, setFavorite] = useState(false);
  const [isTrenersModalOpen, setIsTrenersModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pricingActionsRef = useRef<HTMLDivElement>(null);

  // Визначення мобільної версії
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  // Обмеження руху fixed елемента при скролінгу
  useEffect(() => {
    if (!isMobile || !pricingActionsRef.current) return;

    const element = pricingActionsRef.current;
    const maxScroll = 500; // Максимальна відстань руху в пікселях
    const startPosition = 100; // Початкова позиція зверху

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Обмежуємо рух до maxScroll пікселів
      const newPosition = startPosition + Math.min(scrollY, maxScroll);

      element.style.top = `${newPosition}px`;
    };

    window.addEventListener("scroll", handleScroll);

    // Початкове встановлення позиції
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isControlsDisabled = !isLoggedIn;
  // const { isSticky, shouldStick } = useStickySidebar();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!courseId || !course) return;

    const courseIdString = courseId.toString();
    const courseName =
      course.title?.rendered?.replace(/____FULL____/g, "") ||
      "Основи тренерства BFB";

    console.log("❤️ Toggling favorite:", {
      courseIdString,
      courseName,
      currentlyInFavorites: isInFavorites,
    });

    // Створюємо об'єкт товару для додавання в фаворити
    const courseItem = {
      id: courseIdString,
      name: courseName,
      price: parseFloat(hasDiscount ? salePrice : currentPrice) / 100,
      originalPrice:
        regularPrice && regularPrice !== "0"
          ? parseFloat(regularPrice) / 100
          : undefined,
      image: normalizeImageUrl(
        courseImage || product?.images?.[0]?.src || "/placeholder.svg"
      ),
    };

    // Викликаємо toggleFavoriteAction з правильними даними
    // toggleFavoriteAction сам обробляє додавання/видалення залежно від поточного стану
    toggleFavoriteAction(courseItem);
  };

  const handleAddToCart = async () => {
    if (course && courseId) {
      const courseIdString = courseId.toString();

      // Якщо товар вже в кошику - видаляємо його
      if (isInCart) {
        console.log("🗑️ Removing item from cart:", courseIdString);

        // Спробуємо видалити за різними можливими ключами
        const possibleKeys = [
          courseIdString, // "169"
          courseIdString.match(/\d+/)?.[0], // "169" (нормалізований)
          courseId?.toString(), // "169"
          String(courseId), // "169"
          `course-${courseIdString}`, // "course-169"
          `product-${courseIdString}`, // "product-169"
        ].filter(Boolean);

        let removed = false;
        for (const key of possibleKeys) {
          if (key && cartItems[key]) {
            console.log("🗑️ Removing with key:", key);
            removeItem(key);
            removed = true;
            break;
          }
        }

        // Якщо не знайшли за ключами, спробуємо знайти за назвою
        if (!removed) {
          const courseName =
            course?.title?.rendered?.replace(/____FULL____/g, "") ||
            "Основи тренерства BFB";
          const foundEntry = Object.entries(cartItems).find(
            ([key, cartItem]) =>
              cartItem.name === courseName && cartItem.quantity > 0
          );

          if (foundEntry) {
            const [foundKey] = foundEntry;
            console.log("🗑️ Removing by name with key:", foundKey);
            removeItem(foundKey);
            removed = true;
          }
        }

        if (!removed) {
          console.log("🗑️ Could not find item to remove");
        }

        return;
      }

      // Інакше додаємо товар в кошик
      const courseName =
        course.title?.rendered?.replace(/____FULL____/g, "") ||
        "Основи тренерства BFB";

      // Парсуємо regularPrice та salePrice для передачі в корзину
      const courseRegularPrice =
        regularPrice && regularPrice !== "0"
          ? parseFloat(regularPrice)
          : undefined;
      const courseSalePrice =
        salePrice && salePrice !== "0" && salePrice !== null
          ? parseFloat(salePrice)
          : undefined;

      // Базова ціна для корзини (без знижки авторизації, вона застосується в корзині)
      // Якщо є salePrice - використовуємо його, інакше використовуємо regularPrice як базову ціну
      // Це дозволить відображати дві ціни в корзині (regularPrice як стара, regularPrice*0.8 як нова)
      const basePriceForCart =
        courseSalePrice ||
        (courseRegularPrice
          ? courseRegularPrice
          : parseFloat(currentPrice || "0"));

      const courseImageUrl = normalizeImageUrl(
        courseImage || product?.images?.[0]?.src || "/placeholder.svg"
      );

      try {
        await addItem(
          {
            id: courseIdString,
            name: courseName,
            price: basePriceForCart,
            originalPrice:
              courseRegularPrice && courseRegularPrice > basePriceForCart
                ? courseRegularPrice
                : undefined,
            regularPrice: courseRegularPrice,
            salePrice: courseSalePrice,
            image: courseImageUrl,
            stockQuantity: null, // Курси завжди доступні
          },
          1
        );
      } catch (error) {
        alert((error as Error).message);
        return;
      }
    }
  };

  // Отримуємо дані курсу для динамічного контенту
  const { data: course, isLoading: isLoadingCourse } = useCourseQuery(courseId);

  // Отримуємо дані курсу з coursesQueries (як в CourseCard)
  // Конвертуємо courseId в число для сумісності
  const courseIdForQuery =
    typeof courseId === "number"
      ? courseId
      : /^\d+$/.test(String(courseId))
      ? parseInt(String(courseId))
      : 169;
  const { data: courseData, isLoading: isLoadingCourseData } =
    useCourseDataQuery(courseIdForQuery);

  // Логування для дебагу
  React.useEffect(() => {
    // Course data loaded
  }, [course]);

  // Функція для розрахунку "Новинка" (30 днів)
  const isNewProduct = (dateCreated?: string) => {
    if (!dateCreated) return false;
    const createdDate = new Date(dateCreated);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  };

  // Функція для розрахунку "Хіт" на основі топ 10 продажів
  const isHitProduct = (storeProduct?: {
    average_rating?: string;
    rating_count?: number;
    total_sales?: number;
    featured?: boolean;
    on_sale?: boolean;
  }) => {
    if (!storeProduct) return false;

    const totalSales = parseInt(storeProduct.total_sales?.toString() || "0");

    // Якщо немає продажів, не показуємо хіт
    if (totalSales === 0) return false;

    // Для CourseSidebar поки що використовуємо просту логіку
    // В майбутньому можна додати отримання всіх продуктів для порівняння
    return totalSales > 0; // Поки що показуємо хіт для будь-яких продажів
  };

  // Cart store
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);

  // Favorites store
  const toggleFavoriteAction = useFavoriteStore((s) => s.toggleFavorite);
  const favoriteItems = useFavoriteStore((s) => s.items);

  // Функція для перевірки наявності товару в кошику (аналогічно до removeItem логіки)
  const isInCart = useMemo(() => {
    if (!courseId) return false;
    const courseIdString = courseId.toString();

    // Спочатку перевіряємо за прямим ключем
    let item = cartItems[courseIdString];
    if (item?.quantity > 0) return true;

    // Спробуємо знайти за нормалізованим ключем (як у removeItem)
    const normalizedKey = courseIdString.match(/\d+/)?.[0];
    if (normalizedKey && cartItems[normalizedKey]?.quantity > 0) {
      return true;
    }

    // Перевіряємо за назвою товару або іншими ідентифікаторами
    const courseName =
      course?.title?.rendered?.replace(/____FULL____/g, "") ||
      "Основи тренерства BFB";
    return Object.values(cartItems).some(
      (cartItem) => cartItem.name === courseName && cartItem.quantity > 0
    );
  }, [courseId, cartItems, course]);

  // Функція для перевірки наявності товару в фаворитах
  const isInFavorites = useMemo(() => {
    if (!courseId) return false;
    const courseIdString = courseId.toString();

    // Спочатку перевіряємо за прямим ключем
    if (favoriteItems[courseIdString]) return true;

    // Спробуємо знайти за нормалізованим ключем
    const normalizedKey = courseIdString.match(/\d+/)?.[0];
    if (normalizedKey && favoriteItems[normalizedKey]) {
      return true;
    }

    // Перевіряємо за назвою товару або іншими ідентифікаторами
    const courseName =
      course?.title?.rendered?.replace(/____FULL____/g, "") ||
      "Основи тренерства BFB";
    return Object.values(favoriteItems).some(
      (favItem) => favItem.name === courseName
    );
  }, [courseId, favoriteItems, course]);

  // Синхронізуємо локальний стан з глобальним станом фаворитів
  React.useEffect(() => {
    setFavorite(isInFavorites);
  }, [isInFavorites]);

  // Дебаг логування для перевірки стану кошика
  React.useEffect(() => {
    if (courseId) {
      const courseIdString = courseId.toString();
      const normalizedKey = courseIdString.match(/\d+/)?.[0];
      const courseName =
        course?.title?.rendered?.replace(/____FULL____/g, "") ||
        "Основи тренерства BFB";

      console.log("🛒 CourseSidebar cart debug:", {
        courseId,
        courseIdType: typeof courseId,
        courseIdString,
        normalizedKey,
        courseName,
        cartItemsKeys: Object.keys(cartItems),
        isInCart,
        directMatch: !!cartItems[courseIdString],
        normalizedMatch: !!(normalizedKey && cartItems[normalizedKey]),
        nameMatch: Object.values(cartItems).some(
          (item) => item.name === courseName
        ),
      });

      console.log("❤️ CourseSidebar favorites debug:", {
        courseId,
        courseIdString,
        normalizedKey,
        courseName,
        favoriteItemsKeys: Object.keys(favoriteItems),
        isInFavorites,
        favorite, // локальний стан
        directFavMatch: !!favoriteItems[courseIdString],
        normalizedFavMatch: !!(normalizedKey && favoriteItems[normalizedKey]),
        nameFavMatch: Object.values(favoriteItems).some(
          (item) => item.name === courseName
        ),
      });
    }
  }, [
    courseId,
    cartItems,
    isInCart,
    favoriteItems,
    isInFavorites,
    favorite,
    course,
  ]);

  // Отримуємо зображення курсу
  const [courseImage, setCourseImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (course?.featured_media) {
      const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
      fetch(`${baseUrl}/wp-json/wp/v2/media/${course.featured_media}`)
        .then((res) => res.json())
        .then((data) => setCourseImage(data.source_url))
        .catch(() => setCourseImage(null));
    }
  }, [course?.featured_media]);

  // Отримуємо дані WooCommerce продукту для поточного курсу
  const { data: products = [] } = useWcProductsQuery({
    include: courseId ? courseId.toString() : "",
    per_page: 1,
  });
  const product = useMemo(() => {
    return products[0];
  }, [products]);

  // Отримуємо WooCommerce v3 API дані для цін та популярності
  const [storeProduct, setStoreProduct] = useState<{
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
    };
    on_sale?: boolean;
    average_rating?: string;
    rating_count?: number;
    total_sales?: number;
    featured?: boolean;
    is_purchasable?: boolean;
    purchasable?: boolean;
    stock_status?: string;
  } | null>(null);

  React.useEffect(() => {
    if (courseId) {
      // Використовуємо ID з отриманого курсу, якщо він є, інакше використовуємо courseId
      const courseIdForApi =
        course?.id ||
        (typeof courseId === "number"
          ? courseId
          : /^\d+$/.test(String(courseId))
          ? parseInt(String(courseId))
          : courseId);
      const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
      fetch(`${baseUrl}/wp-json/wc/v3/products/${courseIdForApi}`, {
        headers: {
          Authorization:
            "Basic " +
            btoa(
              "ck_fbd08d0a763d79d93aff6c3a56306214710ebb71:cs_871e6f287926ed84839018c2d7578ef9a71865c4"
            ),
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setStoreProduct(data);
        })
        .catch(() => {
          setStoreProduct(null);
        });
    }
  }, [courseId, course?.id]);

  const ratingValue = useMemo(() => {
    const parsed = parseFloat(
      storeProduct?.average_rating || product?.average_rating || "0"
    );
    if (Number.isNaN(parsed)) return 0;
    return Math.max(0, Math.min(5, parsed));
  }, [storeProduct?.average_rating, product?.average_rating]);

  const renderStars = (value: number) => {
    const stars = [];
    const rounded = Math.round(value);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${
            i <= rounded ? styles.starFilled : styles.starEmpty
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Використовуємо уніфіковані функції з priceUtils

  // Використовуємо уніфіковані функції з priceUtils

  // Визначаємо ціни для поточного курсу (як в CourseCard - якщо немає або "0" - fallback)
  const currentPrice =
    courseData?.wcProduct?.prices?.price &&
    courseData.wcProduct.prices.price !== "0"
      ? courseData.wcProduct.prices.price
      : courseData?.price ||
        storeProduct?.prices?.price ||
        product?.sale_price ||
        product?.price ||
        "0";
  const regularPrice =
    courseData?.wcProduct?.prices?.regular_price &&
    courseData.wcProduct.prices.regular_price !== "0"
      ? courseData.wcProduct.prices.regular_price
      : courseData?.originalPrice ||
        storeProduct?.prices?.regular_price ||
        product?.regular_price;
  const salePrice =
    courseData?.wcProduct?.prices?.sale_price &&
    courseData.wcProduct.prices.sale_price !== "0"
      ? courseData.wcProduct.prices.sale_price
      : storeProduct?.prices?.sale_price || null;
  const isOnSale = courseData?.wcProduct?.on_sale || false;

  // Додаткові дані для fallback логіки (як в CourseCard)
  const fallbackPrice = courseData?.price ? parseFloat(courseData.price) : 0;
  const fallbackOriginalPrice = courseData?.originalPrice
    ? parseFloat(courseData.originalPrice)
    : 0;

  const priceSellRegistry = getPriceSellRegistry({
    acf: courseData?.courseData as Record<string, unknown> | undefined,
    metaData: courseData?.metaData,
    meta_data: courseData?.metaData,
    wcProduct: courseData?.wcProduct,
  });

  const priceCalculation = calculatePrice({
    price: parseFloat(salePrice || currentPrice || "0"),
    regularPrice: regularPrice ? parseFloat(regularPrice) : undefined,
    isLoggedIn,
    priceSellRegistry,
  });

  const {
    finalPrice,
    originalPrice: calculatedOriginalPrice,
    totalDiscount,
    shouldShowOldPrice,
  } = priceCalculation;

  // Форматовані ціни для відображення
  const formattedCurrentPrice = formatPrice(currentPrice);
  const formattedRegularPrice = shouldShowOldPrice
    ? formatPrice(calculatedOriginalPrice)
    : null;
  const formattedSalePrice = salePrice ? formatPrice(salePrice) : null;
  const formattedFinalPrice = formatPrice(finalPrice);

  // Визначаємо чи є знижка
  const hasDiscount = shouldShowOldPrice;

  // Додаткова перевірка для fallback цін
  const hasFallbackDiscount =
    !hasDiscount &&
    fallbackOriginalPrice &&
    fallbackPrice &&
    fallbackOriginalPrice > fallbackPrice &&
    fallbackPrice > 0;

  // Розраховуємо знижку
  const finalDiscount = Math.round(totalDiscount);

  // Логування для дебагу цін
  React.useEffect(() => {
    // Price data
  }, [
    courseId,
    courseData,
    storeProduct,
    product,
    currentPrice,
    regularPrice,
    salePrice,
    isOnSale,
    formattedCurrentPrice,
    formattedRegularPrice,
    formattedSalePrice,
    hasDiscount,
    hasFallbackDiscount,
    finalDiscount,
    fallbackPrice,
    fallbackOriginalPrice,
  ]);

  // Логування для дебагу Course_include
  React.useEffect(() => {
    // Course include data
  }, [courseId, course]);

  // Логування для дебагу dateBlock даних
  React.useEffect(() => {
    // DateBlock data
  }, [courseId, storeProduct, product]);

  // Отримуємо категорії курсу для форматів (Online/Offline)
  const [categories, setCategories] = React.useState<number[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Використовуємо ID з отриманого курсу, якщо він є
        const courseIdForApi =
          course?.id ||
          (typeof courseId === "number"
            ? courseId
            : /^\d+$/.test(String(courseId))
            ? parseInt(String(courseId))
            : courseId);
        const response = await fetch(`/api/wc/v3/products/${courseIdForApi}`);
        if (response.ok) {
          const data = await response.json();
          const categoryIds =
            data.categories?.map((cat: { id: number }) => cat.id) || [];
          setCategories(categoryIds);
        }
      } catch {
        // Silent error handling
      }
    };

    if (courseId) {
      fetchCategories();
    }
  }, [courseId, course?.id]);

  const hasOnlineFormat = categories.includes(67);
  const hasOfflineFormat = categories.includes(68);

  return (
    <div className={styles.sidebar}>
      {isLoadingCourse || isLoadingCourseData ? (
        <CourseSidebarImageSkeleton />
      ) : (
        <div className={styles.imageContainer}>
          <Image
            src={normalizeImageUrl(
              courseImage || product?.images?.[0]?.src || "/placeholder.svg"
            )}
            alt={(
              product?.name ||
              course?.title?.rendered ||
              "Основи тренерства BFB"
            ).replace(/____FULL____/g, "")}
            width={400}
            height={300}
            className={styles.courseImage}
          />
          <BadgeContainer>
            {/* Новинка - якщо курс створений менше ніж 30 днів тому */}
            {isNewProduct(courseData?.dateCreated || undefined) && (
              <Badge variant="new" />
            )}

            {/* Знижка - уніфікована логіка через priceUtils */}
            {totalDiscount > 0 && (
              <Badge
                variant="discount"
                text={`-${Math.round(totalDiscount)}%`}
              />
            )}

            {/* Хіт - якщо курс популярний на основі рейтингу та відгуків */}
            {storeProduct && isHitProduct(storeProduct) && (
              <Badge variant="hit" />
            )}
          </BadgeContainer>
        </div>
      )}

      {/* courseContentBlock для мобілки - після imageContainer */}
      {isMobile && course && (
        <div className={styles.mobileCourseContentBlock}>
          <div className={styles.mobileTagsCodeBlock}>
            <div className={styles.mobileTags}>
              {course.course_data?.Date_start && (
                <div className={styles.mobileTag}>
                  <div className={styles.mobileTagIcon}>
                    <СalendarIcon />
                  </div>
                  <p className={styles.mobileTagText}>
                    {course.course_data?.Date_start}
                  </p>
                </div>
              )}
              {course.course_data?.Duration && (
                <div className={styles.mobileTag}>
                  <div className={styles.mobileTagIcon}>
                    <СlockIcon />
                  </div>
                  <p className={styles.mobileTagText}>
                    {course.course_data?.Duration}
                  </p>
                </div>
              )}
              {hasOnlineFormat && (
                <div className={styles.mobileTag}>
                  <div className={styles.mobileTagIcon}>
                    <GlobeIcon />
                  </div>
                  <p className={styles.mobileTagText}>Online</p>
                </div>
              )}
              {hasOfflineFormat && (
                <div className={styles.mobileTag}>
                  <div className={styles.mobileTagIcon}>
                    <NotGlobeIcon />
                  </div>
                  <p className={styles.mobileTagText}>Offline</p>
                </div>
              )}
            </div>
            <div className={styles.mobileCourseCode}>
              <p className={styles.mobileCourseCodeText}>Код курсу:</p>
              <p className={styles.mobileCourseCodeNumber}>{course.id}</p>
            </div>
          </div>
          <h1 className={styles.mobileTitle}>
            {course.title?.rendered?.replace(/____FULL____/g, "") ||
              "Основи тренерства BFB"}
          </h1>
          <div className={styles.mobileDescription}>
            <div
              dangerouslySetInnerHTML={{
                __html: course.content?.rendered || "",
              }}
            />
          </div>
        </div>
      )}

      <div className={styles.courseInfoBlock}>
        <div className={styles.tagsCodeBlock}>
          <div className={styles.tags}>
            {/* ///// */}
            {course?.course_data?.Date_start && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <СalendarIcon />
                </div>
                <p className={styles.tagText}>
                  {course.course_data?.Date_start}
                </p>
              </div>
            )}
            {course?.course_data?.Duration && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <СlockIcon />
                </div>
                <p className={styles.tagText}>{course.course_data?.Duration}</p>
              </div>
            )}
            {hasOnlineFormat && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <GlobeIcon />
                </div>
                <p className={styles.tagText}>Online</p>
              </div>
            )}
            {hasOfflineFormat && (
              <div className={styles.tag}>
                <NotGlobeIcon />
                <p className={styles.tagText}>Offline</p>
              </div>
            )}
          </div>
          <div className={styles.courseCode}>
            <p className={styles.courseCodeText}>Код курсу:</p>
            <p className={styles.courseCodeNumber}>{course?.id || courseId}</p>
          </div>
        </div>
      </div>

      {isLoadingCourse || isLoadingCourseData ? (
        <CourseSidebarCourseInfoSkeleton />
      ) : (
        <div className={styles.courseInfo}>
          <div className={styles.courseTitleBlock}>
            <div className={styles.categoryTagBlock}>
              <div className={styles.categoryTag}>Курси</div>
              <div className={styles.titleWithDateRow}>
                <div className={styles.titleWithBadges}>
                  <h2 className={styles.courseTitle}>
                    {(
                      product?.name ||
                      course?.title?.rendered ||
                      "Основи тренерства BFB"
                    ).replace(/____FULL____/g, "")}
                  </h2>
                </div>
                <div className={styles.dateBlock}>
                  <div className={styles.availability}>
                    <CheckMarkIcon />
                    <span className={styles.inStock}>
                      {storeProduct?.purchasable ||
                      storeProduct?.is_purchasable ||
                      product?.stock_status === "instock"
                        ? "В наявності"
                        : "Немає"}
                    </span>
                  </div>

                  <div className={styles.rating}>
                    <div className={styles.stars}>
                      {renderStars(ratingValue)}
                    </div>
                    <span className={styles.reviewsCount}>
                      (Відгуки{" "}
                      {storeProduct?.rating_count || product?.rating_count || 0}
                      )
                    </span>
                  </div>
                </div>

                {/* requirementsBadge після dateBlock */}
                {(courseData?.Required_equipment ||
                  courseData?.requirements) && (
                  <div className={styles.requirements}>
                    <span className={styles.requirementsBadge}>
                      {courseData?.Required_equipment ||
                        courseData?.requirements}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {course?.excerpt?.rendered &&
            typeof course.excerpt.rendered === "string" &&
            course.excerpt.rendered.replace(/<[^>]*>/g, "").trim() && (
              <p className={styles.courseDescription}>
                {course.excerpt.rendered.replace(/<[^>]*>/g, "").trim()}
              </p>
            )}

          {course?.course_data?.Course_include &&
            course.course_data.Course_include.filter(
              (item) => item && item.trim()
            ).length > 0 && (
              <div className={styles.courseIncludes}>
                <h3 className={styles.courseIncludesTitle}>
                  ЦЕЙ КУРС ВКЛЮЧАЄ:
                </h3>
                <ul className={styles.courseIncludesList}>
                  {course.course_data.Course_include.filter(
                    (item) => item && item.trim()
                  ).map((item, index) => (
                    <li key={index} className={styles.courseIncludesItem}>
                      <div className={styles.courseIncludesIcon}>
                        <Check3Icon />
                      </div>
                      <span className={styles.courseIncludesText}>
                        {item.trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {course?.course_data?.Course_themes &&
            course.course_data.Course_themes.filter(
              (theme) => theme && theme.trim()
            ).length > 0 && (
              <div className={styles.topicsSection}>
                <h3 className={styles.topicsSectionTitle}>
                  ЯКІ ТЕМИ ПОКРИВАЄ КУРС:
                </h3>
                <div className={styles.topicsGrid}>
                  {course.course_data.Course_themes.filter(
                    (theme) => theme && theme.trim()
                  ).map((theme, index) => (
                    <div key={index} className={styles.topicTag}>
                      <p className={styles.topicText}>{theme.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className={styles.pricingCartBlock}>
            {/* На десктопі pricing перед subscriptionOffer */}
            {!isMobile && (
              <div className={styles.pricing}>
                <span className={styles.currentPrice}>
                  {isLoggedIn ? formattedFinalPrice : formattedCurrentPrice}
                </span>
                {((hasDiscount || hasFallbackDiscount) &&
                  formattedRegularPrice &&
                  regularPrice !== "0") ||
                (isLoggedIn &&
                  finalPrice > 0 &&
                  formattedRegularPrice &&
                  regularPrice !== "0") ? (
                  <div className={styles.oldPrice}>
                    <span>{formattedRegularPrice}</span>
                    {/* <span className={styles.oldPriceCurrency}>₴</span> */}
                  </div>
                ) : null}
              </div>
            )}

            <div className={styles.subscriptionOffer}>
              <div className={styles.subscriptionOfferIcon}>
                <GiftIcon />
              </div>
              <p>
                Оформіть підписку – отримайте знижки та доступ до ексклюзивних
                функцій!
              </p>
            </div>

            {!isLoggedIn && (
              <div className={styles.registerCallout}>
                <div
                  className={styles.registerBlock}
                  onClick={() => setIsRegisterModalOpen(true)}
                  style={{ cursor: "pointer" }}
                >
                  <p className={styles.registerText}>
                    Зареєструйтесь, щоб придбати
                  </p>
                </div>
                <button
                  className={styles.registerBtn}
                  onClick={() => setIsTrenersModalOpen(true)}
                >
                  Стати тренером
                </button>
              </div>
            )}
          </div>

          <div className={styles.pricingActionsBlock}>
            {/* На мобілці pricing в pricingActionsBlock */}
            {isMobile && (
              <div className={styles.pricing}>
                <span className={styles.currentPrice}>
                  {isLoggedIn ? formattedFinalPrice : formattedCurrentPrice}
                </span>
                {((hasDiscount || hasFallbackDiscount) &&
                  formattedRegularPrice &&
                  regularPrice !== "0") ||
                (isLoggedIn &&
                  finalPrice > 0 &&
                  formattedRegularPrice &&
                  regularPrice !== "0") ? (
                  <div className={styles.oldPrice}>
                    <span>{formattedRegularPrice}</span>
                    <span className={styles.oldPriceCurrency}>₴</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.addToCartButton} ${
                  isControlsDisabled ? styles.addToCartButtonDisabled : ""
                } ${isInCart ? styles.addToCartButtonInCart : ""}`}
                disabled={isControlsDisabled}
                onClick={handleAddToCart}
              >
                {isInCart ? "Видалити з кошику" : "Додати в кошик"}
              </button>
              <button
                className={`${styles.favoriteButton} ${
                  favorite ? styles.favoriteActive : ""
                } ${isControlsDisabled ? styles.favoriteButtonDisabled : ""}`}
                onClick={isControlsDisabled ? undefined : toggleFavorite}
                disabled={isControlsDisabled}
              >
                {favorite ? <FavoriteBlacIcon /> : <Favorite2Icon />}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <>
          <TrenersModal
            isOpen={isTrenersModalOpen}
            onClose={() => setIsTrenersModalOpen(false)}
          />
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default CourseSidebar;
