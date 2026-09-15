'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useNearbyProperties } from '@/features/search/hooks/use-nearby-properties';

const ZOOM = 12;

/** Remplace l'ancien aperçu statique (favorites-map-widget.tsx, quelques punaises figées sur un
 * dégradé de couleur, sans lien avec de vraies données) par une vraie carte Mapbox centrée sur
 * l'utilisateur, montrant les annonces les plus proches de sa position — cliquer sur un marqueur
 * ouvre directement sa fiche détail. Position demandée automatiquement au montage (pas de bouton à
 * cliquer avant) — seule exception à la convention "jamais de géolocalisation silencieuse"
 * (map-position-picker.tsx), demandée explicitement ici pour ce widget. */
export function NearbyPropertiesMapWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: nearby } = useNearbyProperties(position?.latitude, position?.longitude);

  useEffect(() => {
    if (!navigator.geolocation) {
      // Différé d'un micro-tick : un `setState` synchrone dans le corps de l'effet (pas dans un
      // callback asynchrone comme `getCurrentPosition` ci-dessous) déclenche un rendu en cascade
      // évitable, voir react-hooks/set-state-in-effect.
      queueMicrotask(() => setError(t.feed.nearbyLocationError));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (result) => setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude }),
      () => setError(t.feed.nearbyLocationError)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carte initialisée une seule fois, dès qu'une position est connue.
  useEffect(() => {
    if (!position || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [position.longitude, position.latitude],
      zoom: ZOOM,
    });
    // Ajouté ici (effet d'initialisation, une seule exécution) et non dans l'effet ci-dessous —
    // qui, lui, se relance à chaque mise à jour de `nearby`, ce qui dupliquait ce marqueur à
    // chaque rechargement des données (constaté explicitement en testant).
    new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([position.longitude, position.latitude]).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [position]);

  // Un marqueur par annonce proche, recalculés à chaque nouvelle liste — cliquer sur l'un d'eux
  // ouvre directement sa fiche détail.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([position.longitude, position.latitude]);

    for (const property of nearby ?? []) {
      const marker = new mapboxgl.Marker({ color: '#d6603c' })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map);
      marker.getElement().style.cursor = 'pointer';
      marker.getElement().addEventListener('click', () => router.push(`/annonce/${property.id}`));
      markersRef.current.push(marker);
      bounds.extend([property.longitude, property.latitude]);
    }

    if ((nearby ?? []).length > 0) {
      map.fitBounds(bounds, { padding: 32, maxZoom: 14 });
    }
  }, [nearby, position, router]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-2.5">{t.feed.nearbyProperties}</h3>
      {position ? (
        <>
          <div ref={containerRef} className="h-48 rounded-xl overflow-hidden border border-stroke-default" />
          {nearby && nearby.length === 0 && <p className="mt-1.5 text-xs text-content-muted">{t.feed.nearbyEmpty}</p>}
        </>
      ) : !error ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-stroke-default bg-surface-app text-content-muted text-xs font-semibold">
          {t.feed.locatingNearby}
        </div>
      ) : null}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
