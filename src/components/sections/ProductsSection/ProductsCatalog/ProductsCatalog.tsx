"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./ProductsCatalog.module.css";
import ProductsFilter from "../ProductsFilter/ProductsFilter";
import { useProducts } from "@/components/hooks/useProducts";
import FilterSortPanel, {
  type SortType,
} from "@/components/ui/FilterSortPanel/FilterSortPanel";
import ProductsCatalogContainer from "../ProductsCatalogContainer/ProductsCatalogContainer";
// Видалено useProductsQuery імпорт
import {
  useFilteredProducts,
  type ProductFilters,
} from "@/components/hooks/useFilteredProducts";
// import { ProductsNewShowcase } from "@/components/ProductsShowcase/ProductsNewShowcase";
import { ProductsShowcase } from "@/components/ProductsShowcase/ProductsShowcase";
import { fetchWcCategories } from "@/lib/bfbApi";
import { mapSortTypeToWcParams } from "@/lib/sortMapping";
import { useWcCategoriesQuery } from "@/components/hooks/useWpQueries";

const ProductsCatalog = () => {
  const { filters, updateFilters, resetFilters } = useProducts();
  // Видалено useProductsQuery, використовуємо тільки useFilteredProducts

  const [appliedWcFilters, setAppliedWcFilters] =
    useState<Partial<ProductFilters> | null>({
      category: ["30", "85", "86", "87"],
    }); // Показуємо товари з категорій: Товари для спорту (30) та Інвентар (85, 86, 87)
  const [catalogTitle, setCatalogTitle] = useState<string>("Каталог товарів");
  const [sortBy, setSortBy] = useState<SortType>("popular");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const appliedCategoryRef = useRef<string | string[] | undefined>(
    appliedWcFilters?.category
  );

  useEffect(() => {
    appliedCategoryRef.current = appliedWcFilters?.category;
  }, [appliedWcFilters?.category]);

  // Слухаємо зміну ?category=<slug|id> у URL і застосовуємо фільтр
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.get("category");
    if (!q) {
      setCatalogTitle("Каталог товарів");
      // Скидаємо фільтри при переході на /products без category
      resetFilters();
      // Встановлюємо дефолтні категорії
      setAppliedWcFilters({ category: ["30", "85", "86", "87"] });
      return;
    }

    if (/^\d+$/.test(q)) {
      if (q !== appliedCategoryRef.current) {
        setAppliedWcFilters({ category: q });
        // Скидаємо локальні фільтри при зміні категорії
        resetFilters();
      }
      if (q === "30") {
        setCatalogTitle("Товари для спорту");
      } else if (q === appliedCategoryRef.current) {
        // Якщо це та сама категорія, зберігаємо попередній заголовок
      } else {
        // Шукаємо в закешованих даних
        const allCategories = [
          ...(categories85 || []),
          ...(categories77 || []),
        ];
        const byId = allCategories.find((c) => String(c.id) === q);
        if (byId?.name) setCatalogTitle(byId.name);
      }
      return;
    }

    (async () => {
      try {
        // Мапа відомих slug категорій до їх ID та назв
        const knownCategorySlugs: Record<string, { id: string; name: string }> = {
          "inventory-accessories": { id: "87", name: "Аксесуари" },
          "inventory-boards": { id: "86", name: "Борди" },
          "inventory": { id: "85", name: "Інвентар" },
          "for-sport": { id: "30", name: "Товари для спорту" },
        };

        // Спочатку перевіряємо мапу відомих slug
        if (knownCategorySlugs[q]) {
          const category = knownCategorySlugs[q];
          if (category.id !== appliedCategoryRef.current) {
            setAppliedWcFilters({ category: category.id });
            resetFilters();
          }
          setCatalogTitle(category.name);
          return;
        }

        // Якщо не знайшли в мапі, шукаємо в закешованих даних
        let found = (categories85 || []).find((c) => c.slug === q);

        // Якщо не знайшли в інвентарі, шукаємо в інших категоріях
        if (!found) {
          found = (categories77 || []).find((c) => c.slug === q);
        }

        if (found) {
          if (String(found.id) !== appliedCategoryRef.current) {
            setAppliedWcFilters({ category: String(found.id) });
            // Скидаємо локальні фільтри при зміні категорії
            resetFilters();
          }
          setCatalogTitle(found.name || "Товари для спорту");
        } else {
          // Якщо не знайшли за slug, спробуємо використати q як ID або slug напряму
          if (q !== appliedCategoryRef.current) {
            setAppliedWcFilters({ category: q });
            // Скидаємо локальні фільтри при зміні категорії
            resetFilters();
          }
          setCatalogTitle("Каталог товарів");
        }
      } catch {
        if (q !== appliedCategoryRef.current) {
          setAppliedWcFilters({ category: q });
          // Скидаємо локальні фільтри при зміні категорії
          resetFilters();
        }
        setCatalogTitle("Товари для спорту");
      }
    })();
  }, [searchParams]);
  // Формуємо фільтри з сортуванням та пагінацією
  const wcFiltersWithSort = useMemo(() => {
    const sortParams = mapSortTypeToWcParams(sortBy);
    return {
      ...(appliedWcFilters ?? {}),
      orderby: sortParams.orderby,
      order: sortParams.order,
      per_page: itemsPerPage,
      ...(sortParams.on_sale !== undefined && { on_sale: sortParams.on_sale }),
    };
  }, [appliedWcFilters, sortBy, itemsPerPage]);

  // Оптимізовані запити на категорії з кешуванням
  const { data: categories85 = [] } = useWcCategoriesQuery(85); // Інвентар
  const { data: categories77 = [] } = useWcCategoriesQuery(77); // Інші категорії

  const {
    data: wcFilteredProducts = [],
    isLoading,
    isError,
  } = useFilteredProducts(wcFiltersWithSort);

  type FilterProduct = {
    id?: string | number;
    name?: string;
    price?: string | number;
    regularPrice?: string | number;
    salePrice?: string | number;
    onSale?: boolean;
    image?: string;
    categories?: Array<{ id: number; name: string; slug: string }>;
    stockStatus?: string;
    dateCreated?: string;
  };
  const wcFilteredProductsForFilter = (
    wcFilteredProducts as FilterProduct[]
  ).map((p) => ({
    id: String(p.id ?? ""),
    name: p.name ?? "",
    price: String(p.price ?? "0"),
    regularPrice: String(p.regularPrice ?? ""),
    salePrice: String(p.salePrice ?? ""),
    onSale: Boolean(p.onSale),
    image: p.image ?? "",
    categories: p.categories ?? [],
    stockStatus: String(p.stockStatus ?? ""),
    dateCreated: p.dateCreated,
  }));

  const searchTerm = "";

  // Функція для побудови WC фільтрів з локальних фільтрів
  const buildWcFilters = (
    localFilters: typeof filters
  ): Partial<ProductFilters> => {
    const params: Partial<ProductFilters> = {};
    const categoryId =
      localFilters.certification && String(localFilters.certification);
    if (categoryId) {
      params.category = [categoryId];
    }
    if (localFilters.colors && localFilters.colors.length > 0) {
      params.attribute = params.attribute || [];
      params.attribute_term = params.attribute_term || [];
      localFilters.colors.forEach((termId) => {
        (params.attribute as string[]).push("pa_color");
        (params.attribute_term as string[]).push(String(termId));
      });
    }
    if (localFilters.sizes && localFilters.sizes.length > 0) {
      params.attribute = params.attribute || [];
      params.attribute_term = params.attribute_term || [];
      localFilters.sizes.forEach((slug) => {
        (params.attribute as string[]).push("pa_size");
        (params.attribute_term as string[]).push(slug);
      });
    }
    if (typeof localFilters.priceMin === "number" && localFilters.priceMin > 0)
      params.min_price = localFilters.priceMin;
    if (
      typeof localFilters.priceMax === "number" &&
      localFilters.priceMax > 0 &&
      localFilters.priceMax < 100000
    )
      params.max_price = localFilters.priceMax;
    return params;
  };

  // Функція для скидання фільтрів зі збереженням категорії
  const handleReset = () => {
    resetFilters();

    // Зберігаємо поточну категорію з URL
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      // Якщо є категорія в URL, залишаємо її
      if (/^\d+$/.test(categoryParam)) {
        // Якщо це ID категорії
        setAppliedWcFilters({ category: categoryParam });
      } else {
        // Якщо це slug, потрібно знайти ID серед ВСІХ категорій
        (async () => {
          try {
            // Використовуємо закешовані дані
            let found = (categories85 || []).find(
              (c) => c.slug === categoryParam
            );

            // Якщо не знайшли в інвентарі, шукаємо в інших категоріях
            if (!found) {
              found = (categories77 || []).find(
                (c) => c.slug === categoryParam
              );
            }
            if (found) {
              setAppliedWcFilters({ category: String(found.id) });
            } else {
              setAppliedWcFilters({ category: categoryParam });
            }
          } catch {
            setAppliedWcFilters({ category: categoryParam });
          }
        })();
      }
    } else {
      // Якщо немає категорії в URL, завжди скидаємо на дефолтні категорії (всі товари)
      setAppliedWcFilters({
        category: ["30", "85", "86", "87"],
      });
    }
  };

  return (
    <div className={styles.productsCatalog}>
      <div className={styles.catalogContentBlock}>
        {/* <ProductsNewShowcase /> */}
        <ProductsShowcase title="Товари для спорту" />
        <div className={styles.catalogContentContainer}>
          <FilterSortPanel
            filters={filters}
            onFiltersChange={(newFilters) => updateFilters(newFilters)}
            onReset={handleReset}
            products={wcFilteredProductsForFilter}
            onApply={() => {
              // Використовуємо той самий onApply що і в ProductsFilter
              const wcFilters = buildWcFilters(filters);
              setAppliedWcFilters(wcFilters as Partial<ProductFilters>);
            }}
            sortBy={sortBy}
            onSortChange={setSortBy}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
          <div className={styles.catalogContent}>
            <ProductsFilter
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={handleReset}
              products={wcFilteredProductsForFilter}
              searchTerm={searchTerm}
              loading={isLoading}
              onApply={(params) => {
                // Зберігаємо поточні категорії та додаємо фільтри
                setAppliedWcFilters({
                  ...appliedWcFilters,
                  ...params,
                } as Partial<ProductFilters>);
              }}
            />
            <ProductsCatalogContainer
              block={{
                subtitle: "Наші товари",
                title: catalogTitle,
              }}
              filteredProducts={wcFilteredProducts}
              isNoCertificationFilter={appliedWcFilters?.category === "78"}
              selectedCertificationFilter={
                Array.isArray(appliedWcFilters?.category)
                  ? appliedWcFilters.category[0]
                  : appliedWcFilters?.category
              }
              isLoading={isLoading}
            />
            {/* {isError && (
              <div className={styles.error}>Не вдалося завантажити товари</div>
            )} */}
            {isLoading && <div className={styles.loading}>Завантаження…</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsCatalog;
