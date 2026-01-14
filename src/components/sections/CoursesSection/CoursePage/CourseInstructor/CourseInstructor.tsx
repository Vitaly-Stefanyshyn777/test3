"use client";
import React from "react";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import styles from "./CourseInstructor.module.css";
import {
  DumbbellsIcon,
  HeartbeatIcon,
  SpineIcon,
  InstagramIcon,
} from "@/components/Icons/Icons";
import { useCourseQuery } from "@/components/hooks/useWpQueries";

interface CourseInstructorProps {
  courseId?: string | number;
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({
  courseId = 169,
}) => {
  const { data: course, isLoading, error } = useCourseQuery(courseId);
  const [activeCoachIndex, setActiveCoachIndex] = React.useState(0);

  if (isLoading) {
    return null;
  }

  // Якщо немає курсу, помилка або немає інструктора - не показуємо секцію
  if (error || !course || !course.course_data?.Course_coach) {
    return null;
  }

  // Підтримка як одного об'єкта, так і масиву інструкторів
  const coachData = course.course_data?.Course_coach;
  
  // Якщо немає даних інструктора - не показуємо секцію
  if (!coachData) {
    return null;
  }
  
  const coaches = Array.isArray(coachData) ? coachData : [coachData];

  // Відображаємо активного інструктора (можна перемикати якщо їх кілька)
  const coach = coaches[activeCoachIndex] || coaches[0];
  
  // Якщо немає базових даних інструктора (title) - не показуємо секцію
  if (!coach || !coach.title) {
    return null;
  }

  // Парсимо спеціалізацію з JSON string (з безпечною обробкою)
  const getSpecializations = () => {
    if (!coach.point_specialization) {
      return [];
    }

    // Якщо це вже масив, повертаємо як є
    if (Array.isArray(coach.point_specialization)) {
      return coach.point_specialization.filter((spec: string) => spec && spec.trim());
    }

    // Якщо це рядок, намагаємося розпарсити JSON
    if (typeof coach.point_specialization === "string") {
      try {
        const parsed = JSON.parse(coach.point_specialization);
        if (Array.isArray(parsed)) {
          return parsed.filter((spec: string) => spec && spec.trim());
        }
        return parsed && parsed.trim() ? [parsed.trim()] : [];
      } catch {
        // Якщо не JSON, повертаємо як масив з одного елемента
        return coach.point_specialization.trim() ? [coach.point_specialization.trim()] : [];
      }
    }

    return [];
  };

  const specializations = getSpecializations();

  // Парсимо аватар з JSON string (з безпечною обробкою)
  const getAvatarUrl = () => {
    // Спочатку перевіряємо поле img_link_data_avatar з ACF інструктора
    if (
      coach.img_link_data_avatar &&
      typeof coach.img_link_data_avatar === "string"
    ) {
      if (coach.img_link_data_avatar.startsWith("http")) {
        return coach.img_link_data_avatar;
      }
    }

    // Потім перевіряємо поле img_link_avatar
    if (!coach.img_link_avatar) {
      return null;
    }

    // Якщо це вже масив, беремо перший елемент
    if (Array.isArray(coach.img_link_avatar)) {
      return coach.img_link_avatar[0] || null;
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

    return null;
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
                {coach.textarea_description && (
                  <p className={styles.description}>
                    {coach.textarea_description}
                  </p>
                )}
              </div>

              {specializations.length > 0 && (
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
              )}
            </div>

            {(coach.input_text_experience || coach.input_text_count_training || coach.input_text_history) && (
              <div className={styles.stats}>
                {coach.input_text_experience && (
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <HeartbeatIcon />
                    </div>
                    <div className={styles.statContent}>
                      <span className={styles.statNumber}>
                        {coach.input_text_experience}
                      </span>
                      <span className={styles.statLabel}>Практичного досвіду</span>
                    </div>
                  </div>
                )}
                {coach.input_text_count_training && (
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <DumbbellsIcon />
                    </div>
                    <div className={styles.statContent}>
                      <span className={styles.statNumber}>
                        {coach.input_text_count_training}
                      </span>
                      <span className={styles.statLabel}>Проведено тренувань</span>
                    </div>
                  </div>
                )}
                {coach.input_text_history && (
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <SpineIcon />
                    </div>
                    <div className={styles.statContent}>
                      <span className={styles.statNumber}>
                        {coach.input_text_history}
                      </span>
                      <span className={styles.statLabel}>
                        Історій трансформацій
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

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
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={`${coach.title} - інструктор BFB`}
                  className={styles.instructorImage}
                  style={{ width: "100%", height: "auto", maxHeight: "none" }}
                />
              )}

              {/* Instagram картка поверх фото */}
              {avatarUrl && coach.input_text_link_instagram &&
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
