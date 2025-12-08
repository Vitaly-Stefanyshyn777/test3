"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoEightBlock.module.css";

const PhotoEightBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Інструкторство в BFB</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати, що інструкторство в BFB — це не лише навчання техніці, а
              й робота з людьми, підтримка та створення атмосфери єдності.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Рекомендації до фото:</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Зняти тренера у центрі кадру, який пояснює або показує вправу.
                </li>
                <li>
                  Група учнів навколо у різних позиціях — створити глибину
                  кадру.
                </li>
                <li>Живі емоції: уважність, взаємодія, легкі усмішки.</li>
                <li>Одяг тренера — брендова форма BFB.</li>
                <li>
                  Освітлення природне або м’яке студійне, без різких тіней.
                </li>
                <li>Кадр горизонтальний, щоб передати зал і динаміку групи.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotEight.png"
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
                        Ближчий план: видно обличчя тренера та реакцію кількох
                        учнів.
                      </li>
                      <li>
                        Ширший план: показати весь зал і тренування як процес.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Формат</div>
                  <div className={s.infoBody}>
                    <ul>
                      <li>
                        Формат: горизонтальний, відмінний від попереднього
                        (інший ракурс/зала) — тренер у центрі, група навколо,
                        простір залу і динаміка заняття.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>8</div>
      </div>
    </section>
  );
};

export default PhotoEightBlock;
