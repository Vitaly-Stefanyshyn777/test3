"use client";
import React, { memo } from "react";
import Badge from "@/components/ui/Badge/Badge";
import { formatPrice } from "@/lib/priceUtils";
import ProductVariations from "./ProductVariations";
import ProductActions from "./ProductActions";
import styles from "./ProductPage.module.css";
import type { Product } from "@/lib/products";
import type { ProductInfoProps } from "./types";
import { СhevronIcon } from "@/components/Icons/Icons";

const ProductInfo = memo(function ProductInfo({
  product,
  variationsData,
  attributes,
  selectedVariation,
  selectedImageIndex,
  onImageSelect,
  isActuallyHit,
  isMobile,
  isLoggedIn,
  isBoardProduct,
  isAvailable,
  stockStatusText,
  isControlsDisabled,
  cartQuantity,
  variationsLoading,
  finalPrice,
  originalPrice,
  shouldShowOldPrice,
  onRegisterOpen,
  expandedSections,
  onToggleSection,
}: ProductInfoProps) {
  return (
    <div className={styles.productInfo}>
      <div className={styles.productInfoBlock}>
        <div className={styles.categoryTagBlock}>
          <div className={styles.categoryTag}>
            {product.categories?.[0]?.name || "Без категорії"}
          </div>
          <div className={styles.titleWithBadges}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.productBadges}>
              {isActuallyHit && <Badge variant="hit" />}
            </div>
          </div>
          {product.shortDescription?.trim() && (
            <p className={styles.productText}>
              <span
                dangerouslySetInnerHTML={{
                  __html: product.shortDescription.trim(),
                }}
              />
            </p>
          )}
        </div>

        {/* Варіації продукту */}
        <ProductVariations
          productType={product.wcProduct?.type}
          attributes={attributes}
          images={product.images || []}
          variationsData={variationsData}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={onImageSelect}
        />

        {/* Ціна та дії */}
        <div className={styles.currenInfoBlock}>
          <div className={styles.priceSection}>
            {variationsLoading ? (
              <>
                <div
                  className={`${styles.skeleton} ${styles.skeletonPrice}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonOriginalPrice}`}
                ></div>
              </>
            ) : (
              <>
                <div className={styles.currentPrice}>
                  {formatPrice(finalPrice)}
                </div>
                {shouldShowOldPrice && (
                  <div className={styles.originalPrice}>
                    {formatPrice(originalPrice)}
                  </div>
                )}
              </>
            )}
          </div>

          <ProductActions
            product={product}
            selectedVariation={selectedVariation}
            isLoggedIn={isLoggedIn}
            isMobile={isMobile}
            isBoardProduct={isBoardProduct}
            isAvailable={isAvailable}
            stockStatusText={stockStatusText}
            isControlsDisabled={isControlsDisabled}
            cartQuantity={cartQuantity}
            selectedImageIndex={selectedImageIndex}
            onRegisterOpen={onRegisterOpen}
          />
        </div>

        {/* Розгорнути секції з інформацією про товар */}
        <div className={styles.expandableSections}>
          {/* Опис товару - завжди відкритий */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionHeaderText}>Опис товару</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.sectionContentText}>
                {product?.description?.trim() ||
                product?.shortDescription?.trim() ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description?.trim() ||
                        product.shortDescription?.trim() ||
                        "",
                    }}
                  />
                ) : (
                  <p>Опис товару відсутній</p>
                )}
              </div>
            </div>
          </div>

          {/* Доставка */}
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => onToggleSection("delivery")}
            >
              <span className={styles.sectionHeaderText}>Доставка</span>
              <span
                className={`${styles.chevron} ${
                  expandedSections.delivery ? "" : styles.rotated
                }`}
              >
                <СhevronIcon />
              </span>
            </button>
            {expandedSections.delivery && (
              <div className={styles.sectionContent}>
                <div className={styles.sectionContentText}>
                  <p className={styles.sectionContentTextOne}>
                    Нова пошта – доставка у відділення або кур'єром за 1–3 дні.{" "}
                    <br />
                    Укрпошта - бюджетний варіант доставки, термін 2-5
                    <br />
                    Самовивіз (за наявності шоуруму) - уточнюйте локацію. <br />
                  </p>
                  <p className={styles.sectionContentTextTwo}>
                    {" "}
                    Для уточнень звертайтесь в Instagram.{" "}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Оплата */}
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => onToggleSection("payment")}
            >
              <span className={styles.sectionHeaderText}>Оплата</span>
              <span
                className={`${styles.chevron} ${
                  expandedSections.payment ? "" : styles.rotated
                }`}
              >
                <СhevronIcon />
              </span>
            </button>
            {expandedSections.payment && (
              <div className={styles.sectionContent}>
                <p className={styles.sectionContentText}>
                  Онлайн-оплата – банківською карткою Visa/MasterCard. <br />{" "}
                  Оплата при отриманні (накладений платіж) – можливість огляду
                  перед покупкою. <br /> Оплата через Apple Pay / Google Pay –
                  швидко та зручно.
                </p>
              </div>
            )}
          </div>

          {/* Обмін та повернення */}
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => onToggleSection("return")}
            >
              <span className={styles.sectionHeaderText}>
                Обмін та повернення
              </span>
              <span
                className={`${styles.chevron} ${
                  expandedSections.return ? "" : styles.rotated
                }`}
              >
                <СhevronIcon />
              </span>
            </button>
            {expandedSections.return && (
              <div className={styles.sectionContent}>
                <p className={styles.sectionContentText}>
                  Обмін та повернення можливі протягом 14 днів відповідно до
                  Закону України «Про захист прав споживачів».
                </p>
                <p className={styles.sectionContentText}>
                  Товари без слідів носіння, зі збереженими бирками та в
                  оригінальній упаковці можна повернути. Доставка повернення -
                  за рахунок покупця, якщо товар не має браку.
                </p>
              </div>
            )}
          </div>

          {/* Характеристики */}
          <div className={styles.sectionCharacteristics}>
            <button
              className={styles.sectionHeader}
              onClick={() => onToggleSection("characteristics")}
            >
              <span className={styles.sectionHeaderText}>Характеристики</span>
              <span
                className={`${styles.chevron} ${
                  expandedSections.characteristics ? "" : styles.rotated
                }`}
              >
                <СhevronIcon />
              </span>
            </button>
            {expandedSections.characteristics && (
              <div className={styles.sectionContent}>
                <div className={styles.sectionContentBlock}>
                  {(product.dimensions?.length?.trim() ||
                    product.dimensions?.width?.trim() ||
                    product.dimensions?.height?.trim() ||
                    product.weight?.trim()) && (
                    <>
                      <div className={styles.characteristicsTitle}>
                        Габарити та вага:
                      </div>
                      <div className={styles.characteristics}>
                        {product.dimensions?.length?.trim() && (
                          <div className={styles.characteristic}>
                            <span>Довжина:</span>
                            <span
                              style={{
                                textAlign: "center",
                                color: "#0e0e0e",
                              }}
                            >
                              {product.dimensions.length} см
                            </span>
                          </div>
                        )}
                        {product.dimensions?.width?.trim() && (
                          <div className={styles.characteristic}>
                            <span>Ширина:</span>
                            <span
                              style={{
                                textAlign: "center",
                                color: "#0e0e0e",
                              }}
                            >
                              {product.dimensions.width} см
                            </span>
                          </div>
                        )}
                        {product.dimensions?.height?.trim() && (
                          <div className={styles.characteristic}>
                            <span>Висота:</span>
                            <span
                              style={{
                                textAlign: "center",
                                color: "#0e0e0e",
                              }}
                            >
                              {product.dimensions.height} см
                            </span>
                          </div>
                        )}
                        {product.weight?.trim() && (
                          <div className={styles.characteristic}>
                            <span>Вага:</span>
                            <span
                              style={{
                                textAlign: "center",
                                color: "#0e0e0e",
                              }}
                            >
                              {product.weight} кг
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductInfo.displayName = "ProductInfo";

export default ProductInfo;
