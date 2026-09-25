import { z } from 'zod';

// Numéro mobile malgache réel (032/033/034/037/038/039 + 7 chiffres), en local ou en +261 — même
// règle que le backend (strImmo/src/auth/utils/malagasy-phone.ts) : un texte quelconque est refusé.
const PHONE_REGEX = /^(?:\+?261|0)3[2-9]\d{7}$/;
export const isValidMalagasyPhone = (value: string) => PHONE_REGEX.test(value.replace(/[\s.\-()]/g, ''));

// `identifier` accepte un numéro de téléphone OU un email — le backend interroge les deux colonnes
// (voir strImmo/src/auth/services/auth.service.ts:login). L'onglet Téléphone/Email du formulaire
// n'est qu'un confort d'UI (clavier/placeholder) : il n'est jamais envoyé à l'API, comme sur mobile.
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Ce champ est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Owner et tenant partagent exactement le même formulaire côté mobile (seul `role` diffère) — le
// backend valide le mot de passe avec `minLength 8` pour ces deux rôles (RegisterOwnerDto).
export const ownerTenantSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().refine(isValidMalagasyPhone, 'Numéro de téléphone invalide (ex. 034 12 345 67)'),
  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
});

export type OwnerTenantFormData = z.infer<typeof ownerTenantSchema>;

// Agent ("intermédiaire") : pas de champ email (RegisterAgentDto n'en a pas), mot de passe
// `minLength 8`. Les documents CIN sont gérés hors zod (fichiers, voir register-agent-form.tsx) —
// leur validation est d'ailleurs désactivée côté backend pour l'instant (même choix que le mobile).
export const agentSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().refine(isValidMalagasyPhone, 'Numéro de téléphone invalide (ex. 034 12 345 67)'),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
});

export type AgentFormData = z.infer<typeof agentSchema>;

// Agence : email requis (contrairement à owner/tenant), mot de passe `minLength 8`, plus les
// informations de la société. NIF/STAT gérés hors zod (fichiers requis, vérifiés séparément).
// website/facebookUrl/description : vitrine publique facultative — jamais requis (voir
// AgencyProfile côté backend), `.or(z.literal(''))` laisse le champ vide passer sans erreur.
export const agencySchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().refine(isValidMalagasyPhone, 'Numéro de téléphone invalide (ex. 034 12 345 67)'),
  email: z.string().email('Adresse email invalide').min(1, "L'email est requis"),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
  agencyName: z.string().min(2, "Le nom de l'agence est requis"),
  address: z.string().min(2, "L'adresse est requise"),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  facebookUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

export type AgencyFormData = z.infer<typeof agencySchema>;
