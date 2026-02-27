"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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
  center: { lat: number; lng: number };
  markers: StoreMarker[];
  className?: string;
}

export function StoresMap({ center, markers, className }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const initialCenterRef = useRef(center);
  const storefrontIcon = useMemo(
    () =>
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#7c3aed" d="M480 448h-12a4 4 0 0 1-4-4V273.51a4 4 0 0 0-5.24-3.86 104.92 104.92 0 0 1-28.32 4.78c-1.18 0-2.3.05-3.4.05a108.22 108.22 0 0 1-52.85-13.64 8.23 8.23 0 0 0-8 0 108.18 108.18 0 0 1-52.84 13.64 106.11 106.11 0 0 1-52.46-13.79 8.21 8.21 0 0 0-8.09 0 108.14 108.14 0 0 1-53.16 13.8 106.19 106.19 0 0 1-52.77-14 8.25 8.25 0 0 0-8.16 0 106.19 106.19 0 0 1-52.77 14c-1.09 0-2.19 0-3.37-.05h-.06a104.91 104.91 0 0 1-29.28-5.09 4 4 0 0 0-5.23 3.8V444a4 4 0 0 1-4 4H32.5c-8.64 0-16.1 6.64-16.48 15.28A16 16 0 0 0 32 480h447.5c8.64 0 16.1-6.64 16.48-15.28A16 16 0 0 0 480 448zm-256-68a4 4 0 0 1-4 4h-88a4 4 0 0 1-4-4v-64a12 12 0 0 1 12-12h72a12 12 0 0 1 12 12zm156 68h-72a4 4 0 0 1-4-4V316a12 12 0 0 1 12-12h56a12 12 0 0 1 12 12v128a4 4 0 0 1-4 4zm112.57-277.72-42.92-98.49C438.41 47.62 412.74 32 384.25 32H127.7c-28.49 0-54.16 15.62-65.4 39.79l-42.92 98.49c-9 19.41 2.89 39.34 2.9 39.35l.28.45c.49.78 1.36 2 1.89 2.78.05.06.09.13.14.2l5 6.05a7.45 7.45 0 0 0 .6.65l5 4.83.42.36a69.65 69.65 0 0 0 9.39 6.78v.05a74 74 0 0 0 36 10.67h2.47a76.08 76.08 0 0 0 51.89-20.31l.33-.31a7.94 7.94 0 0 1 10.89 0l.33.31a77.3 77.31 0 0 0 104.46 0 8 8 0 0 1 10.87 0 77.31 77.31 0 0 0 104.21.23 7.88 7.88 0 0 1 10.71 0 76.81 76.81 0 0 0 52.31 20.08h2.49a71.35 71.35 0 0 0 35-10.7c.95-.57 1.86-1.17 2.78-1.77A71.33 71.33 0 0 0 488 212.17l1.74-2.63q.26/.4.48-.84c1.66-3.38 10.56-20.76 2.35-38.42z"/></svg>`,
      ),
    [],
  );

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps");

      mapInstanceRef.current = new Map(mapRef.current, {
        center: initialCenterRef.current,
        zoom: 13,
        mapId: "MY_NEXTJS_MAPID",
      });

      infoWindowRef.current = new google.maps.InfoWindow();

      const styleId = "stores-map-infowindow";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        // Oculta el cierre por defecto para usar el nuestro en el header.
        style.textContent = `
          .gm-ui-hover-effect { display: none !important; }
          .gm-style-iw-c { padding: 0 !important; border-radius: 16px !important; box-shadow: none !important; }
          .gm-style-iw-d { overflow: hidden !important; max-height: none !important; }
          .gm-style-iw-ch, .gm-style-iw-chr { display: none !important; height: 0 !important; }
          .gm-style-iw-t::before, .gm-style-iw-t::after { display: none !important; }
        `;
        document.head.appendChild(style);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setCenter(center);

    // Limpia los marcadores previos antes de dibujar los nuevos.
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const infoWindow = infoWindowRef.current;

    markers.forEach((store) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: store.lat, lng: store.lgn },
        title: store.name,
        icon: {
          url: `data:image/svg+xml;utf8,${storefrontIcon}`,
          scaledSize: new google.maps.Size(30, 30),
        },
      });

      marker.addListener("click", () => {
        if (!infoWindow) return;
        const content = document.createElement("div");
        content.className =
          "relative min-w-[240px] rounded-lg border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-xl";

        const close = document.createElement("button");
        close.type = "button";
        close.className =
          "absolute right-3 top-3 text-lg font-semibold text-slate-400 transition hover:text-slate-600";
        close.textContent = "×";
        close.addEventListener("click", () => {
          infoWindow.close();
        });

        const title = document.createElement("p");
        title.className = "text-center text-base font-semibold text-slate-900";
        title.textContent = store.name;

        const locationRow = document.createElement("div");
        locationRow.className =
          "mt-3 flex items-start gap-2 text-xs text-slate-500";

        const locationIcon = document.createElement("span");
        locationIcon.className = "text-purple-600";
        locationIcon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor"><path d="M256 48c-79.53 0-144 64.47-144 144 0 68.38 102.53 209.88 132.67 250.12a16 16 0 0 0 22.66 0C297.47 401.88 400 260.38 400 192c0-79.53-64.47-144-144-144zm0 208a64 64 0 1 1 64-64 64.07 64.07 0 0 1-64 64z"/></svg>';

        const locationText = document.createElement("div");
        locationText.className = "space-y-0.5";

        const city = document.createElement("p");
        city.textContent = `${store.city}, ${store.country}`;

        const address = document.createElement("p");
        address.className = "text-[11px] text-slate-400";
        address.textContent = store.address;

        locationText.appendChild(city);
        locationText.appendChild(address);
        locationRow.appendChild(locationIcon);
        locationRow.appendChild(locationText);

        const link = document.createElement("a");
        link.className =
          "inline-flex w-full items-center justify-center rounded-lg bg-purple-600 mt-2 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-500";
        link.href = `/tiendas/${store.id}`;
        link.textContent = "Ver mas";

        content.appendChild(close);
        content.appendChild(title);
        content.appendChild(locationRow);
        content.appendChild(link);

        infoWindow.setContent(content);
        infoWindow.open({ anchor: marker, map });
      });

      markersRef.current.push(marker);
    });
  }, [center, markers, storefrontIcon]);

  return <div ref={mapRef} className={className} />;
}
