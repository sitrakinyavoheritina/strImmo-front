/** La CIN n'est plus demandée à l'inscription d'un intermédiaire (facultative, voir la validation
 * désactivée côté serveur) : sa section est masquée pour l'instant. Passer à `true` pour la
 * ré-afficher le jour où elle sera de nouveau proposée — les états et l'envoi des fichiers sont
 * déjà en place (register-agent-form.tsx, app/completer-profil/page.tsx). */
export const SHOW_CIN_UPLOAD = false;
