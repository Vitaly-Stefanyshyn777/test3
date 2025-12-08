"use client";
import React from "react";
import Image from "next/image";
import s from "./Hero.module.css";
import { TimeIcon } from "@/components/Icons/Icons";
import Link from "next/link";

const Hero: React.FC = () => {
  return (
    <section className={s.infoSection}>
      <div className={s.container}>
        <div className={s.infoBlock}>
          <div className={s.imageContent}>
            <Image
              src="/images/Frame132131812611.png"
              alt="Як проходить навчання"
              width={500}
              height={600}
              className={s.courseImage}
            />
          </div>
          <div className={s.textContent}>
            <div className={s.badgeContainer}>
              <div className={s.badgeBlock}>
                <span className={s.badge}>
                  <TimeIcon />
                  <p className={s.badgeText}> окупність за 1 місяць</p>
                </span>

                <h2 className={s.title}>
                  Стань новим
                  <br />
                  сертифікованим тренером
                </h2>
              </div>

              <p className={s.description}>
                Долучайся до спільноти, що змінює підхід до тренувань, і отримуй
                не лише інвентар, а й методику, платформу, знання та людей, з
                якими хочеться працювати
              </p>
            </div>
            <div className={s.buttonsContainer}>
              <Link href="/courses/instructor-4-0" className={s.detailsBtn}>
                Обрати курс
              </Link>
              <Link
                href="/courses/instructor-4-0"
                className={s.detailsBtLowern}
              >
                Переглянути тарифи
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
