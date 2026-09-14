import { prisma } from "@/lib/prisma";

export const eventStoreSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  address: true,
  country: true,
  lat: true,
  lgn: true,
} as const;

export const normalizeEventStoreIds = ({
  storeIds,
  storeId,
}: {
  storeIds?: string[] | null;
  storeId?: string | null;
}) => {
  const selected = storeIds?.length ? storeIds : storeId ? [storeId] : [];
  return Array.from(new Set(selected.filter(Boolean)));
};

export const orderEventStores = <T extends { id: string }>(
  storeIds: string[],
  stores: T[],
) => {
  const storeMap = new Map(stores.map((store) => [store.id, store]));
  return storeIds
    .map((storeId) => storeMap.get(storeId))
    .filter((store): store is T => Boolean(store));
};

export const resolveEventStores = async ({
  storeIds,
  storeId,
}: {
  storeIds?: string[] | null;
  storeId?: string | null;
}) => {
  const selectedStoreIds = normalizeEventStoreIds({ storeIds, storeId });

  if (selectedStoreIds.length === 0) {
    return [];
  }

  const stores = await prisma.store.findMany({
    where: { id: { in: selectedStoreIds } },
    select: eventStoreSelect,
  });

  return orderEventStores(selectedStoreIds, stores);
};
