"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoSevenBlock.module.css";

const PhotoSevenBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Як проходить навчання у BFB</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати процес навчання у BFB: як проходять тренування, взаємодію
              між тренерами та учасниками, підтримку і командну атмосферу.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Рекомендації до фото:</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Перша фотографія: група тренується на бордах — динаміка і
                  синхронність.
                </li>
                <li>
                  Друга фотографія: взаємодія тренера з учасником — допомога і
                  підтримка.
                </li>
                <li>Фон: світлий зал, без зайвих деталей, фокус на людях.</li>
                <li>
                  Стиль: реалістичний, з живими емоціями, без надмірної
                  постановки.
                </li>
                <li>
                  Освітлення: м’яке, але достатньо яскраве, чіткі вирази облич і
                  деталі.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotSeven.png"
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
                        Зняти тренера з легким нахилом до учня — передати
                        підтримку.
                      </li>
                      <li>
                        Зробити варіанти: крупний план взаємодії і ширший кадр з
                        групою.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Формат</div>
                  <div className={s.infoBody}>
                    <ul>
                      <li>
                        Формат: горизонтальний, широке охоплення сцени для
                        динаміки і взаємодії.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>7</div>
      </div>
    </section>
  );
};

export default PhotoSevenBlock;
