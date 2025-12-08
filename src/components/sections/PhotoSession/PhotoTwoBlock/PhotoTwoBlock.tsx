"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoTwoBlock.module.css";

const PhotoTwoBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Блок борд для курса</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати використання борда в тренуваннях та продемонструвати його
              якість і деталі. Фото повинні підкреслювати функціональність і
              стиль обладнання.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Фото «Робота на борді»</div>
            <div className={`${s.boxBody} ${s.twoCols}`}>
              <ul>
                <li>Сюжет: група тренерів виконує вправи на бордах у залі.</li>
                <li>Рекомендації:</li>
                <li>
                  Тренери в динамічній позі, акцент на роботу м’язів та
                  стабільність.
                </li>
                <li>
                  Легкий, але контрастний фон, щоб виділити борди (рожеві
                  стрічки і червоні килимки).
                </li>
                <li>
                  Природне або студійне світло, яке підкреслює деталі борда.
                </li>
                <li>
                  Кадр: горизонтальний, захоплює кілька людей, фокус на
                  передньому плані.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotTwo.png"
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
                <div className={s.pill}>Фото «Вертикальний борд»</div>
                <div className={s.infoBody}>
                  <ul>
                    <li>Сюжет: Окремий борд сфотографований вертикально.</li>
                    <li>Рекомендації:</li>
                    <li>
                      Чистий світлий фон, хороше освітлення, щоб видно було
                      текстуру дерева.
                    </li>
                    <li>
                      Легкий акцент світла зверху або збоку, щоб підкреслити
                      вигини та форму.
                    </li>
                    <li>Мінімалістичний стиль без зайвих предметів.</li>
                    <li>
                      Кадр: Вертикальний, з невеликим нахилом камери, щоб борд
                      виглядав об’ємно.
                    </li>
                  </ul>
                </div>
              </div>

              <div className={s.infoBlock}>
                <div className={s.pill}>Формат</div>
                <div className={s.infoBody}>
                  <ul>
                    <li>
                      Фото «Робота на борді» – вертикальний формат, зображення
                      акцентує на тренері та роботі з бордом, займає високу
                      частину блоку.
                    </li>
                    <li>
                      Фото «Вертикальний борд» – вертикальний формат, чітко
                      демонструє форму, вигини та текстуру борда.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>2</div>
      </div>
    </section>
  );
};

export default PhotoTwoBlock;
