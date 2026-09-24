#!/usr/bin/env bash
# Déploiement du site web sur le serveur : ./deploy.sh
# À lancer APRÈS le backend (le build lit l'API pour générer les pages et le sitemap).
#
# Variables modifiables au lancement, ex. :  BRANCH=main PM2_NAME=web ./deploy.sh
#   BRANCH     branche à récupérer (défaut : main)
#   PM2_NAME   nom du process pm2 à redémarrer (défaut : onina-web)
#   PORT       port de `next start` si pas de pm2 (défaut : 3002)
set -euo pipefail
cd "$(dirname "$0")"

BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-onina-web}"
PORT="${PORT:-3002}"

env_value() { grep -hE "^$1=" .env.production.local .env.local 2>/dev/null | head -n1 | cut -d= -f2- | tr -d '\r'; }

echo "==> 1/5  Vérification de l'environnement de build"
API_URL="$(env_value NEXT_PUBLIC_API_URL)"
[ -n "$API_URL" ] || { echo "✘ NEXT_PUBLIC_API_URL absent de .env.production.local"; exit 1; }
for name in NEXT_PUBLIC_GA_MEASUREMENT_ID NEXT_PUBLIC_SITE_URL; do
  [ -n "$(env_value $name)" ] || echo "    ⚠ $name non défini dans .env.production.local"
done
# Le build interroge l'API : s'il ne répond pas, les pages SEO seraient générées vides.
curl -fsS -m 10 -o /dev/null "$API_URL/properties/sitemap" \
  || { echo "✘ L'API ($API_URL) ne répond pas sur /properties/sitemap — déploie/redémarre d'abord le backend."; exit 1; }
echo "    API joignable : $API_URL"

echo "==> 2/5  Récupération du code ($BRANCH)"
git pull origin "$BRANCH"

echo "==> 3/5  Installation des dépendances"
npm install

echo "==> 4/5  Build"
npm run build

echo "==> 5/5  Redémarrage"
if command -v pm2 >/dev/null 2>&1 && pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
  echo "    pm2 : $PM2_NAME redémarré"
else
  echo "    Redémarre le site à la main (process pm2 '$PM2_NAME' introuvable) :"
  echo "    npx next start -p $PORT   (ou pm2 start 'npx next start -p $PORT' --name $PM2_NAME)"
fi

echo "✔ Site web déployé"
