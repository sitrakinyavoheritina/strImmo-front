import { authApi, type ApiUser } from './auth-api';
import type {
  CompleteProfilePayload,
  LoginPayload,
  RegisterPayload,
  RegisterResult,
  UpdateProfilePayload,
  User,
  ThemePreference,
  FeedDisplayPreference,
} from '../types';

function toUser(api: ApiUser): User {
  return {
    id: api.id,
    firstName: api.firstName,
    lastName: api.lastName,
    fullName: `${api.firstName} ${api.lastName}`.trim(),
    phone: api.phone ?? undefined,
    email: api.email ?? undefined,
    avatarUrl: api.avatarUrl ?? undefined,
    address: api.address ?? undefined,
    phone2: api.phone2 ?? undefined,
    isEmailVerified: api.isEmailVerified ?? false,
    role: api.role,
    themePreference: api.themePreference,
    feedDisplay: api.feedDisplay,
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<{ user: User; token: string }> => {
    const res = await authApi.login(payload);
    return { user: toUser(res.user), token: res.access_token };
  },

  loginWithGoogle: async (idToken: string): Promise<{ user: User; token: string }> => {
    const res = await authApi.loginWithGoogle(idToken);
    return { user: toUser(res.user), token: res.access_token };
  },

  // Choix du rôle + téléphone (+ documents) après une connexion Google — voir
  // strImmo/src/auth/auth.service.ts:completeProfile. Un seul nouveau token à jour (le rôle a pu
  // changer depuis la création automatique lors du premier login Google).
  completeProfile: async (payload: CompleteProfilePayload): Promise<{ user: User; token: string }> => {
    const form = new FormData();
    form.append('role', payload.role);
    form.append('phone', payload.phone);
    if (payload.agencyName) form.append('agencyName', payload.agencyName);
    if (payload.address) form.append('address', payload.address);
    if (payload.cinRecto) form.append('cinRecto', payload.cinRecto);
    if (payload.cinVerso) form.append('cinVerso', payload.cinVerso);
    if (payload.nif) form.append('nif', payload.nif);
    if (payload.stat) form.append('stat', payload.stat);
    const res = await authApi.completeProfile(form);
    return { user: toUser(res.user), token: res.access_token };
  },

  // Union taguée sur `role` : owner/tenant ouvrent une session immédiatement (JSON), agent/agency
  // n'obtiennent pas de token (compte "pending", validation admin requise, voir types.ts).
  register: async (payload: RegisterPayload): Promise<RegisterResult> => {
    const base = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      password: payload.password,
    };

    if (payload.role === 'owner' || payload.role === 'tenant') {
      const res = await (payload.role === 'owner' ? authApi.registerOwner : authApi.registerTenant)({
        ...base,
        email: payload.email || undefined,
      });
      return { status: 'authenticated', user: toUser(res.user), token: res.access_token };
    }

    if (payload.role === 'agent') {
      const form = new FormData();
      Object.entries(base).forEach(([key, value]) => form.append(key, value));
      if (payload.cinRecto) form.append('cinRecto', payload.cinRecto);
      if (payload.cinVerso) form.append('cinVerso', payload.cinVerso);
      await authApi.registerAgent(form);
      return { status: 'pending' };
    }

    // Agence
    const form = new FormData();
    Object.entries(base).forEach(([key, value]) => form.append(key, value));
    form.append('email', payload.email);
    form.append('agencyName', payload.agencyName);
    form.append('address', payload.address);
    if (payload.nif) form.append('nif', payload.nif);
    if (payload.stat) form.append('stat', payload.stat);
    await authApi.registerAgency(form);
    return { status: 'pending' };
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const form = new FormData();
    form.append('currentPassword', payload.currentPassword);
    if (payload.firstName) form.append('firstName', payload.firstName);
    if (payload.lastName) form.append('lastName', payload.lastName);
    if (payload.email) form.append('email', payload.email);
    if (payload.address) form.append('address', payload.address);
    if (payload.phone2) form.append('phone2', payload.phone2);
    if (payload.newPassword) form.append('newPassword', payload.newPassword);
    if (payload.avatar) form.append('avatar', payload.avatar);
    const res = await authApi.updateProfile(form);
    return toUser(res);
  },

  updatePreferences: (payload: { themePreference?: ThemePreference; feedDisplay?: FeedDisplayPreference }) =>
    authApi.updatePreferences(payload),

  forgotPassword: (identifier: string) => authApi.forgotPassword(identifier),

  resetPassword: (payload: { identifier: string; code: string; newPassword: string }) =>
    authApi.resetPassword(payload),

  sendEmailVerification: () => authApi.sendEmailVerification(),

  verifyEmail: (code: string) => authApi.verifyEmail(code),
};
