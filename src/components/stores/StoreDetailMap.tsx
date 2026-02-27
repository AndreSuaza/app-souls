"use client";

import { useCallback, useRef } from "react";
import { IoNavigateOutline } from "react-icons/io5";
import { StoresMap } from "./StoresMap";

interface StoreMarker {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
  lat: number;
  lgn: number;
}

interface Props {
  store: StoreMarker;
}

export function StoreDetailMap({ store }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  // Se deja preparado para habilitar la ubicacion en el futuro.
  // const userMarkerRef = useRef<google.maps.Marker | null>(null);
  // const [isLocating, setIsLocating] = useState(false);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // const handleLocate = () => {
  //   if (!navigator.geolocation) return;
  //   if (!mapRef.current) return;
  //
  //   setIsLocating(true);
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       const position = {
  //         lat: pos.coords.latitude,
  //         lng: pos.coords.longitude,
  //       };
  //
  //       // Centra el mapa en la ubicacion actual para ayudar al usuario.
  //       mapRef.current?.setCenter(position);
  //       mapRef.current?.setZoom(14);
  //
  //       if (!userMarkerRef.current) {
  //         userMarkerRef.current = new google.maps.Marker({
  //           map: mapRef.current,
  //           position,
  //           title: "Mi ubicacion",
  //         });
  //       } else {
  //         userMarkerRef.current.setPosition(position);
  //       }
  //
  //       setIsLocating(false);
  //     },
  //     () => {
  //       setIsLocating(false);
  //     },
  //     { enableHighAccuracy: true, timeout: 8000 },
  //   );
  // };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lgn}`;

  return (
    <div className="relative h-full w-full">
      <StoresMap
        center={{ lat: store.lat, lng: store.lgn }}
        markers={[store]}
        className="h-full w-full"
        onMapReady={handleMapReady}
      />

      <div className="absolute right-4 top-4 flex flex-col gap-2">
        {/*
          Boton de mi ubicacion deshabilitado por ahora.
          Se deja comentado para habilitarlo en el futuro.
        */}
        {/*
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed dark:border-tournament-dark-border dark:bg-tournament-dark-surface/90 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
        >
          <IoLocateOutline className="text-purple-600 dark:text-purple-300" />
          Mi ubicacion
        </button>
        */}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-purple-600 bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-500"
        >
          <IoNavigateOutline />
          Como llegar
        </a>
      </div>
    </div>
  );
}
