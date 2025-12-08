"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoOneBlock.module.css";

const PhotoOneBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Блок про БФБ</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Передати енергію, мотивацію та позитив — показати тренера BFB як
              лідера, який випромінює силу і драйв. Фото має стати головним
              візуальним акцентом, що одразу привертає увагу.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Рекомендації до фото:</div>
            <div className={`${s.boxBody} ${s.twoCols}`}>
              <ul>
                <li>
                  Модель: сертифікований тренер (жіноча фігура, впевнена
                  посмішка).
                </li>
                <li>
                  Поза: стоячи, з баланс-бордом у руках (борд вертикально або
                  трохи під кутом).
                </li>
                <li>
                  Рух: легкий динамічний нахил, щоб створити відчуття руху.
                </li>
                <li>
                  Аксесуари: яскрава спортивна пов’язка, топ і легінси у
                  фірмових кольорах (фіолетовий, рожевий).
                </li>
                <li>Фон: без зайвих деталей.</li>
              </ul>
              <ul>
                <li>
                  Світло: м’яке, рівномірне, щоб чітко підкреслити контури
                  моделі та борда.
                </li>
                <li>
                  Додатково: борд має виглядати якісним, з акцентом на його
                  форму і текстуру.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/2025-07-2916.32.481.png"
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
                <div className={s.pill}>Сюжет фото:</div>
                <div className={s.infoBody}>
                  Тренер тримає борд, ніби запрошує приєднатися до тренування.
                  Кадр має створювати відчуття руху вперед і динаміки. Борд
                  використовується як ключовий елемент, що асоціюється з методом
                  BFB.
                </div>
              </div>
              <div className={s.infoBlock}>
                <div className={s.pill}>Кадр:</div>
                <div className={s.infoBody}>
                  Горизонтальний, з вільним простором зліва під текст.
                </div>
              </div>
              <div className={s.infoBlock}>
                <div className={s.pill}>Формат</div>
                <div className={s.infoBody}>
                  <p>
                    <strong className={s.strong}>Формат фото:</strong>
                  </p>
                  <ul>
                    <li>Горизонтальний формат.</li>
                    <li>
                      Фото повинно бути великим і займати значну частину екрана.
                    </li>
                    <li>
                      Залишати вільний простір зліва під текст (для зручного
                      розміщення <br /> заголовків або опису).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>1</div>
      </div>
    </section>
  );
};

export default PhotoOneBlock;
