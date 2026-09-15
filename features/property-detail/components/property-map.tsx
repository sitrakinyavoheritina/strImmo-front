'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type PropertyMapProps = {
  latitude: number;
  longitude: number;
};

const ZOOM = 15;

/** Carte Mapbox GL en lecture seule — juste le marqueur à la position précise enregistrée à la
 * création (voir map-position-picker.tsx), sans interaction (pas de glisser-déposer, pas de clic
 * pour repositionner, pas de molette qui accrocherait le défilement de la page) : ici on affiche
 * seulement où se situe le bien, on ne le modifie pas. */
export function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: ZOOM,
      interactive: false,
    });
    new mapboxgl.Marker({ color: '#d6603c' }).setLngLat([longitude, latitude]).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  return <div ref={containerRef} className="w-full h-40 rounded-xl overflow-hidden border border-stroke-default" />;
}
