import React, { Suspense } from "react";

import ProductsCatalog from "../../components/sections/ProductsSection/ProductsCatalog/ProductsCatalog";

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<div>Завантаження…</div>}>
      <ProductsCatalog />
    </Suspense>
  );
}
