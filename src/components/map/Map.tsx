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
      }
    };

    initMap();
  }, [lat, lgn, title]);

  return <div className={className} ref={mapRef} />;
};
