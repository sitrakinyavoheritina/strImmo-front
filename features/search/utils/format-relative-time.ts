const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Date de publication compacte façon réseau social ("5mn", "30mn", "1h", "1j"...) — même
 *  registre partout où une annonce affiche sa date (carte du fil, fiche détail). */
export function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < MINUTE) return "à l'instant";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}mn`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}j`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}sem`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mois`;
  return `${Math.floor(diff / YEAR)}ans`;
}
