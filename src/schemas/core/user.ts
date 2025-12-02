/**
 * User schema for core user management
 */

import { z } from 'zod';
import {
  UUID,
  Email,
  Timestamps,
  AuditStamp,
  DataClassification,
  PIIClassification,
  DataResidency,
  Locale,
} from '../../types/common';

/**
 * User interface definition
 */
export interface User extends Timestamps {
  id: UUID;
  email: Email;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
  tenantId?: UUID;
  locale?: Locale;
  dataClassification?: DataClassification;
  residency?: DataResidency;
  audit?: AuditStamp;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone?: string;
}

export interface CreateUserInput {
  email: Email;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  metadata?: Record<string, unknown>;
  tenantId?: UUID;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
  locale?: Locale;
  dataClassification?: DataClassification;
  residency?: DataResidency;
}

/**
 * Zod validation schemas
 */
const DataResidencySchema = z.object({
  region: z.string().min(2),
  dataCenter: z.string().optional(),
  restrictCrossRegion: z.boolean().optional(),
});

const AuditStampSchema = z.object({
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
  requestId: z.string().optional(),
  source: z.string().optional(),
  sourceRegion: z.string().optional(),
  tenantId: z.string().uuid().optional(),
});

const DataClassificationSchema = z.object({
  pii: z.nativeEnum(PIIClassification),
  residency: DataResidencySchema.optional(),
  redactionPaths: z.array(z.string()).optional(),
  allowedUses: z.array(z.enum(['analytics', 'operations', 'support'])).optional(),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z
    .object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    })
    .optional(),
  timezone: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
  preferences: UserPreferencesSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  tenantId: z.string().uuid().optional(),
  locale: z.string().optional(),
  dataClassification: DataClassificationSchema.optional(),
  residency: DataResidencySchema.optional(),
  audit: AuditStampSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  phone: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  tenantId: z.string().uuid().optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  preferences: UserPreferencesSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  locale: z.string().optional(),
  dataClassification: DataClassificationSchema.optional(),
  residency: DataResidencySchema.optional(),
});

export type ValidatedUser = z.infer<typeof UserSchema>;
export type ValidatedCreateUser = z.infer<typeof CreateUserSchema>;
export type ValidatedUpdateUser = z.infer<typeof UpdateUserSchema>;
