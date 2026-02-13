export type NewsStatus = "draft" | "scheduled" | "published";

export type NewsCategoryOption = {
  id: string;
  name: string;
  image: string;
};

export type AdminNewsListItem = {
  id: string;
  title: string;
  subtitle: string;
  status: NewsStatus;
  publishedAt?: string | null;
  userId: string;
  newCategoryId: string;
  createdAt: string;
};

export type NewsDetail = {
  id: string;
  title: string;
  subtitle: string;
  shortSummary: string;
  content: string;
  featuredImage: string;
  publishedAt?: string | null;
  status: NewsStatus;
  tags: string[];
  userId: string;
  newCategoryId: string;
};
