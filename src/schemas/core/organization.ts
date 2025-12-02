/**
 * Organization schema for managing teams and workspaces
 */

import { z } from 'zod';
import {
  UUID,
  Timestamps,
  Address,
  DataResidency,
  AuditStamp,
  DataClassification,
  PIIClassification,
} from '../../types/common';

/**
 * Organization interface definition
 */
export interface Organization extends Timestamps {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: Address;
  status: 'active' | 'inactive' | 'suspended';
  settings?: OrganizationSettings;
  metadata?: Record<string, unknown>;
  ownerId: UUID;
  tenantId?: UUID;
  residency?: DataResidency;
  dataClassification?: DataClassification;
  audit?: AuditStamp;
}

export interface OrganizationSettings {
  allowPublicAccess?: boolean;
  requireSSO?: boolean;
  twoFactorRequired?: boolean;
  dataResidency?: string;
  customBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
}

export interface Team extends Timestamps {
  id: UUID;
  organizationId: UUID;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  memberCount: number;
  metadata?: Record<string, unknown>;
  tenantId?: UUID;
  audit?: AuditStamp;
}

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: Address;
  settings?: OrganizationSettings;
  metadata?: Record<string, unknown>;
  tenantId?: UUID;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: Address;
  settings?: OrganizationSettings;
  metadata?: Record<string, unknown>;
  residency?: DataResidency;
  dataClassification?: DataClassification;
  tenantId?: UUID;
}

/**
 * Zod validation schemas
 */
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const DataResidencySchema = z.object({
  region: z.string(),
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
  allowedUses: z
    .array(z.enum(['analytics', 'operations', 'support']))
    .optional(),
});

const OrganizationSettingsSchema = z.object({
  allowPublicAccess: z.boolean().optional(),
  requireSSO: z.boolean().optional(),
  twoFactorRequired: z.boolean().optional(),
  dataResidency: z.string().optional(),
  customBranding: z
    .object({
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      secondaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      customDomain: z.string().optional(),
    })
    .optional(),
});

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  address: AddressSchema.optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  settings: OrganizationSettingsSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  ownerId: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  residency: DataResidencySchema.optional(),
  dataClassification: DataClassificationSchema.optional(),
  audit: AuditStampSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  address: AddressSchema.optional(),
  settings: OrganizationSettingsSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  tenantId: z.string().uuid().optional(),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  address: AddressSchema.optional(),
  settings: OrganizationSettingsSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  residency: DataResidencySchema.optional(),
  dataClassification: DataClassificationSchema.optional(),
  tenantId: z.string().uuid().optional(),
});

export const TeamSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']),
  memberCount: z.number().min(0),
  metadata: z.record(z.unknown()).optional(),
  tenantId: z.string().uuid().optional(),
  audit: AuditStampSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ValidatedOrganization = z.infer<typeof OrganizationSchema>;
export type ValidatedCreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type ValidatedUpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
export type ValidatedTeam = z.infer<typeof TeamSchema>;
