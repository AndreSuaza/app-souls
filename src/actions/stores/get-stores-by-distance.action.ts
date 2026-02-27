"use server";

import { prisma } from "@/lib/prisma";
import {
  StoresByDistanceSchema,
  type StoresByDistanceInput,
} from "@/schemas";

type StoreResult = {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
  phone: string;
  lat: number;
  lgn: number;
  url: string;
  distanceKm: number;
};

const toRad = (value: number) => (value * Math.PI) / 180;

const calculateDistanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) => {
  // Distancia Haversine en KM para ordenar por cercanía.
  const earthRadius = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

export const getStoresByDistanceAction = async (
  input: StoresByDistanceInput,
) => {
  try {
    const { page, perPage, lat, lng } = StoresByDistanceSchema.parse(input);

    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        country: true,
        phone: true,
        lat: true,
        lgn: true,
        url: true,
      },
    });

    const mapped: StoreResult[] = stores
      .filter((store) => store.lat != null && store.lgn != null)
      .map((store) => ({
        ...store,
        distanceKm: calculateDistanceKm(lat, lng, store.lat, store.lgn),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const totalCount = mapped.length;
    const totalPage = Math.max(1, Math.ceil(totalCount / perPage));
    const currentPage = Math.min(page, totalPage);
    const start = (currentPage - 1) * perPage;

    return {
      stores: mapped.slice(start, start + perPage),
      markers: mapped,
      totalCount,
      perPage,
      totalPage,
      currentPage,
    };
  } catch (error) {
    throw new Error(`No se pudo cargar las tiendas ${error}`);
  }
};
