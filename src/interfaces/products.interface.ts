export interface Product {
  id: string;
  index: number;
  code: string;
  name: string;
  releaseDate: string;
  price?: number | null;
  description: string;
  url: string;
  numberCards: number;
  show: boolean;
  status?: "active" | "deleted" | null;
  ProductImage: ProductImage[];
  deckId?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export type AdminProductListItem = {
  id: string;
  name: string;
  code: string;
  releaseDate: string;
  index: number;
  show: boolean;
  imageUrl?: string | null;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  code: string;
  releaseDate: string;
  description: string;
  url: string;
  index: number;
  numberCards: number;
  show: boolean;
  imageUrl?: string | null;
  deckId?: string | null;
  deckName?: string | null;
};
