"use client";
import React from "react";
import Image from "next/image";
import s from "./PhotoTenBlock.module.css";

const PhotoTenBlock: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Інструкторство — зйомка з Лікою</h2>

        <div className={s.row}>
          <div className={s.leftTop}>
            <div className={s.pill}>Ціль:</div>
            <div className={s.boxBody}>
              Показати, що інструкторство в BFB — це не лише навчання техніці, а
              й робота з людьми, підтримка та створення атмосфери єдності.
            </div>
          </div>
          <div className={s.rightTop}>
            <div className={s.pill}>Формат зйомки:</div>
            <div className={s.boxBody}>
              <ul>
                <li>
                  Запланувати 3–4 різні фотографії з різних локацій і з різним
                  інвентарем.
                </li>
                <li>Формат: горизонтальний і вертикальний.</li>
                <li>Акцент — на засновниці BFB, Ліці.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={s.row}>
          <div className={s.leftBottom}>
            <div className={s.photoWrap}>
              <Image
                src="/images/ScreenshotTen.png"
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
                <div className={s.pill}>Варіанти фото</div>
                <div className={s.infoBody}>
                  <ul>
                    <li>
                      1. Ліка на борді
                      <ul>
                        <li>
                          Стоїть у балансі, легка усмішка, погляд у камеру.
                        </li>
                        <li>Локація: світлий зал, видно інші борди на фоні.</li>
                        <li>Мета: показати, що особисто практикує методику.</li>
                      </ul>
                    </li>
                    <li>
                      2. Ліка з інвентарем (резинки, гантелі)
                      <ul>
                        <li>Тримає інвентар, пояснює або показує вправу.</li>
                        <li>
                          Локація: зал або студія з брендованими елементами.
                        </li>
                        <li>Мета: підкреслити її експертність.</li>
                      </ul>
                    </li>
                    <li>
                      3. Ліка у процесі навчання
                      <ul>
                        <li>
                          Взаємодіє з групою, показує або допомагає учням.
                        </li>
                        <li>Локація: тренувальний простір з учнями на фоні.</li>
                        <li>Мета: створити відчуття реальної атмосфери BFB.</li>
                      </ul>
                    </li>
                    <li>
                      4. Ліка у форматі «Q&A»
                      <ul>
                        <li>
                          Сидить або стоїть біля борду, спокійна поза,
                          ноутбук/телефон.
                        </li>
                        <li>Локація: затишне місце (офіс, студія).</li>
                        <li>
                          Мета: асоціація з відповідями на питання користувачів.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.pageBadge}>10</div>
      </div>
    </section>
  );
};

export default PhotoTenBlock;
