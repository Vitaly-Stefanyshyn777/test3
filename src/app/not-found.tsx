"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header/Header";
import Breadcrumbs from "@/components/layout/Breadcrumbs/Breadcrumbs";
import styles from "./not-found.module.css";

const NotFoundContent: React.FC = () => {
  return (
    <>
      <Header />
      <Breadcrumbs />
      <div className={styles.notFoundContainer} data-page="404">
        <div className={styles.notFoundContent}>
          <div className={styles.errorNumber}>404</div>
          <div className={styles.errorBlock}>
            <div className={styles.errorTextBlock}>
              <h1 className={styles.errorTitle}>Сторінку не знайдено</h1>
              <p className={styles.errorDescription}>
                Схоже, ви потрапили не туди, куди планували.
                Можливо, сторінку було переміщено або видалено.
              </p>
            </div>
            <Link href="/" className={styles.homeButton}>
              Головна
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

const NotFound: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
};

export default NotFound;
