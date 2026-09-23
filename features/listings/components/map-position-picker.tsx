'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Crosshair } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FieldLabel, FormInput } from '@/components/ui/form-controls';

// Antananarivo — point de départ par défaut tant qu'aucun fokontany n'est encore choisi (la
// grande majorité des annonces y sont situées).
const DEFAULT_CENTER: [number, number] = [47.5079, -18.8792];
const DEFAULT_ZOOM = 13;

type MapPositionPickerProps = {
  latitude?: number;
  longitude?: number;
  onChange: (position: { latitude: number; longitude: number }) => void;
  /** Recentre la carte ici à chaque changement (nouveau fokontany/commune choisi, voir
   *  use-geocode-fokontany.ts) — y compris après un positionnement manuel précédent : rechoisir
   *  une commune/un fokontany veut dire se relocaliser, la précédente position manuelle n'a plus
   *  de sens dans la nouvelle zone (constaté explicitement : une 2ᵉ recherche ne déplaçait plus la
   *  carte du tout après un premier glisser-déposer/clic). Seule exception : au montage, si une
   *  position précise existe déjà (fiche en cours de modification), le tout premier indice reçu
   *  (qui correspond à ce même fokontany déjà choisi) est ignoré pour ne pas écraser cette
   *  position déjà enregistrée par une simple approximation du centre de la commune. */
  centerHintLatitude?: number;
  centerHintLongitude?: number;
  /** Indication d'adresse facultative — affichée juste sous la carte, dans le même bloc (demandé
   *  explicitement : carte et adresse doivent être regroupées au même endroit plutôt qu'en deux
   *  sections séparées de l'étape). */
  address?: string;
  onAddressChange?: (value: string) => void;
};

// Carte Mapbox GL avec un marker déplaçable — marker posé au centre au montage (position
// déjà connue, `centerHint`, ou Antananarivo par défaut), déplaçable par glisser-déposer ou clic
// sur la carte, plus un bouton "Utiliser ma position" (géolocalisation navigateur).
export function MapPositionPicker({
  latitude,
  longitude,
  onChange,
  centerHintLatitude,
  centerHintLongitude,
  address,
  onAddressChange,
}: MapPositionPickerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Ne s'applique qu'une fois, voir le commentaire sur `centerHint*` ci-dessus — jamais remis à
  // `true` ensuite, donc sans effet sur les changements de commune/fokontany suivants.
  const skipNextHintRef = useRef(latitude != null && longitude != null);
  const [geoError, setGeoError] = useState<string | null>(null);

  function reportPosition(lng: number, lat: number) {
    onChange({ latitude: lat, longitude: lng });
  }

  // Initialisation une seule fois — `latitude`/`longitude`/`onChange` volontairement absents des
  // dépendances (voir les effets séparés plus bas pour la resynchronisation après montage).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const initialCenter: [number, number] =
      longitude != null && latitude != null
        ? [longitude, latitude]
        : centerHintLongitude != null && centerHintLatitude != null
          ? [centerHintLongitude, centerHintLatitude]
          : DEFAULT_CENTER;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: DEFAULT_ZOOM,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const marker = new mapboxgl.Marker({ draggable: true, color: '#d6603c' }).setLngLat(initialCenter).addTo(map);
    marker.on('dragend', () => {
      const { lng, lat } = marker.getLngLat();
      reportPosition(lng, lat);
    });
    map.on('click', (event) => {
      marker.setLngLat(event.lngLat);
      reportPosition(event.lngLat.lng, event.lngLat.lat);
    });

    mapRef.current = map;
    markerRef.current = marker;
    // Position initiale communiquée au parent même sans geste de l'utilisateur, pour que
    // latitude/longitude ne restent jamais vides tant qu'une carte est affichée.
    reportPosition(initialCenter[0], initialCenter[1]);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre à chaque changement de commune/fokontany (nouvelles coordonnées de `centerHint`) —
  // dépend des coordonnées seules (pas d'un objet), pour ne se déclencher que sur un vrai
  // changement. Voir le commentaire sur `centerHint*`/`skipNextHintRef` plus haut pour l'unique
  // exception (position déjà enregistrée au montage).
  useEffect(() => {
    if (centerHintLatitude == null || centerHintLongitude == null) return;
    if (!mapRef.current || !markerRef.current) return;
    if (skipNextHintRef.current) {
      skipNextHintRef.current = false;
      return;
    }
    mapRef.current.flyTo({ center: [centerHintLongitude, centerHintLatitude], zoom: DEFAULT_ZOOM });
    markerRef.current.setLngLat([centerHintLongitude, centerHintLatitude]);
    reportPosition(centerHintLongitude, centerHintLatitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerHintLatitude, centerHintLongitude]);

  function handleUseMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError(t.listing.geolocationUnsupported);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: DEFAULT_ZOOM });
        markerRef.current?.setLngLat([lng, lat]);
        reportPosition(lng, lat);
      },
      () => setGeoError(t.listing.geolocationDenied)
    );
  }

  return (
    <div>
      <FieldLabel>{t.listing.mapLabel}</FieldLabel>
      <div className="relative">
        <div ref={containerRef} className="w-full h-64 rounded-xl overflow-hidden border border-stroke-default" />
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-surface-card border border-stroke-default rounded-lg px-2.5 py-1.5 text-[0.85rem] font-semibold text-content-main shadow-sm hover:border-brand-primary/60 transition"
        >
          <Crosshair size={14} />
          {t.listing.useMyLocation}
        </button>
      </div>
      {geoError && <p className="mt-1 text-[0.85rem] text-danger">{geoError}</p>}
      {onAddressChange && (
        <div className="mt-3">
          <FormInput
            label={t.listing.formAddress}
            value={address ?? ''}
            onChange={onAddressChange}
            placeholder={t.listing.formAddressPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
