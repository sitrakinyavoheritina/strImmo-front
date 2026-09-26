"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/i18n/use-translation";
import { STATUS_BADGE_CLASS } from "@/features/listings/utils/status-badge";
import { useDeleteAdminUser } from "../hooks/use-delete-admin-user";
import type { AdminUser } from "../types";
import type { UserRole } from "@/features/auth/types";

const ROLE_LABEL_KEY = {
  owner: "roleOwner",
  tenant: "roleTenant",
  agent: "roleAgent",
  agency: "roleAgency",
  admin: "roleAdmin",
  superadmin: "roleSuperadmin",
} as const satisfies Record<UserRole, string>;

const MODERATION_LABEL_KEY = {
  pending: "moderationPending",
  approved: "moderationApproved",
  rejected: "moderationRejected",
} as const;

export function isUnvalidatedAccount(user: AdminUser): boolean {
  return (
    ["owner", "agent", "agency"].includes(user.role) &&
    !!user.phone &&
    !user.isPhoneVerified
  );
}

// Ligne en lecture seule pour /admin/utilisateurs — avatar, nom, rôle, coordonnée principale
// (téléphone si connu, sinon email — un compte créé via Google peut n'avoir que l'email, voir
// strImmo/src/auth/auth.service.ts:loginWithGoogle), pastilles de vérification, date d'inscription
// et, pour un agent/agency, le statut de son dossier (même vocabulaire visuel que les annonces,
// voir status-badge.ts).
export function AdminUserListItem({ user }: { user: AdminUser }) {
  const { t } = useTranslation();
  const { mutate: deleteUser, isPending } = useDeleteAdminUser();
  // Propriétaire / intermédiaire / agence dont le numéro n'est pas vérifié : compte créé mais qui ne
  // peut pas se connecter (voir strImmo/src/auth/auth.service.ts:blockUnverified). Un locataire n'en
  // a pas besoin.
  const isNotValidated = isUnvalidatedAccount(user);
  const canDelete = user.role !== "admin" && user.role !== "superadmin";
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const createdAt = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-2.5 hover:border-brand-primary/40 transition">
      {/* Toute la zone d'infos ouvre la fiche (lecture seule) ; la corbeille reste un bouton à part. */}
      <Link
        href={`/admin/utilisateurs/${user.id}`}
        className="flex flex-1 min-w-0 items-center gap-3"
      >
        <Avatar
          name={fullName || user.email || user.phone || "?"}
          imageUrl={user.avatarUrl ?? undefined}
          size={44}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-content-main truncate">
              {fullName || t.adminUsersPage.noName}
            </p>
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-brand-primary-soft text-brand-primary">
              {t.auth[ROLE_LABEL_KEY[user.role]]}
            </span>
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-surface-app text-content-muted border border-stroke-default">
              {user.hasPassword
                ? t.adminUsersPage.loginPassword
                : t.adminUsersPage.loginGoogle}
            </span>
            {isNotValidated && (
              <span
                title={t.adminUsersPage.notValidatedHint}
                className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS.pending}`}
              >
                <AlertCircle size={10} />
                {t.adminUsersPage.notValidated}
              </span>
            )}
            {user.moderationStatus && (
              <span
                className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS[user.moderationStatus]}`}
              >
                {t.adminUsersPage[MODERATION_LABEL_KEY[user.moderationStatus]]}
              </span>
            )}
          </div>

          {user.agencyName && (
            <p className="text-[0.85rem] text-content-muted truncate mt-0.5">
              {user.agencyName}
            </p>
          )}

          <div className="flex items-center gap-3 mt-0.5 text-[0.85rem] text-content-muted">
            {user.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={11} />
                {user.phone}
                {user.isPhoneVerified && (
                  <CheckCircle2 size={11} className="text-brand-primary" />
                )}
                {isNotValidated && (
                  <AlertCircle size={11} className="text-amber-600" />
                )}
              </span>
            )}
            {user.email && (
              <span className="inline-flex items-center gap-1 truncate">
                <Mail size={11} className="shrink-0" />
                <span className="truncate">{user.email}</span>
                {user.isEmailVerified && (
                  <CheckCircle2
                    size={11}
                    className="shrink-0 text-brand-primary"
                  />
                )}
              </span>
            )}
          </div>

          {isNotValidated && (
            <p className="text-[0.85rem] font-semibold text-amber-700 mt-0.5">
              {t.adminUsersPage.notValidatedHint}
            </p>
          )}

          <p className="text-[12px] text-content-muted mt-0.5">
            {t.adminUsersPage.joinedOn} {createdAt}
          </p>
        </div>
        <ChevronRight size={16} className="shrink-0 text-content-muted" />
      </Link>
      {canDelete && (
        <button
          type="button"
          disabled={isPending}
          aria-label={t.adminUsersPage.deleteUser}
          onClick={() => {
            if (
              window.confirm(
                `${t.adminUsersPage.deleteConfirm} ${fullName || user.phone || user.email} ?`,
              )
            ) {
              deleteUser(user.id);
            }
          }}
          className="shrink-0 p-2 rounded-lg text-danger hover:bg-danger/10 transition disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
