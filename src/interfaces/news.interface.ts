export type NewsStatus = "draft" | "scheduled" | "published" | "deleted";

export type NewsCategoryOption = {
  id: string;
  name: string;
};

export type AdminNewsListItem = {
  id: string;
  title: string;
  subtitle: string;
  status: NewsStatus;
  publishedAt?: string | null;
  userId: string;
  newCategoryId: string;
  authorName?: string | null;
  categoryName?: string | null;
  createdAt: string;
};

export type NewsDetail = {
  id: string;
  title: string;
  subtitle: string;
  shortSummary: string;
  content: string;
  featuredImage: string;
  cardImage: string;
  publishedAt?: string | null;
  status: NewsStatus;
  tags: string[];
  userId: string;
  newCategoryId: string;
  authorName?: string | null;
  categoryName?: string | null;
};

export type NewsImageOptions = {
  banners: string[];
  cards: string[];
};

export type PublicNewsCard = {
  id: string;
  title: string;
  shortSummary: string;
  featuredImage: string;
  cardImage: string;
  publishedAt?: string | null;
  newCategoryId: string;
  categoryName?: string | null;
};

export type PublicNewsListItem = {
  id: string;
  title: string;
  subtitle: string;
  shortSummary: string;
  cardImage: string;
  publishedAt?: string | null;
  createdAt: string;
  newCategoryId: string;
  categoryName?: string | null;
  tags: string[];
};

export type PublicNewsDetail = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  featuredImage: string;
  cardImage: string;
  publishedAt?: string | null;
  newCategoryId: string;
  categoryName?: string | null;
  shortSummary: string;
};
