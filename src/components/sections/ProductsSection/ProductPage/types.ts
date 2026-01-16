export interface ProductImage {
  src: string;
  alt?: string;
}

export interface ProductVariationAttribute {
  id: number;
  name: string;
  slug: string;
  options: string[];
}

export interface ProductVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  attributes: Array<{
    id: number;
    name: string;
    slug: string;
    option: string;
  }>;
}

export interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  productType?: string;
  variations?: number[];
  price: number;
  originalPrice?: number;
  discount: number;
  isNew: boolean;
  isHit: boolean;
  image: string;
  category: string;
  stockStatus: string;
}

export type StockStatus = "instock" | "outofstock" | "onbackorder";

export interface ProductLike {
  id: number | string;
  slug?: string;
  name: string;
  type?: string;
  variations?: number[];
  price?: string | number;
  regularPrice?: string | number;
  onSale?: boolean;
  images?: Array<{ src: string }>;
  categories?: Array<{ name: string }>;
  stockQuantity?: number | null;
  stockStatus?: string;
  dateCreated?: string;
  total_sales?: number | string;
  isNew?: boolean;
  isHit?: boolean;
}

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  isMobile: boolean;
  isActuallyNew: boolean;
  hasDiscount: boolean;
  totalDiscount: number;
  isActuallyHit: boolean;
}

export interface ProductVariationsProps {
  productType?: string;
  attributes?: ProductVariationAttribute[];
  images: ProductImage[];
  variationsData: ProductVariation[];
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
}

import type { Product } from "@/lib/products";

export interface ProductActionsProps {
  product: Product | null;
  selectedVariation: ProductVariation | null;
  isLoggedIn: boolean;
  isMobile: boolean;
  isBoardProduct: boolean;
  isAvailable: boolean;
  stockStatusText: string;
  isControlsDisabled: boolean;
  cartQuantity: number;
  selectedImageIndex: number;
  onRegisterOpen: () => void;
}

export interface ProductInfoProps {
  product: Product;
  variationsData: ProductVariation[];
  attributes?: ProductVariationAttribute[];
  selectedVariation: ProductVariation | null;
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
  isActuallyHit: boolean;
  isMobile: boolean;
  isLoggedIn: boolean;
  isBoardProduct: boolean;
  isAvailable: boolean;
  stockStatusText: string;
  isControlsDisabled: boolean;
  cartQuantity: number;
  variationsLoading: boolean;
  finalPrice: number;
  originalPrice: number;
  shouldShowOldPrice: boolean;
  onRegisterOpen: () => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
}

export interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  productType?: string;
  variations?: number[];
  price: number;
  originalPrice?: number;
  discount: number;
  isNew: boolean;
  isHit: boolean;
  image: string;
  category: string;
  stockStatus: string;
}

export interface RelatedProductsProps {
  relatedCategoryProducts: ProductLike[];
  isMobile: boolean;
}
