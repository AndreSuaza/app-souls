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
  ProductImage: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}
