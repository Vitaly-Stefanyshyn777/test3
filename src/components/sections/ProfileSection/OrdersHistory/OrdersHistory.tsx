"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./OrdersHistory.module.css";
import PaginationNav from "@/components/ui/PaginationNav/PaginationNav";
import { useAuthStore } from "@/store/auth";
import { adminRequest } from "@/lib/api";
import { useQuery, useQueries } from "@tanstack/react-query";
import { normalizeImageUrl } from "@/lib/imageUtils";
import OrdersHistorySkeleton from "./OrdersHistorySkeleton";

interface WCOrderItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  product_id?: number;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

interface WCOrder {
  id: number;
  status: string;
  date_created?: string;
  number?: string;
  total?: string;
  line_items?: WCOrderItem[];
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  shipping?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  payment_method_title?: string;
  shipping_total?: string;
  discount_total?: string;
}

type ViewOrder = {
  id: string;
  productName: string;
  productImages: string[]; // Масив зображень всіх товарів
  productImage: string; // Для сумісності, перше зображення
  productId?: number;
  quantity: number;
  orderDate: string;
  orderNumber: string;
  status: "delivered" | "processing" | "cancelled";
  totalPrice: number;
  orderIndex?: number; // Номер замовлення в списку
  itemCount?: number; // Загальна кількість товарів в замовленні
  lineItems?: any[]; // Всі товари в замовленні
  originalOrder?: WCOrder; // Оригінальний об'єкт замовлення для доступу до billing/shipping
};

const OrdersHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [productPages, setProductPages] = useState<Map<string, number>>(
    new Map()
  );
  const ordersPerPage = 4;
  const productsPerPage = 3;
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const {
    data: ordersData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      // WooCommerce API очікує числовий customer_id, а не slug
      // Перевіряємо, чи user?.id є числом, якщо ні - отримуємо числовий ID з профілю
      let customerId = user?.id;
      if (customerId && isNaN(Number(customerId))) {
        // Якщо ID не число (наприклад, slug "trainer_123"), отримуємо числовий ID
        try {
          const { getMyProfile } = await import("@/lib/auth");
          const profile = await getMyProfile();
          if (profile?.id) {
            customerId = String(profile.id);
          }
        } catch (e) {
          console.warn("[OrdersHistory] Failed to get numeric user ID:", e);
        }
      }
      const path = `/wp-json/wc/v3/orders?customer=${encodeURIComponent(
        String(customerId || user?.id || "")
      )}`;
      const { data } = await adminRequest({
        method: "GET",
        url: "/api/proxy",
        params: { path },
      });
      return data as WCOrder[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Отримуємо унікальні product_id з всіх замовлень
  const productIds = useMemo(() => {
    const ids: number[] = [];
    ordersData.forEach((order) => {
      order.line_items?.forEach((item) => {
        if (item.product_id && !ids.includes(item.product_id)) {
          ids.push(item.product_id);
        }
      });
    });
    return ids;
  }, [ordersData]);

  // Створюємо запити для всіх товарів за допомогою useQueries
  const productQueries = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ["product", productId],
      queryFn: async () => {
        const { data } = await adminRequest({
          method: "GET",
          url: "/api/proxy",
          params: { path: `/wp-json/wc/v3/products/${productId}` },
        });
        return data;
      },
      enabled: productIds.length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  // Створюємо мапу зображень товарів
  const productImagesMap = useMemo(() => {
    const map = new Map<number, string>();
    productQueries.forEach((query, index) => {
      const productId = productIds[index];
      if (query.data?.images?.[0]?.src) {
        map.set(productId, query.data.images[0].src);
      }
    });
    return map;
  }, [productQueries, productIds]);

  // Обробляємо замовлення з зображеннями товарів
  const orders = useMemo(() => {
    return ordersData.map((o, index) => {
      const first = (o.line_items || [])[0];
      const total = Number(o.total || 0);
      const created = o.date_created ? new Date(o.date_created) : null;

      // Отримуємо всі зображення товарів з мапи
      const productImages: string[] = [];
      const lineItems = o.line_items || [];

      lineItems.forEach((item) => {
        if (item.product_id) {
          const rawImage =
            productImagesMap.get(item.product_id) || "/placeholder.png";
          productImages.push(normalizeImageUrl(rawImage));
        }
      });

      // Якщо немає зображень, додаємо placeholder
      if (productImages.length === 0) {
        productImages.push("/placeholder.png");
      }

      // Отримуємо перше зображення для сумісності
      const productImage = productImages[0];

      return {
        id: String(o.id),
        productName: first?.name || "Товар",
        productImage, // Для сумісності
        productImages, // Масив всіх зображень
        productId: first?.product_id,
        quantity: first?.quantity || 1,
        orderDate: created ? created.toLocaleDateString("uk-UA") : "",
        orderNumber: o.number ? `№${o.number}` : `#${o.id}`,
        status:
          o.status === "completed"
            ? "delivered"
            : o.status === "cancelled"
            ? "cancelled"
            : "processing",
        totalPrice: isNaN(total) ? 0 : total,
        orderIndex: index + 1, // Номер замовлення (починаючи з 1)
        itemCount: lineItems.length || 1, // Загальна кількість товарів
        lineItems, // Зберігаємо всі товари
        originalOrder: o, // Зберігаємо оригінальний об'єкт замовлення
      } as ViewOrder;
    });
  }, [ordersData, productImagesMap]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(orders.length / ordersPerPage)),
    [orders.length]
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Доставлено";
      case "processing":
        return "Обробляється";
      case "cancelled":
        return "Скасовано";
      default:
        return "Невідомо";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return styles.delivered;
      case "processing":
        return styles.processing;
      case "cancelled":
        return styles.cancelled;
      default:
        return "";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRepeatOrder = (orderId: string) => {
    // Repeat order
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
        // Очистити сторінку товарів при згортанні
        setProductPages((prev) => {
          const newMap = new Map(prev);
          newMap.delete(orderId);
          return newMap;
        });
      } else {
        newSet.add(orderId);
        // Встановити першу сторінку при розгортанні
        setProductPages((prev) => new Map(prev).set(orderId, 1));
      }
      return newSet;
    });
  };

  const handleProductPageChange = (orderId: string, page: number) => {
    setProductPages((prev) => new Map(prev).set(orderId, page));
  };

  const getCurrentProductPage = (orderId: string): number => {
    return productPages.get(orderId) || 1;
  };

  const getTotalProductPages = (lineItems: any[] | undefined): number => {
    if (!lineItems) return 1;
    return Math.ceil(lineItems.length / productsPerPage);
  };

  // Функція для отримання кольору товару
  const getProductColor = (item: any): string | null => {
    // Спочатку перевіряємо мета дані товару
    if (item.meta_data) {
      const colorMeta = item.meta_data.find(
        (meta: any) =>
          meta.key === "pa_color" ||
          meta.key === "_product_attributes" ||
          meta.key === "color" ||
          meta.key.toLowerCase().includes("color")
      );
      if (colorMeta && colorMeta.value) {
        return colorMeta.value;
      }
    }

    // Якщо немає в мета даних, перевіряємо назву товару на наявність кольору
    // Зазвичай колір вказується в дужках або після тире
    const colorMatch = item.name.match(/[-–]\s*([^\(\)\[\]]+)(?:\s*\(|$)/);
    if (colorMatch && colorMatch[1]) {
      const color = colorMatch[1].trim();
      // Перевіряємо, чи це дійсно колір (не розмір, не матеріал)
      if (!color.match(/\d+|размер|size|материал|material|арт/i)) {
        return color;
      }
    }

    return null;
  };

  const handleViewProduct = (order: ViewOrder) => {
    if (order.productId) {
      router.push(`/products/${order.productId}`);
    }
  };

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Історія усіх замовлень</h1>
      </div>

      <div className={styles.divider}></div>

      {isLoading ? (
        <OrdersHistorySkeleton />
      ) : orders.length === 0 ? (
        <div className={styles.empty}>У вас немає замовлень</div>
      ) : (
        <div className={styles.ordersList}>
          {orders
            .slice(
              (currentPage - 1) * ordersPerPage,
              currentPage * ordersPerPage
            )
            .map((order, index) => (
              <React.Fragment key={order.id}>
                <div className={styles.orderCard}>
                  <div className={styles.orderDetails}>
                    <div className={styles.deliveryStatus}>
                      <span className={styles.deliveryStatusText}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className={styles.productImageWrapper}>
                      <div className={styles.productImageContainer}>
                        {/* Завжди показуємо перші 3 фото в сітці 2x2 */}
                        {order.productImages
                          .slice(0, 3)
                          .map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className={`${styles.productImage} ${
                                styles[`grid-pos-${imgIndex + 1}`]
                              }`}
                            >
                              <Image
                                src={image}
                                alt={`${order.productName} ${imgIndex + 1}`}
                                width={38}
                                height={38}
                              />
                            </div>
                          ))}

                        {/* 4-та позиція: або 4-те фото, або блок +N */}
                        {order.productImages.length === 4 ? (
                          <div
                            className={`${styles.productImage} ${styles["grid-pos-4"]}`}
                          >
                            <Image
                              src={order.productImages[3]}
                              alt={`${order.productName} 4`}
                              width={38}
                              height={38}
                            />
                          </div>
                        ) : order.productImages.length > 3 ? (
                          <div
                            className={`${styles.moreItems} ${styles["grid-pos-4"]}`}
                          >
                            <span className={styles.moreItemsText}>
                              +{order.productImages.length - 3}
                            </span>
                          </div>
                        ) : (
                          // Якщо товарів менше 4, просто порожня комірка
                          <div className={styles["grid-pos-4"]}></div>
                        )}
                      </div>

                      {/* Спільний контейнер для деталей та статусу доставки */}
                      <div className={styles.contentWrapper}>
                        <div className={styles.detailRow}>
                          <div className={styles.productHeader}>
                            <h3 className={styles.productName}>
                              Замовлення №{order.orderIndex}
                              <div className={styles.productQuantity}>
                                <p className={styles.productQuantityText}>
                                  x{order.itemCount}
                                </p>
                              </div>
                            </h3>
                          </div>

                          <div className={styles.orderMeta}>
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                Дата замовлення:
                              </span>
                              <span className={styles.orderDate}>
                                {order.orderDate}
                              </span>
                            </div>
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                Номер замовлення:
                              </span>
                              <span className={styles.orderNumber}>
                                {order.orderNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Розширюваний контент з деталями замовлення */}
                  {expandedOrders.has(order.id) && (
                    <>
                      <div className={styles.expandedDivider}></div>
                      <div className={styles.expandedContent}>
                        <div className={styles.expandedFlex}>
                          {/* Ліва колонка - товари */}
                          <div className={styles.productsColumn}>
                            <div className={styles.productsList}>
                              {(() => {
                                const currentProductPage =
                                  getCurrentProductPage(order.id);
                                const startIndex =
                                  (currentProductPage - 1) * productsPerPage;
                                const endIndex = startIndex + productsPerPage;
                                const paginatedItems =
                                  order.lineItems?.slice(
                                    startIndex,
                                    endIndex
                                  ) || [];

                                return paginatedItems.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className={styles.productItem}
                                  >
                                    <div
                                      className={styles.productItemContainer}
                                    >
                                      <div className={styles.productItemImage}>
                                        <Image
                                          src={
                                            productImagesMap.get(
                                              item.product_id
                                            ) || "/placeholder.png"
                                          }
                                          alt={item.name}
                                          width={60}
                                          height={60}
                                        />
                                      </div>
                                      <div className={styles.productItemInfo}>
                                        <div
                                          className={styles.productItemContent}
                                        >
                                          <h5
                                            className={styles.productItemName}
                                          >
                                            {item.name}
                                          </h5>
                                          <div
                                            className={styles.productItemMeta}
                                          >
                                            {(() => {
                                              const color =
                                                getProductColor(item);
                                              return color ? (
                                                <>
                                                  <span
                                                    className={
                                                      styles.productItemColor
                                                    }
                                                  >
                                                    {color}
                                                  </span>
                                                  <span
                                                    className={
                                                      styles.productItemDivider
                                                    }
                                                  >
                                                    |
                                                  </span>
                                                </>
                                              ) : null;
                                            })()}
                                            <div
                                              className={styles.productItemCode}
                                            >
                                              Код товару:{" "}
                                              {item.product_id || "N/A"}
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          className={
                                            styles.productItemPriceBlock
                                          }
                                        >
                                          <span
                                            className={styles.productItemPrice}
                                          >
                                            {item.total} ₴
                                          </span>
                                          <span
                                            className={
                                              styles.productItemOriginalPrice
                                            }
                                          >
                                            {item.total} ₴
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>

                          {/* Права колонка - інформація про доставку */}
                          <div className={styles.deliveryColumn}>
                            <div className={styles.deliveryInfo}>
                              <div className={styles.deliveryInfoGroup}>
                                <span className={styles.deliveryInfoLabel}>
                                  Отримувач:
                                </span>
                                <span className={styles.deliveryInfoValue}>
                                  {order.originalOrder?.shipping?.first_name ||
                                    order.originalOrder?.billing?.first_name ||
                                    ""}{" "}
                                  {order.originalOrder?.shipping?.last_name ||
                                    order.originalOrder?.billing?.last_name ||
                                    ""}
                                </span>
                              </div>
                              <div className={styles.deliveryInfoGroup}>
                                <span className={styles.deliveryInfoLabel}>
                                  Спосіб оплати:
                                </span>
                                <span className={styles.deliveryInfoValue}>
                                  {order.originalOrder?.payment_method_title ||
                                    "Невідомо"}
                                </span>
                              </div>
                              <div className={styles.deliveryInfoGroup}>
                                <span className={styles.deliveryInfoLabel}>
                                  Контактний номер:
                                </span>
                                <span className={styles.deliveryInfoValue}>
                                  {order.originalOrder?.billing?.phone ||
                                    "Невідомо"}
                                </span>
                              </div>
                              <div className={styles.locationGroup}>
                                <div className={styles.deliveryInfoGroup}>
                                  <span className={styles.deliveryInfoLabel}>
                                    Місто:
                                  </span>
                                  <span className={styles.deliveryInfoValue}>
                                    {order.originalOrder?.shipping?.city ||
                                      order.originalOrder?.billing?.city ||
                                      "Невідомо"}
                                  </span>
                                </div>
                                <div className={styles.deliveryInfoGroup}>
                                  <span className={styles.deliveryInfoLabel}>
                                    Країна:
                                  </span>
                                  <span className={styles.deliveryInfoValue}>
                                    {order.originalOrder?.shipping?.country ||
                                      order.originalOrder?.billing?.country ||
                                      "Невідомо"}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.deliveryInfoGroup}>
                                <span className={styles.deliveryInfoLabel}>
                                  Адреса:
                                </span>
                                <span className={styles.deliveryInfoValue}>
                                  {order.originalOrder?.shipping?.address_1 ||
                                    order.originalOrder?.billing?.address_1 ||
                                    ""}
                                  {order.originalOrder?.shipping?.address_2 ||
                                  order.originalOrder?.billing?.address_2
                                    ? `, ${
                                        order.originalOrder?.shipping
                                          ?.address_2 ||
                                        order.originalOrder?.billing?.address_2
                                      }`
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className={styles.divider}></div>

                            {/* Інформація про вартість */}
                            <div className={styles.costSummary}>
                              <div className={styles.costDetailsGroup}>
                                <div className={styles.costRow}>
                                  <span className={styles.costLabel}>
                                    Сума замовлення
                                  </span>
                                  <span className={styles.costValue}>
                                    {order.originalOrder?.total
                                      ? parseFloat(order.originalOrder.total).toFixed(2)
                                      : "0.00"}{" "}
                                    ₴
                                  </span>
                                </div>
                                <div className={styles.costRow}>
                                  <span className={styles.costLabel}>
                                    Сума знижки
                                  </span>
                                  <span className={styles.costValue}>
                                    {order.originalOrder?.discount_total
                                      ? parseFloat(
                                          order.originalOrder.discount_total
                                        ).toFixed(2)
                                      : "0.00"}{" "}
                                    ₴
                                  </span>
                                </div>
                                <div className={styles.costRow}>
                                  <span className={styles.costLabel}>
                                    Сума доставки
                                  </span>
                                  <span className={styles.costValue}>
                                    {order.originalOrder?.shipping_total
                                      ? parseFloat(
                                          order.originalOrder.shipping_total
                                        ).toFixed(2)
                                      : "0.00"}{" "}
                                    ₴
                                  </span>
                                </div>
                              </div>
                              <div
                                className={`${styles.costRow} ${styles.totalRow}`}
                              >
                                <span className={styles.costLabelTotal}>
                                  Разом
                                </span>
                                <span className={styles.costValueTotal}>
                                  {order.originalOrder?.total
                                    ? parseFloat(
                                        order.originalOrder.total
                                      ).toFixed(2)
                                    : "0.00"}{" "}
                                  ₴
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div className={styles.expandedDivider}></div> */}
                    </>
                  )}

                  <div className={styles.divider}></div>

                  {/* Спільний контейнер для інформації та кнопок */}
                  <div className={styles.orderFooter}>
                    {/* Детальна інформація про замовлення */}
                    <div className={styles.orderInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                          Сума замовлення:
                        </span>
                        <span className={styles.infoValue}>
                          {order.totalPrice}
                          <span className={styles.priceCurrency}>₴</span>
                        </span>
                      </div>
                    </div>

                    {/* Кнопки дій */}
                    <div className={styles.orderActions}>
                      <button
                        className={styles.repeatOrderBtn}
                        onClick={() => handleRepeatOrder(order.id)}
                      >
                        Повторити замовлення
                      </button>
                      <button
                        className={styles.viewDetailsBtn}
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        {expandedOrders.has(order.id)
                          ? "Згорнути"
                          : "Детальніше"}
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          {isError && (
            <div className={styles.error}>
              Не вдалося завантажити замовлення
            </div>
          )}
        </div>
      )}

      {!isLoading && orders.length > 4 && (
        <div className={styles.pagination}>
          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
