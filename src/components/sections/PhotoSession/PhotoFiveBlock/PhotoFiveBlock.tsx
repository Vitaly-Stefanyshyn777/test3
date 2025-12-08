"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoFiveBlock.module.css";

const PhotoFiveBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Команда BFB</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати команду BFB як єдину спільноту професіоналів — тренерів,
              адміністраторів, HR та інших учасників. Фото мають передавати
              згуртованість, професійність та енергію бренду.
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
                src="/images/ScreenshotFive.png"
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
                        Індивідуальні фото кожного учасника в тій самій
                        стилістиці (для карток на сайті).
                      </li>
                      <li>
                        Постави різні: борд, еспандер, або просто посмішка — для
                        динаміки.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={s.infoBlock}>
                  <div className={s.pill}>Формат</div>
                  <div className={s.infoBody}>
                    <ul>
                      <li>
                        Формат: квадратний, щоб усі фото виглядали гармонійно в
                        сітці.
                      </li>
                      <li>
                        Сюжет: портретні знімки засновників, тренерів, HR та
                        адміністрації.
                      </li>
                      <li>
                        Рекомендації:
                        <ul>
                          <li>
                            Зйомка на одному фоні (зал, студія BFB) для єдиного
                            стилю.
                          </li>
                          <li>
                            Можна використовувати інвентар (борди, еспандери) як
                            додаткові елементи.
                          </li>
                          <li>Всі у фірмовому одязі.</li>
                          <li>
                            Легке, рівномірне освітлення, яке підкреслює обличчя
                            та деталі.
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>5</div>
      </div>
    </section>
  );
};

export default PhotoFiveBlock;
