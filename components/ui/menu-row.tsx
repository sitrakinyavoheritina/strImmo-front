import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/** Ligne de menu façon réglages (icône, libellé, chevron si navigable) — utilisée sur /profil et
 * /parametres. `disabled` : rendu grisé, non cliquable (ex. une fonctionnalité pas encore prête,
 * plutôt que de la cacher entièrement — l'utilisateur sait qu'elle arrive). */
export function MenuRow({
  href,
  icon: Icon,
  label,
  danger,
  disabled,
  badge,
  onClick,
}: {
  href?: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon size={18} />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-xs text-content-muted">{badge}</span>}
      {href && !disabled && <ChevronRight size={16} className="text-content-muted" />}
    </>
  );
  const className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
    disabled
      ? 'text-content-muted opacity-60 cursor-default'
      : danger
        ? 'text-danger hover:bg-danger/10'
        : 'text-content-main hover:bg-surface-app'
  }`;

  if (disabled) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
