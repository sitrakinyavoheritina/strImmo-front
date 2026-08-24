export type AuthMethod = 'phone' | 'email';

export interface LoginPayload {
  identifier: string; // numéro de téléphone ou adresse email
  password: string;
  method: AuthMethod;
}

export interface RegisterPayload {
  firstname: string;
  lastname: string;
  phone: string;
  email?: string;
  password: string;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}