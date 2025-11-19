/**
 * Authentication schema for login, registration, and token management
 */

import { z } from 'zod';
import { UUID, Timestamps, Email } from '../../types/common';

/**
 * Authentication interface definitions
 */
export interface AuthToken extends Timestamps {
  id: UUID;
  userId: UUID;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  revokedAt?: Date;
  isRevoked: boolean;
  type: 'access' | 'refresh';
  metadata?: Record<string, unknown>;
}

export interface Session extends Timestamps {
  id: UUID;
  userId: UUID;
  organizationId?: UUID;
  token: string;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface MFASettings extends Timestamps {
  id: UUID;
  userId: UUID;
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  verified: boolean;
  backupCodes?: string[];
}

export interface LoginCredentials {
  email: Email;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  email: Email;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: {
    id: UUID;
    email: Email;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: Email;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface OAuthInput {
  provider: 'google' | 'github' | 'microsoft';
  code: string;
  redirectUri: string;
}

/**
 * Zod validation schemas
 */
export const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const RegisterInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  organizationName: z.string().min(1).max(200).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const OAuthInputSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft']),
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z.string().url('Invalid redirect URI'),
});

export const MFASettingsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  enabled: z.boolean(),
  method: z.enum(['totp', 'sms', 'email']),
  verified: z.boolean(),
  backupCodes: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuthTokenSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date(),
  revokedAt: z.date().optional(),
  isRevoked: z.boolean(),
  type: z.enum(['access', 'refresh']),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  token: z.string(),
  expiresAt: z.date(),
  lastActivityAt: z.date(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().positive(),
});

export type ValidatedLoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type ValidatedRegisterInput = z.infer<typeof RegisterInputSchema>;
export type ValidatedPasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type ValidatedPasswordReset = z.infer<typeof PasswordResetSchema>;
export type ValidatedChangePassword = z.infer<typeof ChangePasswordSchema>;
export type ValidatedRefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type ValidatedOAuthInput = z.infer<typeof OAuthInputSchema>;
export type ValidatedMFASettings = z.infer<typeof MFASettingsSchema>;
export type ValidatedAuthToken = z.infer<typeof AuthTokenSchema>;
export type ValidatedSession = z.infer<typeof SessionSchema>;
export type ValidatedAuthResponse = z.infer<typeof AuthResponseSchema>;
