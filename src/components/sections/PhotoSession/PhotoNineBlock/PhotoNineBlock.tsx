"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoNineBlock.module.css";

const PhotoNineBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Питання та відповіді від Ліки</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Підкреслити, що відповіді надходять особисто від засновниці BFB –
              Ліки. Фото мають передати її експертність, відкритість та
              активність.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Рекомендації до фото:</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Зняти Ліку у центрі кадру, коли вона пояснює або демонструє
                  вправу.
                </li>
                <li>
                  На фоні можуть бути учні або зал — створити глибину кадру.
                </li>
                <li>Живі емоції: уважність, взаємодія, легкі усмішки.</li>
                <li>Одяг — брендова форма BFB.</li>
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
                src="/images/ScreenshotNine.png"
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
                        Ближчий план: обличчя Ліки та реакції людей поряд.
                      </li>
                      <li>Ширший план: весь зал і процес тренування.</li>
                    </ul>
                  </div>
                </div>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Формат</div>
                  <div className={s.infoBody}>
                    <ul>
                      <li>
                        Формат: горизонтальний, акцент на засновниці BFB — Ліці.
                        Вона у процесі тренування або демонструє вправу; фон
                        підкреслює сучасність бренду.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>9</div>
      </div>
    </section>
  );
};

export default PhotoNineBlock;
