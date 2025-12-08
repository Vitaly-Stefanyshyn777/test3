"use client";
import React from "react";
import Image from "next/image";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import styles from "./CourseInstructor.module.css";
import {
  DumbbellsIcon,
  HeartbeatIcon,
  SpineIcon,
  InstagramIcon,
} from "@/components/Icons/Icons";
import { useCourseQuery } from "@/components/hooks/useWpQueries";
import CourseInstructorSkeleton from "./CourseInstructorSkeleton";

interface CourseInstructorProps {
  courseId?: number;
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({
  courseId = 169,
}) => {
  const { data: course, isLoading, error } = useCourseQuery(courseId);
  const [activeCoachIndex, setActiveCoachIndex] = React.useState(0);

  if (isLoading) {
    return <CourseInstructorSkeleton />;
  }

  if (error || !course || !course.course_data.Course_coach) {
    return (
      <section className={styles.instructor}>
        <div className={styles.container}>
          <div className={styles.error}>
            Помилка завантаження інформації про інструктора
          </div>
        </div>
      </section>
    );
  }

  // Підтримка як одного об'єкта, так і масиву інструкторів
  const coachData = course.course_data.Course_coach;
  const coaches = Array.isArray(coachData) ? coachData : [coachData];

  // Відображаємо активного інструктора (можна перемикати якщо їх кілька)
  const coach = coaches[activeCoachIndex] || coaches[0];

  // Парсимо спеціалізацію з JSON string (з безпечною обробкою)
  const getSpecializations = () => {
    if (!coach.point_specialization) {
      return [
        "Спеціаліст",
        "Супервізор",
        "Персональний тренер",
        "Майстер спорту",
      ];
    }

    // Якщо це вже масив, повертаємо як є
    if (Array.isArray(coach.point_specialization)) {
      return coach.point_specialization;
    }

    // Якщо це рядок, намагаємося розпарсити JSON
    if (typeof coach.point_specialization === "string") {
      try {
        const parsed = JSON.parse(coach.point_specialization);
        return Array.isArray(parsed) ? parsed : [coach.point_specialization];
      } catch {
        // Якщо не JSON, повертаємо як масив з одного елемента
        return [coach.point_specialization];
      }
    }

    return [
      "Спеціаліст",
      "Супервізор",
      "Персональний тренер",
      "Майстер спорту",
    ];
  };

  const specializations = getSpecializations();

  // Парсимо аватар з JSON string (з безпечною обробкою)
  const getAvatarUrl = () => {
    if (!coach.img_link_avatar) {
      return "/images/instructor-lika.jpg";
    }

    // Якщо це вже масив, беремо перший елемент
    if (Array.isArray(coach.img_link_avatar)) {
      return coach.img_link_avatar[0] || "/images/instructor-lika.jpg";
    }

    // Якщо це рядок, намагаємося розпарсити JSON
    if (typeof coach.img_link_avatar === "string") {
      // Якщо рядок починається з http/https, це вже URL
      if (coach.img_link_avatar.startsWith("http")) {
        return coach.img_link_avatar;
      }

      // Спробуємо розпарсити як JSON
      try {
        const parsed = JSON.parse(coach.img_link_avatar);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
        if (typeof parsed === "string") {
          return parsed;
        }
      } catch {
        // Якщо не JSON, використовуємо як URL
        return coach.img_link_avatar;
      }
    }

    return "/images/instructor-lika.jpg";
  };

  const avatarUrl = getAvatarUrl();

  return (
    <section className={styles.instructor}>
      <div className={styles.container}>
        <h3 className={styles.sliderTitle}>Хто Вас буде супроводжувати</h3>
        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <div className={styles.titleTextBlock}>
              <div className={styles.titleBlock}>
                <h2 className={styles.title}>{coach.title}</h2>
                <p className={styles.description}>
                  {coach.textarea_description ||
                    "Досвідчений тренер з багаторічним стажем роботи. Спеціалізується на функціональному тренуванні та реабілітації."}
                </p>
              </div>

              <div className={styles.tagsBlock}>
                <p className={styles.tagsBlockTitle}>Спеціалізація:</p>

                <div className={styles.tags}>
                  {specializations.map((spec: string, index: number) => (
                    <span key={index} className={styles.tag}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <HeartbeatIcon />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {coach.input_text_experience || "12 років"}
                  </span>
                  <span className={styles.statLabel}>Практичного досвіду</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DumbbellsIcon />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {coach.input_text_count_training || "1000+"}
                  </span>
                  <span className={styles.statLabel}>Проведено тренувань</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <SpineIcon />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {coach.input_text_history || "70+"}
                  </span>
                  <span className={styles.statLabel}>
                    Історій трансформацій
                  </span>
                </div>
              </div>
            </div>

            {coaches.length > 1 && (
              <div className={styles.sliderSection}>
                <SliderNav
                  activeIndex={activeCoachIndex}
                  dots={coaches.length}
                  onPrev={() =>
                    setActiveCoachIndex((prev) =>
                      prev > 0 ? prev - 1 : coaches.length - 1
                    )
                  }
                  onNext={() =>
                    setActiveCoachIndex((prev) =>
                      prev < coaches.length - 1 ? prev + 1 : 0
                    )
                  }
                  onDotClick={(idx) => setActiveCoachIndex(idx)}
                />
              </div>
            )}
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.imageContainer}>
              <Image
                src={avatarUrl}
                alt={`${coach.title} - інструктор BFB`}
                width={500}
                height={600}
                className={styles.instructorImage}
                style={{ width: "100%", height: "auto", maxHeight: "none" }}
              />

              {/* Instagram картка поверх фото */}
              {coach.input_text_link_instagram &&
                coach.input_text_text_instagram && (
                  <div className={styles.instagramSection}>
                    <div className={styles.instagramCard}>
                      <div className={styles.instagramIcon}>
                        <InstagramIcon />
                      </div>
                      <div className={styles.instagramContent}>
                        <span className={styles.instagramText}>
                          {coach.input_text_text_instagram}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseInstructor;
