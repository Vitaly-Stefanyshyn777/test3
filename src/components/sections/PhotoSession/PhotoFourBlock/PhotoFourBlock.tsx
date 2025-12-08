"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoFourBlock.module.css";

const PhotoFourBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Блок про БФБ (атмосфера)</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати атмосферу та унікальність тренувань BFB — динаміку,
              командний дух і різноманіття тренувальних залів. Фото мають
              передавати відчуття енергії, залученості учасників та акцент на
              групових заняттях.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Рекомендації до фото:</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Горизонтальний кадр, широкий охват, щоб було видно 4-5К
                  учасників на бордах.
                </li>
                <li>Дві різні фотографії:</li>
                <li>
                  1. Тренування в одному залі (з акцентом на синхронні рухи
                  групи).
                </li>
                <li>
                  2. Тренування в іншому залі (інший інтер&#39;єр, інші ракурси,
                  щоб показати масштаб).
                </li>
                <li>
                  М&#39;яке, але яскраве освітлення, чітка передача кольорів
                  бренду (борди, резинки, килимки).
                </li>
                <li>Мінімум відволікаючих елементів на фоні.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotFour.png"
                alt="Приклад"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className={s.photo}
              />
            </div>
          </div>
          <div className={s.rightBottom}>
            <div className={s.rightInner}>
              <div className={s.infoGroup}>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Додатково:</div>
                  <div className={s.boxBody}>
                    <ul>
                      <li>
                        Один з кадрів може бути знятий трохи зверху, щоб
                        підкреслити геометрію залів і порядок розташування
                        учасників.
                      </li>
                      <li>
                        Другий кадр — на рівні очей, щоб створити ефект
                        присутності в тренувальному процесі.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Формат</div>
                  <div className={s.infoBody}>
                    <ul>
                      <li>
                        Формат: горизонтальний, широкий кадр з охопленням
                        більшої частини залу та учасників.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page number badge */}
        <div className={s.pageBadge}>4</div>
      </div>
    </section>
  );
};

export default PhotoFourBlock;
