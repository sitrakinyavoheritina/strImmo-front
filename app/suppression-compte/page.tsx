'use client';

import { useState } from 'react';
import { authService } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { Button } from '@/components/ui/button';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-content-main mb-2">{title}</h2>
      {children}
    </section>
  );
}

// Page publique exigée par Google Play Console (Data safety > "Ajoutez un lien permettant aux
// utilisateurs de demander la suppression de leur compte et des données associées") — l'URL
// soumise doit mener à une vraie page web expliquant la procédure, pas à une route d'API brute
// (c'était l'erreur initiale : une URL de l'API elle-même, refusée par Google car pas une page
// consultable). Accessible SANS connexion (contrairement à /profil) : quelqu'un qui ne peut plus
// se connecter doit quand même pouvoir demander la suppression de son compte.
//
// N'efface rien automatiquement — demandé explicitement de passer par une alerte à l'équipe
// (AuthService.requestAccountDeletion), traitée ensuite manuellement via le bouton "Supprimer ce
// compte" déjà existant (/admin/utilisateurs), après vérification de l'identité du demandeur.
// Français uniquement, comme /politique-de-confidentialite (document de référence, une seule
// version canonique plutôt que deux traductions qui pourraient diverger).
export default function SuppressionComptePage() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!identifier.trim()) {
      setError('Indiquez votre numéro de téléphone ou votre email.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authService.requestAccountDeletion({ identifier: identifier.trim(), message: message.trim() || undefined });
      setSent(true);
    } catch (e) {
      setError(getErrorMessage(e, "Impossible d'envoyer la demande. Réessayez dans un instant."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="px-3 sm:px-6 lg:px-0 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-5 sm:p-10">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-secondary-text mb-1">
          Suppression de compte — Onina.mg
        </h1>
        <p className="text-sm text-content-muted mb-8">
          Cette page explique comment demander la suppression de votre compte Onina (web ou
          application mobile) et des données associées.
        </p>

        <div className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-content-main">
          <Section title="Comment demander la suppression">
            <p>
              Si vous êtes connecté, le moyen le plus rapide reste de nous contacter directement. Si
              vous ne pouvez plus vous connecter (mot de passe perdu, numéro ou email changé),
              remplissez le formulaire ci-dessous avec le numéro de téléphone ou l&apos;email associé
              à votre compte Onina. Votre demande est transmise à notre équipe, qui la traite après
              avoir vérifié qu&apos;elle vient bien du titulaire du compte, sous un délai maximum de
              30 jours.
            </p>
          </Section>

          <Section title="Données supprimées">
            <p>
              La suppression est définitive et porte sur l&apos;ensemble des données liées à votre
              compte : profil (nom, téléphone, email, photo), annonces publiées, demandes
              enregistrées, messages et conversations, favoris et notifications. Aucune de ces
              données n&apos;est conservée après la suppression.
            </p>
          </Section>

          <Section title="Faire votre demande">
            {sent ? (
              <p className="rounded-xl border border-stroke-default bg-surface-app p-3.5 font-semibold text-brand-primary">
                Votre demande a bien été transmise. Nous la traiterons sous 30 jours maximum.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
                <div>
                  <label className="block text-[0.85rem] font-medium text-content-main mb-1">
                    Téléphone ou email du compte
                  </label>
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="034 00 000 00 ou exemple@domaine.mg"
                    className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-[0.85rem] font-medium text-content-main mb-1">
                    Précision (facultatif)
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                    placeholder="Ex. je n'ai plus accès à ce numéro"
                    className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none"
                  />
                </div>
                {error && <p className="text-[0.85rem] text-danger">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Envoi...' : 'Envoyer la demande'}
                </Button>
              </form>
            )}
          </Section>

          <Section title="Contact">
            <p>
              Vous pouvez aussi nous écrire directement à{' '}
              <a href="mailto:confidentialite@onina.mg" className="text-brand-primary underline">
                confidentialite@onina.mg
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
