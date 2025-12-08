"use client";
import React, { useMemo, useState } from "react";
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

interface CourseSidebarProps {
  courseId?: number;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ courseId = 169 }) => {
  const [favorite, setFavorite] = useState(false);
  const [isTrenersModalOpen, setIsTrenersModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isControlsDisabled = !isLoggedIn;
  // const { isSticky, shouldStick } = useStickySidebar();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    toggleFav({
      id: "course-bfb",
      name: "Основи тренерства BFB",
      price: 0,
      image: "/images/course-hero.jpg",
    });
  };

  const handleAddToCart = () => {
    if (course && courseId) {
      const courseName = course.title.rendered.replace(/____FULL____/g, "");
      const coursePrice =
        parseFloat(hasDiscount ? salePrice : currentPrice) / 100;
      const courseImageUrl = normalizeImageUrl(
        courseImage || product?.images?.[0]?.src || "/images/course-hero.jpg"
      );

      addItem(
        {
          id: courseId.toString(),
          name: courseName,
          price: coursePrice,
          image: courseImageUrl,
        },
        1
      );
    }
  };

  // Отримуємо дані курсу для динамічного контенту
  const { data: course, isLoading: isLoadingCourse } = useCourseQuery(courseId);

  // Отримуємо дані курсу з coursesQueries (як в CourseCard)
  const { data: courseData, isLoading: isLoadingCourseData } = useCourseDataQuery(courseId || 169);

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
  const cartItems = useCartStore((s) => s.items);
  const isInCart =
    cartItems[courseId?.toString() || ""] &&
    cartItems[courseId?.toString() || ""].quantity > 0;

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
      const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
      fetch(`${baseUrl}/wp-json/wc/v3/products/${courseId}`, {
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
  }, [courseId]);

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

  // Функція для форматування ціни
  const formatPrice = (
    price: string | number | undefined,
    isWcPrice: boolean = false
  ): string => {
    if (!price || isNaN(parseFloat(price.toString()))) return "0";
    const priceValue = parseFloat(price.toString());
    if (isNaN(priceValue)) return "0";
    // WooCommerce ціни в копійках, fallback ціни в гривнях
    return (isWcPrice ? priceValue / 100 : priceValue).toLocaleString("uk-UA");
  };

  // Функція для розрахунку знижки
  const calculateDiscount = (salePrice: string, regularPrice: string) => {
    if (!salePrice || !regularPrice || salePrice === regularPrice) return 0;

    // WooCommerce ціни в копійках, тому ділимо на 100 для розрахунку відсотка
    const salePriceValue = parseFloat(salePrice) / 100;
    const regularPriceValue = parseFloat(regularPrice) / 100;

    return Math.round(
      ((regularPriceValue - salePriceValue) / regularPriceValue) * 100
    );
  };

  // Визначаємо ціни та знижку для поточного курсу (як в CourseCard)
  const currentPrice =
    courseData?.wcProduct?.prices?.price ||
    courseData?.price ||
    storeProduct?.prices?.price ||
    product?.sale_price ||
    product?.price ||
    "5000";
  const regularPrice =
    courseData?.wcProduct?.prices?.regular_price ||
    courseData?.originalPrice ||
    storeProduct?.prices?.regular_price ||
    product?.regular_price;
  const salePrice =
    courseData?.wcProduct?.prices?.sale_price ||
    storeProduct?.prices?.sale_price;
  const isOnSale =
    courseData?.wcProduct?.on_sale || storeProduct?.on_sale || product?.on_sale;

  // Додаткові дані для fallback логіки (як в CourseCard)
  const fallbackPrice = courseData?.price ? parseFloat(courseData.price) : 5000;
  const fallbackOriginalPrice = courseData?.originalPrice
    ? parseFloat(courseData.originalPrice)
    : 7000;

  // Форматуємо ціни (відображаємо як є, без ділення на 100)
  const formattedCurrentPrice = formatPrice(currentPrice, false);
  const formattedRegularPrice = formatPrice(regularPrice, false);
  const formattedSalePrice = salePrice ? formatPrice(salePrice, false) : null;

  // Price formatting

  // Перевіряємо чи є знижка (як в CourseCard)
  const hasDiscount =
    isOnSale && salePrice && regularPrice && salePrice !== regularPrice;

  // Додаткова перевірка для fallback цін (як в CourseCard)
  const hasFallbackDiscount =
    !hasDiscount &&
    fallbackOriginalPrice &&
    fallbackPrice &&
    fallbackOriginalPrice > fallbackPrice &&
    fallbackPrice > 0;

  // Розраховуємо знижку на основі форматованих цін (як в CourseCard)
  const finalDiscount = hasDiscount
    ? calculateDiscount(salePrice, regularPrice)
    : hasFallbackDiscount
    ? Math.round(
        ((fallbackOriginalPrice - fallbackPrice) / fallbackOriginalPrice) * 100
      )
    : 0;

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
        const response = await fetch(`/api/wc/v3/products/${courseId}`);
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
  }, [courseId]);

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
              courseImage ||
                product?.images?.[0]?.src ||
                "/images/course-hero.jpg"
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
            {isNewProduct(course?.course_data?.Date_start || undefined) && (
              <Badge variant="new" />
            )}

            {/* Знижка - якщо курс на розпродажі */}
            {(hasDiscount || hasFallbackDiscount) && finalDiscount > 0 && (
              <Badge variant="discount" text={`-${finalDiscount}%`} />
            )}

            {/* Хіт - якщо курс популярний на основі рейтингу та відгуків */}
            {storeProduct && isHitProduct(storeProduct) && (
              <Badge variant="hit" />
            )}
          </BadgeContainer>
        </div>
      )}

      <div className={styles.courseInfoBlock}>
        <div className={styles.tagsCodeBlock}>
          <div className={styles.tags}>
            {/* ///// */}
            {course?.course_data.Date_start && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <СalendarIcon />
                </div>
                <p className={styles.tagText}>
                  {course.course_data.Date_start}
                </p>
              </div>
            )}
            {course?.course_data.Duration && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <СlockIcon />
                </div>
                <p className={styles.tagText}>{course.course_data.Duration}</p>
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
                <div className={styles.courseBadges}>
                  {storeProduct && isHitProduct(storeProduct) && (
                    <Badge variant="hit" />
                  )}
                </div>
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
                  <div className={styles.stars}>{renderStars(ratingValue)}</div>
                  <span className={styles.reviewsCount}>
                    ({storeProduct?.rating_count || product?.rating_count || 0})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.courseDescription}>
          {course?.excerpt?.rendered?.replace(/<[^>]*>/g, "") ||
            "Професійний курс для тренерів з функціонального тренування на BFB"}
        </p>

        <div className={styles.courseIncludes}>
          <h3 className={styles.courseIncludesTitle}>ЦЕЙ КУРС ВКЛЮЧАЄ:</h3>
          <ul className={styles.courseIncludesList}>
            {course?.course_data.Course_include?.map((item, index) => (
              <li key={index} className={styles.courseIncludesItem}>
                <div className={styles.courseIncludesIcon}>
                  <Check3Icon />
                </div>
                <span className={styles.courseIncludesText}>{item}</span>
              </li>
            )) || (
              // Fallback статичний список
              <>
                <li className={styles.courseIncludesItem}>
                  <div className={styles.courseIncludesIcon}>
                    <Check3Icon />
                  </div>
                </li>
                <li className={styles.courseIncludesItem}>
                  <div className={styles.courseIncludesIcon}>
                    <Check3Icon />
                  </div>
                  {/* <span className={styles.courseIncludesText}>
                    8 ресурсів для завантаження
                  </span> */}
                </li>
                <li className={styles.courseIncludesItem}>
                  <div className={styles.courseIncludesIcon}>
                    <Check3Icon />
                  </div>
                  <span className={styles.courseIncludesText}>
                    Доступ через мобільні пристрої та телевізор
                  </span>
                </li>
                <li className={styles.courseIncludesItem}>
                  <div className={styles.courseIncludesIcon}>
                    <Check3Icon />
                  </div>
                  <span className={styles.courseIncludesText}>
                    Повний довічний доступ
                  </span>
                </li>
                <li className={styles.courseIncludesItem}>
                  <div className={styles.courseIncludesIcon}>
                    <Check3Icon />
                  </div>
                  <span className={styles.courseIncludesText}>
                    Сертифікат про закінчення
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className={styles.topicsSection}>
          <h3 className={styles.topicsSectionTitle}>ЯКІ ТЕМИ ПОКРИВАЄ КУРС:</h3>
          <div className={styles.topicsGrid}>
            {course?.course_data.Course_themes?.map((theme, index) => (
              <div key={index} className={styles.topicTag}>
                <p className={styles.topicText}>{theme}</p>
              </div>
            )) || (
              <div className={styles.topicTag}>
                <p className={styles.topicText}>
                  Ведення груп і персональних занять
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.pricingCartBlock}>
          {/* На десктопі pricing перед subscriptionOffer */}
          {!isMobile && (
            <div className={styles.pricing}>
              <span className={styles.currentPrice}>
                {formattedCurrentPrice}
                <span className={styles.currentPriceCurrency}>₴</span>
              </span>
              {(hasDiscount || hasFallbackDiscount) &&
                formattedRegularPrice && (
                  <div className={styles.oldPrice}>
                    <span>{formattedRegularPrice}</span>
                    <span className={styles.oldPriceCurrency}>₴</span>
                  </div>
                )}
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
                {formattedCurrentPrice}
                <span className={styles.currentPriceCurrency}>₴</span>
              </span>
              {(hasDiscount || hasFallbackDiscount) &&
                formattedRegularPrice && (
                  <div className={styles.oldPrice}>
                    <span>{formattedRegularPrice}</span>
                    <span className={styles.oldPriceCurrency}>₴</span>
                  </div>
                )}
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={`${styles.addToCartButton} ${
                isControlsDisabled ? styles.addToCartButtonDisabled : ""
              }`}
              disabled={isControlsDisabled}
              onClick={handleAddToCart}
            >
              {isInCart ? "В кошику" : "Додати в кошик"}
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
