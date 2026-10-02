'use client';

import { TriangleAlert, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { Button } from './button';

export type MissingField = {
  /** Message dans la langue actuellement choisie (FR ou MG, voir useTranslation) — déjà résolu
   *  par l'appelant (ex. `t.listing.titleRequired`), pas une clé à résoudre ici. */
  label: string;
  /** Explication TOUJOURS en malgache, quelle que soit la langue choisie (demandé explicitement) —
   *  l'appelant la résout depuis `translations.mg...` directement, indépendamment du sélecteur FR/MG. */
  explanationMg: string;
};

/** Modal listant les champs obligatoires manquants — affiché quand on clique "Suivant"/"Continuer"
 *  sans avoir tout rempli à l'étape courante, en plus des erreurs déjà affichées sous chaque champ
 *  (demandé explicitement : la liste doit être immédiatement visible sans avoir à remonter le
 *  formulaire pour repérer chaque bordure rouge). Même gabarit que FilterModal (overlay centré,
 *  clic dehors = fermer). N'affiche l'explication en malgache que si elle diffère du libellé déjà
 *  affiché (ex. langue d'affichage déjà en malgache) — sinon la répétition n'apporterait rien. */
export function MissingFieldsModal({ fields, onClose }: { fields: MissingField[]; onClose: () => void }) {
  const { t } = useTranslation();
  if (fields.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface-card rounded-2xl shadow-lg p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <TriangleAlert size={20} className="text-danger shrink-0" />
            <h2 className="text-base font-bold text-content-main">{t.common.missingFieldsTitle}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-content-muted hover:text-content-main shrink-0">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-content-muted mb-3">{t.common.missingFieldsSubtitle}</p>
        <ul className="space-y-2 mb-4">
          {fields.map((field, index) => (
            <li key={index} className="rounded-xl bg-surface-app px-3 py-2">
              <p className="text-sm font-semibold text-content-main">{field.label}</p>
              {field.explanationMg !== field.label && (
                <p className="text-[0.8rem] text-content-muted mt-0.5">{field.explanationMg}</p>
              )}
            </li>
          ))}
        </ul>
        <Button type="button" className="w-full" onClick={onClose}>
          {t.common.understood}
        </Button>
      </div>
    </div>
  );
}
