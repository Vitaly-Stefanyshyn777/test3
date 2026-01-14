"use client";
import React, { useEffect, useState } from "react";
import styles from "./PurchasedCourses.module.css";
import CoursesList, { type Course } from "./CoursesList";
import PurchasedCoursesSkeleton from "./PurchasedCoursesSkeleton";
import { fetchPurchasedProducts, PurchasedProduct } from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";

interface PurchasedCoursesProps {
  title?: string;
}

const mapPurchasedProductToCourse = (product: PurchasedProduct): Course => ({
  id: product.id?.toString() || "unknown",
  title: product.name || "Невідомий курс",
  description: product.purchase_date
    ? `Придбано: ${new Date(product.purchase_date).toLocaleDateString("uk-UA")}`
    : "Дата покупки невідома",
  image: product.image || "/images/courses/default-course.jpg",
  type: "Online",
  progress: { completed: 0, total: 1 },
  price: parseFloat(product.price || "0") || 0,
  currency: "₴",
  watchUrl: product.id ? `/courses/${product.id}` : "#",
});

const PurchasedCourses: React.FC<PurchasedCoursesProps> = ({
  title = "Придбані курси",
}) => {
  const [purchasedProducts, setPurchasedProducts] = useState<
    PurchasedProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    (async () => {
      try {
        // Чекаємо на гідратацію Zustand перед перевіркою токена
        if (!isHydrated) return;

        if (!user?.id || !token) {
          setError("Користувач не авторизований");
          return;
        }

        setIsLoading(true);
        let userId = Number(user.id);
        if (!Number.isFinite(userId)) {
          // резолвимо числовий id через users/me
          try {
            const res = await fetch(
              "/api/proxy?" +
                new URLSearchParams({
                  path: "/wp-json/wp/v2/users/me?context=edit",
                }).toString(),
              { headers: { "x-internal-admin": "1" } }
            );
            if (res.ok) {
              const me = (await res.json()) as { id?: number };
              userId = Number(me?.id);
            }
          } catch {}
        }
        if (!Number.isFinite(userId)) {
          setError("Не вдалося визначити користувача");
          return;
        }
        const data = await fetchPurchasedProducts(userId, token || undefined);
        setPurchasedProducts(data);
      } catch (err) {
        setError("Не вдалося завантажити придбані курси");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id, token, isHydrated]);

  const handleWatchCourse = (course: Course) => {
    if (course.watchUrl) {
      window.open(course.watchUrl, "_blank");
    }
  };

  if (isLoading) {
    return <PurchasedCoursesSkeleton title={title} />;
  }

  if (error) {
    return (
      <div className={styles.purchasedCourses}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.divider}></div>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const courseData: Course[] = purchasedProducts
    .filter((product) => product && product.id)
    .map(mapPurchasedProductToCourse);

  if (courseData.length === 0) {
    return (
      <div className={styles.purchasedCourses}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.divider}></div>
        <div className={styles.empty}>У вас немає придбаних курсів</div>
      </div>
    );
  }

  return (
    <div className={styles.purchasedCourses}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.divider}></div>
      <CoursesList courses={courseData} onWatch={handleWatchCourse} />
    </div>
  );
};

export default PurchasedCourses;
