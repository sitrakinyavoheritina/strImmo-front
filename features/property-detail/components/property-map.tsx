'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type PropertyMapProps = {
  latitude: number;
  longitude: number;
};

const ZOOM = 15;

/** Carte Mapbox GL en lecture seule pour la position — juste le marqueur à la position précise
 * enregistrée à la création (voir map-position-picker.tsx), non déplaçable (pas de glisser-
 * déposer, pas de clic pour repositionner) : ici on affiche seulement où se situe le bien, on ne
 * le modifie pas. Le zoom reste possible dans les deux sens (molette, pincement, boutons +/- via
 * NavigationControl) — PAS de `cooperativeGestures` : ça exigeait Ctrl/Cmd+molette pour zoomer
 * (sinon rien ne se passe, juste un message affiché brièvement), ce qui rendait le dézoom à la
 * molette silencieusement impossible pour qui ne connaît pas ce raccourci — remonté explicitement.
 * Style satellite (pas `streets-v12`, routes seules) : on doit pouvoir distinguer les bâtiments,
 * comme sur Google Maps — remonté explicitement après une annonce où seules les routes étaient
 * visibles, même en zoomant. */
export function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [longitude, latitude],
      zoom: ZOOM,
      dragPan: false,
      dragRotate: false,
      keyboard: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    new mapboxgl.Marker({ color: '#d6603c' }).setLngLat([longitude, latitude]).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  return <div ref={containerRef} className="w-full h-60 rounded-xl overflow-hidden border border-stroke-default" />;
}
