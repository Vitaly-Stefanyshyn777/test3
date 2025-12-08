"use client";
import React from "react";
import styles from "./CoursesCatalogSection.module.css";
import ProductCard from "../../ CourseCard/CourseCard";

const CoursesCatalogSection = () => {
  const courses = [
    {
      id: "1",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 5,
      isNew: true,
      isHit: false,
      image: "/images/courses/basic-trainer.jpg",
      rating: 4.5,
      reviewsCount: 235,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "2",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 5,
      isNew: false,
      isHit: true,
      image: "/images/courses/basic-trainer-2.jpg",
      rating: 4.8,
      reviewsCount: 189,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "3",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 0,
      isNew: true,
      isHit: false,
      image: "/images/courses/basic-trainer-3.jpg",
      rating: 4.2,
      reviewsCount: 156,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "4",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 20,
      isNew: false,
      isHit: false,
      image: "/images/courses/basic-trainer-4.jpg",
      rating: 4.7,
      reviewsCount: 298,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "5",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 5,
      isNew: false,
      isHit: true,
      image: "/images/courses/basic-trainer-5.jpg",
      rating: 4.6,
      reviewsCount: 174,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "6",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 5,
      isNew: true,
      isHit: false,
      image: "/images/courses/basic-trainer-6.jpg",
      rating: 4.4,
      reviewsCount: 203,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "7",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 5,
      isNew: false,
      isHit: false,
      image: "/images/courses/basic-trainer-7.jpg",
      rating: 4.3,
      reviewsCount: 267,
      requirements: "Для проходження потрібені гантелі",
    },
    {
      id: "8",
      name: "Тренер BFB: Базовий рівень",
      description:
        "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
      price: 5000,
      originalPrice: 7000,
      discount: 5,
      isNew: false,
      isHit: false,
      image: "/images/courses/basic-trainer-8.jpg",
      rating: 4.5,
      reviewsCount: 145,
      requirements: "Для проходження потрібені гантелі",
    },
  ];

  return (
    <section className={styles.catalogSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Фільтр</h2>
          <div className={styles.sortOptions}>
            <select className={styles.sortSelect}>
              <option>Показувати по</option>
              <option>12</option>
              <option>24</option>
              <option>48</option>
            </select>
            <select className={styles.sortSelect}>
              <option>Сортування</option>
              <option>За ціною (зростання)</option>
              <option>За ціною (спадання)</option>
              <option>За рейтингом</option>
            </select>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <h3>Професійний спрямування:</h3>
              <label>
                <input type="checkbox" /> Для новачків
              </label>
              <label>
                <input type="checkbox" /> BFB для інструкторів
              </label>
              <label>
                <input type="checkbox" /> Базовий рівень інструктора групових
                програм
              </label>
              <label>
                <input type="checkbox" /> Воркшопи з майстерів
              </label>
            </div>

            <div className={styles.filterGroup}>
              <h3>Управління, підготовка та бізнес:</h3>
              <label>
                <input type="checkbox" /> Like Fitness
              </label>
              <label>
                <input type="checkbox" /> Like Fitness
              </label>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.applyBtn}>Застосувати фільтри</button>
              <button className={styles.resetBtn}>
                Скинути все налаштування
              </button>
            </div>
          </div>

          <div className={styles.coursesGrid}>
            {courses.map((course) => (
              <ProductCard
                key={course.id}
                id={course.id}
                name={course.name}
                description={course.description}
                price={course.price}
                originalPrice={course.originalPrice}
                discount={course.discount}
                isNew={course.isNew}
                isHit={course.isHit}
                image={course.image}
                rating={course.rating}
                reviewsCount={course.reviewsCount}
                requirements={course.requirements}
              />
            ))}
          </div>
        </div>

        <div className={styles.pagination}>
          <button className={styles.paginationBtn}>‹</button>
          <button className={styles.paginationBtn}>1</button>
          <button className={styles.paginationBtn}>2</button>
          <button className={styles.paginationBtn}>3</button>
          <button className={styles.paginationBtn}>›</button>
        </div>
      </div>
    </section>
  );
};

export default CoursesCatalogSection;
