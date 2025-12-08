"use client";
import React from "react";
import styles from "./CourseHero.module.css";
import {
  СalendarIcon,
  СlockIcon,
  GlobeIcon,
  NotGlobeIcon,
} from "@/components/Icons/Icons";
import { useCourseQuery } from "@/components/hooks/useWpQueries";
import { CourseData } from "@/lib/bfbApi";
import CourseHeroSkeleton from "./CourseHeroSkeleton";

interface CourseHeroProps {
  courseId?: string | number;
}

const CourseHero: React.FC<CourseHeroProps> = ({ courseId = 169 }) => {
  const { data: course, isLoading, error } = useCourseQuery(courseId);
  const [categories, setCategories] = React.useState<number[]>([]);

  // Отримуємо категорії курсу з WooCommerce API
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Використовуємо ID для API запиту (якщо це slug, useCourseQuery вже отримав курс)
        const courseIdForApi = typeof courseId === "number" ? courseId : 
                                /^\d+$/.test(String(courseId)) ? parseInt(String(courseId)) : 
                                courseId;
        const response = await fetch(`/api/wc/v3/products/${courseIdForApi}`);
        if (response.ok) {
          const data = await response.json();
          const categoryIds = data.categories?.map((cat: { id: number }) => cat.id) || [];
          setCategories(categoryIds);
        }
      } catch (err) {
        console.error("Error fetching course categories:", err);
      }
    };
    
    if (courseId) {
      fetchCategories();
    }
  }, [courseId]);

  // Перевіряємо наявність форматів: 67 - Online, 68 - Offline
  const hasOnlineFormat = categories.includes(67);
  const hasOfflineFormat = categories.includes(68);

  if (isLoading) {
    return <CourseHeroSkeleton />;
  }

  if (error || !course) {
    return (
      <section className={styles.hero}>
        <div className={styles.courseContentBlock}>
          <div className={styles.error}>Помилка завантаження курсу</div>
        </div>
      </section>
    );
  }
  return (
    <section className={styles.hero}>
      <div className={styles.courseContentBlock}>
        <div className={styles.tagsCodeBlock}>
          <div className={styles.tags}>
            {course.course_data?.Date_start && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <СalendarIcon />
                </div>
                <p className={styles.tagText}>
                  {course.course_data.Date_start}
                </p>
              </div>
            )}
            {course.course_data?.Duration && (
              <div className={styles.tag}>
                <div className={styles.tagIcon}>
                  <СlockIcon />
                </div>
                <p className={styles.tagText}>
                  {course.course_data.Duration}
                </p>
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
            <p className={styles.courseCodeNumber}>{course.id}</p>
          </div>
        </div>
        <h1 className={styles.title}>
          {course.title.rendered.replace(/____FULL____/g, "")}
        </h1>
        <div className={styles.tagsCodeContainer}>
          <div className={styles.description}>
            <div
              dangerouslySetInnerHTML={{ __html: course.content.rendered }}
            />
          </div>
        </div>
      </div>
      {course.course_data?.Course_themes && course.course_data.Course_themes.length > 0 && (
        <div className={styles.topicsSection}>
          <h3>ЯКІ ТЕМИ ПОКРИВАЄ КУРС:</h3>
          <div className={styles.topicsGrid}>
            {course.course_data.Course_themes.map((theme, index) => (
              <div key={index} className={styles.topicTag}>
                <p className={styles.topicText}>{theme}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseHero;
