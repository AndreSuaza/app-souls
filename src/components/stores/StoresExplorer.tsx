"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { PaginationLine } from "@/components";
import { getStoresByDistanceAction } from "@/actions";
import { StoreListCard } from "./StoreListCard";
import { StoresMap } from "./StoresMap";

interface StoreItem {
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
}

interface StoresData {
  stores: StoreItem[];
  markers: StoreItem[];
  totalCount: number;
  perPage: number;
  totalPage: number;
  currentPage: number;
}

interface Props {
  initialData: StoresData;
  initialPosition: { lat: number; lng: number };
}

const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;
const COLOMBIA_CENTER = { lat: 4.5709, lng: -74.2973 };

export function StoresExplorer({ initialData, initialPosition }: Props) {
  const [data, setData] = useState<StoresData>(initialData);
  const [position, setPosition] = useState(initialPosition);
  const [mapCenter] = useState(COLOMBIA_CENTER);
  const [isPending, startTransition] = useTransition();
  const lastPositionRef = useRef(initialPosition);

  const loadStores = useCallback(
    (page: number, nextPosition: { lat: number; lng: number }) => {
      startTransition(async () => {
        const result = await getStoresByDistanceAction({
          lat: nextPosition.lat,
          lng: nextPosition.lng,
          page,
          perPage: initialData.perPage,
        });
        setData(result);
      });
    },
    [initialData.perPage, startTransition],
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Evita reordenar si la ubicación es casi igual al fallback.
        const deltaLat = Math.abs(next.lat - lastPositionRef.current.lat);
        const deltaLng = Math.abs(next.lng - lastPositionRef.current.lng);
        if (deltaLat < 0.0001 && deltaLng < 0.0001) return;

        lastPositionRef.current = next;
        setPosition(next);
        loadStores(1, next);
      },
      () => {
        // Si el usuario niega permisos, se mantiene el fallback inicial.
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [loadStores]);

  const handlePageChange = (page: number) => {
    loadStores(page, position);
  };

  return (
    <section className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div>
        <div className="grid min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
          <aside className="order-2 flex h-full min-h-[calc(100vh-72px)] flex-col overflow-hidden border border-slate-200 bg-white/90 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface/90 lg:order-1 lg:min-h-0">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 text-lg font-semibold text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white">
              Tiendas
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {data.stores.map((store) => (
                  <StoreListCard key={store.id} store={store} />
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
              <PaginationLine
                totalPages={data.totalPage}
                currentPage={data.currentPage}
                pathname=""
                searchParams={EMPTY_SEARCH_PARAMS}
                onPageChange={handlePageChange}
              />
            </div>
          </aside>

          <div className="order-1 relative h-[60vh] overflow-hidden border border-slate-200 shadow-sm dark:border-tournament-dark-border lg:order-2 lg:h-full">
            <StoresMap
              center={mapCenter}
              zoom={5}
              markers={data.markers}
              className={`h-full w-full ${isPending ? "opacity-80" : ""}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
