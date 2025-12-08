"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoSixBlock.module.css";

const PhotoSixBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Результати учнів BFB</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати реальні результати учнів BFB, передати емоції та живий
              досвід людей, які пройшли навчання і тренування. Фото повинні
              викликати довіру та мотивацію у майбутніх учнів.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Рекомендації до фото:</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Однаковий фон для всіх (світлий зал або студія з фірмовими
                  кольорами BFB або фон).
                </li>
                <li>Учасники у фірмовому спортивному одязі.</li>
                <li>
                  Локації: зали BFB, місця тренувань, іноді відкриті простори
                  (різноманітність в єдиному стилі).
                </li>
                <li>
                  Стиль фото: природні та живі, з емоціями (не надто
                  постановочні).
                </li>
                <li>Освітлення: яскраве, але м’яке, природний вигляд облич.</li>
                <li>Фокус: на людині, виразі обличчя та енергії руху.</li>
                <li>
                  Використовувати інвентар (борди, еспандери, міні-групи
                  тренувань) для контексту.
                </li>
                <li>
                  Додаткові елементи: борди, еспандери, міні-гантелі, інший
                  інвентар.
                </li>
                <li>Вертикальні фото для кожного.</li>
                <li>
                  Освітлення яскраве, натуральне або студійне, без тіней, з
                  акцентом на обличчях.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotSix.png"
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
                        Зняти кілька форматів:
                        <ul>
                          <li>
                            Портретні фото (учень дивиться в камеру, щирий вираз
                            обличчя).
                          </li>
                          <li>
                            Фото в процесі тренування (рухи, динаміка, енергія).
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Формат</div>
                  <div className={s.infoBody}>
                    <ul>
                      <li>
                        Формат: квадратний, живий портрет з природними емоціями
                        та легким акцентом на контекст тренувань.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>6</div>
      </div>
    </section>
  );
};

export default PhotoSixBlock;
