import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Onina.mg',
  description: "Comment Onina.mg collecte, utilise et protège les données de ses utilisateurs.",
};

const LAST_UPDATED = '22 septembre 2026';

// Contenu volontairement en français uniquement (pas de version malagasy via useTranslation,
// contrairement au reste du site) : un document légal traduit en parallèle de deux façons risque
// de diverger avec le temps (une correction faite d'un côté, oubliée de l'autre) et créerait une
// ambiguïté sur quelle version fait foi en cas de litige — une seule version canonique est plus
// sûre pour ce type de page. Page serveur simple (pas de 'use client') : contenu statique, aucun
// state ni hook nécessaire.
//
// Rédigé à partir du fonctionnement réel de la plateforme (voir strImmo/src/auth,
// strImmo/src/storage, strImmo/src/messaging, strImmo/src/chat) — mais reste un document
// juridique : à faire relire par un professionnel avant publication, en particulier la section
// "Qui nous sommes" (raison sociale et adresse exactes de l'entité qui exploite Onina, absentes du
// code) et les adresses de contact ci-dessous, volontairement génériques en attendant confirmation.
export default function PrivacyPolicyPage() {
  return (
    <div className="px-3 sm:px-6 lg:px-0 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm p-5 sm:p-10">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-secondary-text mb-1">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-content-muted mb-8">Dernière mise à jour : {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-content-main">
          <section>
            <p>
              Onina.mg (« Onina », « nous ») met en relation propriétaires, locataires, agences et
              intermédiaires immobiliers à Madagascar. Cette page explique quelles données nous
              collectons lorsque vous utilisez le site ou l’application, pourquoi, avec qui elles
              sont partagées et quels droits vous avez sur elles.
            </p>
          </section>

          <Section title="1. Qui nous sommes">
            <p>
              Onina.mg est édité par l’équipe Onina. Pour toute question sur cette politique ou vos
              données personnelles, contactez-nous à{' '}
              <a href="mailto:confidentialite@onina.mg" className="text-brand-primary underline">
                confidentialite@onina.mg
              </a>
              .
            </p>
          </Section>

          <Section title="2. Données que nous collectons">
            <p>Selon la façon dont vous utilisez Onina, nous collectons :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Compte</strong> : prénom, nom, numéro de téléphone (identifiant de
                connexion), email (facultatif selon le type de compte), mot de passe (jamais
                stocké en clair — voir « Sécurité »), adresse, photo de profil.
              </li>
              <li>
                <strong>Comptes professionnels (agent, agence)</strong> : copie de la carte
                d’identité (CIN), numéro et/ou justificatif NIF et STAT, nom et adresse de
                l’agence — nécessaires pour vérifier l’identité avant de publier des annonces au
                nom d’un professionnel.
              </li>
              <li>
                <strong>Connexion avec Google</strong> : si vous choisissez « Se connecter avec
                Google », nous recevons votre email, votre nom et votre photo de profil Google.
                Onina ne reçoit jamais votre mot de passe Google.
              </li>
              <li>
                <strong>Annonces</strong> : photos, description, prix, localisation et
                caractéristiques du bien que vous publiez.
              </li>
              <li>
                <strong>Localisation précise</strong> : uniquement si vous l’autorisez
                explicitement (bouton « Utiliser ma position » à la création d’une annonce, ou
                fonctionnalité « Près de chez vous ») — via l’autorisation de géolocalisation de
                votre navigateur, jamais suivie en arrière-plan ni sans action de votre part.
              </li>
              <li>
                <strong>Messagerie</strong> : contenu des messages et photos échangés avec
                d’autres utilisateurs au sujet d’une annonce.
              </li>
              <li>
                <strong>Assistant de recherche (IA)</strong> : si vous utilisez l’assistant de
                recherche conversationnel, le texte de votre conversation est transmis au
                fournisseur qui fait tourner ce modèle (voir « Partage avec des tiers ») pour
                générer une réponse.
              </li>
              <li>
                <strong>Codes de vérification</strong> : un code temporaire est envoyé par SMS ou
                email pour vérifier votre téléphone/email ou réinitialiser votre mot de passe — il
                expire rapidement et n’est jamais réutilisé pour autre chose.
              </li>
              <li>
                <strong>Préférences techniques</strong> : langue, thème clair/sombre, affichage du
                fil (cartes ou liste) — stockées sur votre appareil (voir « Stockage local »), et
                sur votre compte si vous êtes connecté, pour retrouver les mêmes réglages sur un
                autre appareil.
              </li>
            </ul>
          </Section>

          <Section title="3. Pourquoi nous les utilisons">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Créer et sécuriser votre compte, vous authentifier.</li>
              <li>Publier et afficher les annonces, vous mettre en relation avec les autres utilisateurs.</li>
              <li>Vérifier l’identité des comptes professionnels avant publication (modération).</li>
              <li>Vous envoyer des notifications liées à votre activité (nouveau message, statut d’une annonce).</li>
              <li>Vous permettre de retrouver un bien près de vous, si vous le demandez.</li>
              <li>Assurer la sécurité de la plateforme (détecter les abus, limiter les tentatives de connexion frauduleuses).</li>
              <li>Répondre à vos demandes via l’assistant de recherche.</li>
            </ul>
            <p className="mt-2">
              Nous n’utilisons pas vos données à des fins publicitaires et ne les vendons à
              personne. Onina n’intègre aucun outil de suivi publicitaire ou d’analyse tierce
              (pas de Google Analytics, pas de pixel Facebook ni équivalent).
            </p>
          </Section>

          <Section title="4. Partage avec des tiers">
            <p>
              Certaines données transitent par des prestataires techniques, uniquement pour rendre
              le service possible — aucun d’eux n’est autorisé à réutiliser vos données pour son
              propre compte :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Cloudflare R2</strong> — hébergement des photos et documents (CIN, NIF, STAT).</li>
              <li><strong>Google</strong> — uniquement si vous utilisez « Se connecter avec Google ».</li>
              <li><strong>Mapbox</strong> — affichage des cartes et positions des annonces.</li>
              <li><strong>OpenAI</strong> — uniquement le texte échangé avec l’assistant de recherche IA, si vous l’utilisez.</li>
              <li><strong>Brevo</strong> — envoi des emails (codes de vérification, réinitialisation de mot de passe).</li>
              <li><strong>Orange Madagascar</strong> — envoi des codes de vérification par SMS.</li>
            </ul>
            <p className="mt-2">
              Nous ne partageons jamais votre mot de passe, ni vos documents d’identité, avec un
              autre utilisateur — seules les informations que vous choisissez d’afficher sur votre
              profil ou vos annonces sont visibles publiquement.
            </p>
          </Section>

          <Section title="5. Combien de temps nous les gardons">
            <p>
              Vos données sont conservées tant que votre compte existe. Un code de vérification
              expire en quelques minutes. Si vous supprimez votre compte, vos données personnelles
              sont supprimées, sauf ce que la loi nous oblige à conserver plus longtemps (par
              exemple à des fins comptables).
            </p>
          </Section>

          <Section title="6. Sécurité">
            <p>
              Votre mot de passe n’est jamais stocké en clair (il est haché, une transformation à
              sens unique). Les échanges entre votre appareil et nos serveurs sont chiffrés
              (HTTPS). L’accès à vos données est limité aux traitements nécessaires au
              fonctionnement du service.
            </p>
          </Section>

          <Section title="7. Stockage local et cookies">
            <p>
              Onina n’utilise pas de cookies de suivi publicitaire. Le site garde quelques
              informations directement sur votre appareil (stockage local du navigateur, jamais
              transmises à un autre site) : votre session de connexion, votre langue, votre thème
              clair/sombre, l’affichage préféré du fil d’annonces, et si vous avez déjà écarté la
              proposition d’installer l’application. Vous pouvez les effacer à tout moment depuis
              les réglages de votre navigateur — cela vous déconnectera.
            </p>
          </Section>

          <Section title="8. Vos droits">
            <p>
              Conformément à la réglementation malgache applicable en matière de protection des
              données à caractère personnel, vous disposez d’un droit d’accès, de rectification,
              d’opposition et de suppression de vos données. La plupart de ces actions sont
              directement disponibles depuis l’application (modifier son profil, supprimer une
              annonce). Pour toute autre demande, y compris la suppression complète de votre
              compte, contactez{' '}
              <a href="mailto:confidentialite@onina.mg" className="text-brand-primary underline">
                confidentialite@onina.mg
              </a>
              .
            </p>
          </Section>

          <Section title="9. Mineurs">
            <p>
              Onina s’adresse à des personnes en âge de conclure un contrat immobilier (location,
              vente). Le service n’est pas destiné aux personnes mineures.
            </p>
          </Section>

          <Section title="10. Modifications de cette politique">
            <p>
              Cette politique peut évoluer avec le service. La date de dernière mise à jour est
              indiquée en haut de cette page ; en cas de changement important, nous vous en
              informerons par une notification dans l’application.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-content-main mb-2">{title}</h2>
      {children}
    </section>
  );
}
