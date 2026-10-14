'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { NouvelleDemandeForm } from '@/app/demandes/nouvelle/page';

// Même formulaire que /demandes/nouvelle (NouvelleDemandeForm, rendu paramétrable par
// `editingRequestId`, voir ce fichier) — préremplit les champs depuis GET /property-requests/:id
// et soumet via PATCH /property-requests/:id au lieu de POST. Pas de garde "propriétaire" ici
// côté client : le backend renvoie 403/404 si cette demande n'appartient pas à la personne
// connectée, géré proprement par NouvelleDemandeForm (message lisible, pas d'écran blanc). La
// redirection vers /connexion pour un visiteur non connecté est déjà gérée par NouvelleDemandeForm
// lui-même (même effet que pour la création, appliqué normalement ici puisque `targetUserId` n'est
// jamais fourni par cette route).
function ModifierDemandeForm() {
  const params = useParams<{ id: string }>();
  return <NouvelleDemandeForm editingRequestId={params.id} />;
}

export default function ModifierDemandePage() {
  return (
    <Suspense fallback={null}>
      <ModifierDemandeForm />
    </Suspense>
  );
}
