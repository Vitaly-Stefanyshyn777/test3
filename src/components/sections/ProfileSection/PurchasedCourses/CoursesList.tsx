"use client";

import React from "react";
import styles from "./PurchasedCourses.module.css";
import Image from "next/image";
import { GlobeIcon } from "@/components/Icons/Icons";
import { formatCurrencyUA } from "@/lib/format";

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  type: "Online" | "Offline";
  progress: { completed: number; total: number };
  price: number;
  currency?: string;
  watchUrl?: string;
}

type Props = {
  courses: Course[];
  onWatch: (course: Course) => void;
};

export default function CoursesList({ courses, onWatch }: Props) {
  return (
    <div className={styles.coursesList}>
      {courses.map((course) => (
        <div key={course.id} className={styles.courseCard}>
          <div className={styles.courseImageContainer}>
            <div className={styles.courseImage}>
              <Image
                src={course.image}
                alt={course.title}
                width={500}
                height={300}
                className={styles.image}
              />
            </div>

            <div className={styles.courseImageOverlay}>
              <div className={styles.courseInfo}>
                <div className={styles.courseType}>
                  <span className={styles.typeIcon}>
                    <GlobeIcon />
                  </span>
                  <span className={styles.typeText}>{course.type}</span>
                </div>
              </div>

              <h3 className={styles.courseTitle}>{course.title}</h3>
              <p className={styles.courseDescription}>{course.description}</p>
            </div>
          </div>

          <div className={styles.courseActions}>
            <div className={styles.coursePrice}>
              {formatCurrencyUA(course.price, course.currency || "₴")}
            </div>
            <div className={styles.watchButtonContainer}>
              <button
                className={styles.watchButton}
                onClick={() => onWatch(course)}
                disabled={!course.watchUrl}
              >
                Дивитися
              </button>
              {course.watchUrl && <div className={styles.watchButtonLine}></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
