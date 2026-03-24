"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
  lat: number;
  lgn: number;
  title: string;
  className?: string;
}

export const Map = ({ title, lat, lgn, className }: Props) => {
  const mapRef = useRef(null);

  useEffect(() => {
    let observer: MutationObserver | null = null;

    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps");

      const position = {
        lat: lat,
        lng: lgn,
      };

      const mapOptions = {
        center: position,
        zoom: 17,
        mapId: "MY_NEXTJS_MAPID",
      };

      if (mapRef.current) {
        const map = new Map(mapRef.current, mapOptions);

        new google.maps.Marker({
          map: map,
          position: position,
          label: title,
        });

        const mapRoot = mapRef.current as HTMLDivElement;
        const seoLabel = title ? `Mapa de ${title}` : "Mapa de ubicacion";

        const applySeoAttributes = () => {
          mapRoot.querySelectorAll("img").forEach((image) => {
            if (!image.getAttribute("alt")) {
              image.setAttribute("alt", seoLabel);
            }
            if (!image.getAttribute("title")) {
              image.setAttribute("title", seoLabel);
            }
          });

          mapRoot.querySelectorAll("a").forEach((anchor) => {
            if (anchor.getAttribute("title")) return;
            const href = anchor.getAttribute("href") ?? "";
            const label = href.includes("google.com")
              ? "Abrir en Google Maps"
              : "Enlace de mapa";
            anchor.setAttribute("title", label);
          });
        };

        applySeoAttributes();

        observer = new MutationObserver(() => {
          // Google Maps re-renderiza nodos internos sin avisar, por eso re-aplicamos.
          applySeoAttributes();
        });

        observer.observe(mapRoot, { childList: true, subtree: true });
      }
    };

    initMap();

    return () => {
      observer?.disconnect();
    };
  }, [lat, lgn, title]);

  return (
    <div
      className={className}
      ref={mapRef}
      aria-label={title ? `Mapa de ${title}` : "Mapa de ubicacion"}
    />
  );
};
