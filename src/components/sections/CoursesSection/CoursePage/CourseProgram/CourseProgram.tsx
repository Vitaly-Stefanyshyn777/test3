"use client";
import React, { useState } from "react";
import {
  PlusIcon,
  MinuswIcon,
  BooksIcon,
  GlobeIcon,
  Check3Icon,
} from "@/components/Icons/Icons";
import styles from "./CourseProgram.module.css";
import { useCourseQuery } from "@/components/hooks/useWpQueries";
import { CourseData } from "@/lib/bfbApi";
import CourseProgramSkeleton from "./CourseProgramSkeleton";

interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessonsCount: number;
  isExpanded: boolean;
}

interface CourseProgramProps {
  courseId?: number;
}

const CourseProgram: React.FC<CourseProgramProps> = ({ courseId = 169 }) => {
  const { data: course, isLoading, error } = useCourseQuery(courseId);

  // Динамічні модулі курсу з API
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Завантажуємо модулі з API
  React.useEffect(() => {
    if (course && course.course_data.Course_program) {
      const apiModules = course.course_data.Course_program.map(
        (program, index) => ({
          id: index + 1,
          title: program.hl_input_text_title,
          description: program.hl_textarea_description || "Опис модуля",
          lessonsCount:
            parseInt(program.hl_input_text_lesson_count.replace(/\D/g, "")) ||
            1,
          isExpanded: false,
        })
      );
      setModules(apiModules);
    }
  }, [course]);

  const toggleModule = (id: number) => {
    setModules(
      modules.map((module) =>
        module.id === id
          ? { ...module, isExpanded: !module.isExpanded }
          : module
      )
    );
  };

  // Визначаємо які модулі показувати
  const displayedModules = showAll ? modules : modules.slice(0, 4);
  const hasMoreModules = modules.length > 4;

  const handleShowMore = () => {
    setShowAll(true);
  };

  if (isLoading) {
    return <CourseProgramSkeleton />;
  }

  if (error || !course) {
    return (
      <section className={styles.program}>
        <div className={styles.content}>
          <div className={styles.error}>
            Помилка завантаження програми курсу
          </div>
        </div>
      </section>
    );
  }

  // Якщо немає модулів, не показуємо секцію
  if (!course.course_data.Course_program || modules.length === 0) {
    return null;
  }

  return (
    <section className={styles.program}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>Програма курсу</h2>
          <div
            className={`${styles.modulesList} ${
              showAll ? styles.modulesListScrollable : ""
            }`}
          >
            {displayedModules.map((module) => (
              <div
                key={module.id}
                className={`${styles.module} ${
                  module.isExpanded ? styles.expanded : ""
                }`}
              >
                <button
                  className={styles.moduleButton}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className={styles.moduleInfo}>
                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                  </div>
                  <div className={styles.lessonsCountContainer}>
                    <span className={styles.lessonsCount}>
                      {module.lessonsCount} урок
                      {module.lessonsCount > 1 ? "ів" : ""}
                    </span>
                    <div
                      className={`${styles.chevron} ${
                        module.isExpanded ? styles.expanded : ""
                      }`}
                    >
                      {module.isExpanded ? <MinuswIcon /> : <PlusIcon />}
                    </div>
                  </div>
                </button>
                {module.isExpanded && (
                  <div className={styles.moduleDescription}>
                    <p className={styles.moduleDescriptionText}>
                      {module.description}
                    </p>
                    {course &&
                      course.course_data.Course_program[module.id - 1]
                        ?.hl_textarea_themes && (
                        <div className={styles.topicsSection}>
                          <h4>ТЕМИ:</h4>
                          <div className={styles.topicsGrid}>
                            {course.course_data.Course_program[
                              module.id - 1
                            ].hl_textarea_themes
                              .split("|||")
                              .map((theme, index) => (
                                <span key={index} className={styles.topicTag}>
                                  <p className={styles.topicText}>
                                    {theme.trim()}
                                  </p>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {hasMoreModules && !showAll && (
            <button className={styles.showAllButton} onClick={handleShowMore}>
              Показати ще
            </button>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.statsCardBlock}>
            <div className={styles.statsCard}>
              <div className={styles.statBlock}>
                <div className={styles.statIcon}>
                  <BooksIcon />
                </div>
                <div className={styles.statItemBlock}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Блоки:</span>
                    <span className={styles.statNumber}>
                      {course?.course_data.Blocks || "201"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statsCardRight}>
              <div className={styles.statBlock}>
                <div className={styles.statIcon}>
                  <GlobeIcon />
                </div>
                <div className={styles.statItemBlock}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Онлайн заняття:</span>
                    <span className={styles.statNumber}>
                      {course?.course_data.Online_lessons || "12"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.learningOutcomes}>
            <h3>ЧОГО ВИ НАВЧИТЕСЬ</h3>
            <ul className={styles.learningList}>
              {course.course_data.What_learn.map((item, index) => (
                <li key={index} className={styles.learningItem}>
                  <div className={styles.learningIcon}>
                    <Check3Icon />
                  </div>
                  <span className={styles.learningText}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseProgram;
