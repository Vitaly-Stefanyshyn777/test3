import ProductPage from "@/components/sections/ProductsSection/ProductPage/ProductPage";
import React from "react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPageRoute({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductPage productSlug={slug} />;
}
