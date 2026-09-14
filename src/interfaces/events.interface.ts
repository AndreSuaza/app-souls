export type EventStatus = "draft" | "scheduled" | "published" | "deleted";

export type EventStoreSummary = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  country: string;
  lat: number;
  lgn: number;
};

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
  storeIds: string[];
  storeName?: string | null;
  stores: EventStoreSummary[];
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
  storeCities: string[];
  stores: EventStoreSummary[];
};

export type PublicEventDetail = PublicEventListItem & {
  content: string;
  featuredImage: string;
  store: EventStoreSummary | null;
};
