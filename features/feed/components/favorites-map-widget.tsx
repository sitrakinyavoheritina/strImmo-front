import { MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

// Aperçu statique : aucune lib de carte interactive (Mapbox, Leaflet...) n'est
// configurée côté web pour l'instant — ajouter une vraie carte sort du cadre
// de cette étape (le mobile a un token Mapbox dédié, pas le web).
const PIN_POSITIONS = [
  { top: '35%', left: '30%' },
  { top: '55%', left: '60%' },
  { top: '25%', left: '68%' },
];

/** Aperçu visuel statique d'une carte, en attendant une intégration réelle. */
export function FavoritesMapWidget() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-2.5">{t.feed.favoriteProperties}</h3>
      <div className="relative h-32 rounded-xl overflow-hidden border border-stroke-default bg-gradient-to-br from-brand-primary-soft to-surface-app">
        {PIN_POSITIONS.map((pos, index) => (
          <MapPin
            key={index}
            size={20}
            className="absolute -translate-x-1/2 -translate-y-full text-brand-secondary fill-brand-secondary/20"
            style={pos}
          />
        ))}
      </div>
    </div>
  );
}
