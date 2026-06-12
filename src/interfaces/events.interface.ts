export type EventStatus = "draft" | "scheduled" | "published" | "deleted";

export type AdminEventListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: EventStatus;
  startsAt: string;
  endsAt?: string | null;
  badgeLabel?: string | null;
  storeId?: string | null;
  storeName?: string | null;
  createdAt: string;
};

export type EventDetail = AdminEventListItem & {
  shortSummary: string;
  content: string;
  featuredImage: string;
  cardImage: string;
};

export type EventImageOptions = {
  banners: string[];
  cards: string[];
};

export type PublicEventListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortSummary: string;
  cardImage: string;
  startsAt: string;
  endsAt?: string | null;
  badgeLabel?: string | null;
  storeCity?: string | null;
};

export type PublicEventDetail = PublicEventListItem & {
  content: string;
  featuredImage: string;
};
