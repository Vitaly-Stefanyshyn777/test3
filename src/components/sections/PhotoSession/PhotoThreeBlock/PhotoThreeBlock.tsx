"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoThreeBlock.module.css";

const PhotoThreeBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Блок переваги стати інструктором BFB</h2>


        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати лідерську роль інструктора та взаємодію групи під час
              тренування. Фото має передати відчуття процесу навчання та
              командної роботи.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Фото «Близький кадр з тренування»</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Сюжет: На передньому плані частково видно інструктора
                  (наприклад, від плечей до пояса), який демонструє рух. На
                  задньому плані — учасники, що повторюють вправу.
                </li>
                <li>Рекомендації:</li>
                <li>
                  Зняти горизонтально, щоб охопити інструктора і групу позаду.
                </li>
                <li>
                  Фокус на інструкторі, фон з групою — трохи розмитий, але
                  видно, що вони синхронно виконують вправи.
                </li>
                <li>
                  Атмосфера активного заняття, природні рухи, емоції
                  концентрації.
                </li>
                <li>
                  Освітлення — м’яке, але достатнє, щоб підкреслити деталі людей
                  і динаміку сцени.
                </li>
                <li>
                  Кадр: Зняти трохи під кутом, щоб інструктор був крупніше, а
                  група створювала глибину.
                </li>
              </ul>
            </div>
          </div>
        </div>

      
        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotThree.png"
                alt="Приклад"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className={s.photo}
              />
            </div>
          </div>
          <div className={s.rightBottom}>
            <div className={s.rightInner}>
              <div className={s.infoBlock}>
                <div className={s.pill}>Формат</div>
                <div className={s.infoBody}>
                  <ul>
                    <li>
                      Фото «Близький кадр з тренування» – горизонтальний формат,
                      щоб показати частково інструктора на передньому плані та
                      групу, яка виконує вправи на задньому.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className={s.pageBadge}>3</div>
      </div>
    </section>
  );
};

export default PhotoThreeBlock;
