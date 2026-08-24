import { z } from 'zod';

export const loginSchema = z
  .object({
    method: z.enum(['phone', 'email']),
    identifier: z.string().min(1, 'Ce champ est requis'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  })
  .refine(
    (data) => {
      if (data.method === 'email') {
        return z.string().email().safeParse(data.identifier).success;
      }
      if (data.method === 'phone') {
        // Validation basique d'un numéro de téléphone (au moins 8 chiffres)
        return /^[0-9\s+]{8,15}$/.test(data.identifier);
      }
      return true;
    },
    {
      message: "Format d'identifiant invalide",
      path: ['identifier'],
    }
  );

export type LoginFormData = z.infer<typeof loginSchema>;

// ... gardez votre loginSchema inchangé au-dessus

export const registerSchema = z
  .object({
    firstname: z.string().min(2, 'Le prénom est requis'),
    lastname: z.string().min(2, 'Le nom est requis'),
    phone: z
      .string()
      .regex(/^[0-9\s+]{8,15}$/, 'Numéro de téléphone invalide'),
    email: z
      .string()
      .email('Adresse email invalide')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;