"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  MinuswIcon,
  BooksIcon,
  GlobeIcon,
  Check3Icon,
} from "@/components/Icons/Icons";
import styles from "./CourseProgram.module.css";

interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessonsCount: number;
  isExpanded: boolean;
}

interface CourseProgramItem {
  hl_input_text_title?: string;
  hl_input_text_lesson_count?: string;
  hl_textarea_description?: string;
  hl_textarea_themes?: string;
}

interface CourseProgramProps {
  courseId?: string | number;
}

const CourseProgram: React.FC<CourseProgramProps> = ({ courseId = 169 }) => {
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

  // Завантажуємо дані курсу напряму без React Query
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true);
        const { fetchCourse } = await import("@/lib/coursesQueries");
        const courseData = await fetchCourse(courseId);
        setCourse(courseData);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  // Створюємо модулі з даних
  const [modules, setModules] = useState<CourseModule[]>([]);

  useEffect(() => {
    if (
      course?.course_data?.Course_program &&
      Array.isArray(course.course_data.Course_program)
    ) {
      const apiModules = course.course_data.Course_program.map(
        (program: CourseProgramItem, index: number) => ({
          id: index + 1,
          title: program.hl_input_text_title || `Модуль ${index + 1}`,
          description: program.hl_textarea_description || "",
          lessonsCount:
            parseInt(
              program.hl_input_text_lesson_count?.replace(/\D/g, "") || ""
            ) || 1,
          isExpanded: false,
        })
      );
      setModules(apiModules);
    } else {
      setModules([]);
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

  // Логіка для показу модулів
  const initialModulesCount = 4;
  const displayedModules = showAll
    ? modules
    : modules.slice(0, initialModulesCount);
  const hasMoreModules = modules.length > initialModulesCount;

  const handleShowMore = () => {
    setShowAll(true);
  };

  if (isLoading) {
    return null;
  }

  // Якщо немає курсу або помилка - не показуємо секцію
  if (error || !course) {
    return null;
  }

  // Якщо програма курсу порожня - не показуємо секцію
  if (!modules || modules.length === 0) {
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
                              .map((theme: string, index: number) => (
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
          {(course?.course_data.Blocks ||
            course?.course_data.Online_lessons) && (
            <div className={styles.statsCardBlock}>
              <div className={styles.statsCard}>
                {course?.course_data.Blocks && (
                  <div className={styles.statBlock}>
                    <div className={styles.statIcon}>
                      <BooksIcon />
                    </div>
                    <div className={styles.statItemBlock}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Блоки:</span>
                        <span className={styles.statNumber}>
                          {course.course_data.Blocks}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.statsCardRight}>
                {course?.course_data.Online_lessons && (
                  <div className={styles.statBlock}>
                    <div className={styles.statIcon}>
                      <GlobeIcon />
                    </div>
                    <div className={styles.statItemBlock}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                          Онлайн заняття:
                        </span>
                        <span className={styles.statNumber}>
                          {course.course_data.Online_lessons}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {course.course_data.What_learn &&
            course.course_data.What_learn.length > 0 && (
              <div className={styles.learningOutcomes}>
                <h3>ЧОГО ВИ НАВЧИТЕСЬ</h3>
                <ul className={styles.learningList}>
                  {course.course_data.What_learn.filter(
                    (item: string) => item && item.trim()
                  ).map((item: string, index: number) => (
                    <li key={index} className={styles.learningItem}>
                      <div className={styles.learningIcon}>
                        <Check3Icon />
                      </div>
                      <span className={styles.learningText}>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default CourseProgram;
