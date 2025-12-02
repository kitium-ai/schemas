/**
 * Integration schema for managing third-party integrations
 */

import { z } from 'zod';
import {
  UUID,
  Timestamps,
  DataResidency,
  SecretMetadata,
  AuditStamp,
} from '../../types/common';

/**
 * Integration interface definitions
 */
export interface Integration extends Timestamps {
  id: UUID;
  organizationId: UUID;
  name: string;
  key: string;
  description?: string;
  type: 'api' | 'webhook' | 'oauth' | 'saas' | 'custom';
  enabled: boolean;
  config: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSyncAt?: Date;
  metadata?: Record<string, unknown>;
  residency?: DataResidency;
  audit?: AuditStamp;
}

export interface IntegrationCredential {
  id: UUID;
  integrationId: UUID;
  organizationId: UUID;
  name: string;
  type: 'api_key' | 'oauth_token' | 'webhook_secret' | 'custom';
  encryptedValue: string;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
  secretMetadata?: SecretMetadata;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
}

export interface CreateIntegrationInput {
  name: string;
  key: string;
  description?: string;
  type: 'api' | 'webhook' | 'oauth' | 'saas' | 'custom';
  config: Record<string, unknown>;
  credentials?: {
    name: string;
    type: 'api_key' | 'oauth_token' | 'webhook_secret' | 'custom';
    value: string;
    expiresAt?: Date;
    secretMetadata?: SecretMetadata;
  }[];
  metadata?: Record<string, unknown>;
  residency?: DataResidency;
}

export interface UpdateIntegrationInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  status?: 'active' | 'inactive' | 'error' | 'pending';
  metadata?: Record<string, unknown>;
  residency?: DataResidency;
}

export interface TestIntegrationInput {
  config: Record<string, unknown>;
}

export interface SyncIntegrationInput {
  force?: boolean;
}

/**
 * Zod validation schemas
 */
export const IntegrationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  key: z.string().regex(/^[a-z0-9_]+$/),
  description: z.string().max(500).optional(),
  type: z.enum(['api', 'webhook', 'oauth', 'saas', 'custom']),
  enabled: z.boolean(),
  config: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'error', 'pending']),
  lastSyncAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  residency: z
    .object({
      region: z.string(),
      dataCenter: z.string().optional(),
      restrictCrossRegion: z.boolean().optional(),
    })
    .optional(),
  audit: z
    .object({
      createdBy: z.string().uuid(),
      updatedBy: z.string().uuid().optional(),
      requestId: z.string().optional(),
      source: z.string().optional(),
      sourceRegion: z.string().optional(),
      tenantId: z.string().uuid().optional(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateIntegrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required').max(200),
  key: z
    .string()
    .regex(/^[a-z0-9_]+$/, 'Key must contain only lowercase letters, numbers, and underscores'),
  description: z.string().max(500).optional(),
  type: z.enum(['api', 'webhook', 'oauth', 'saas', 'custom']),
  config: z.record(z.unknown()),
  credentials: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(['api_key', 'oauth_token', 'webhook_secret', 'custom']),
        value: z.string().min(1),
        expiresAt: z.date().optional(),
        secretMetadata: z
          .object({
            encrypted: z.boolean(),
            managedBy: z.enum(['user', 'system']).optional(),
            rotationIntervalDays: z.number().min(1).optional(),
            lastRotatedAt: z.date().optional(),
            redactInLogs: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  residency: z
    .object({
      region: z.string(),
      dataCenter: z.string().optional(),
      restrictCrossRegion: z.boolean().optional(),
    })
    .optional(),
});

export const UpdateIntegrationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'inactive', 'error', 'pending']).optional(),
  metadata: z.record(z.unknown()).optional(),
  residency: z
    .object({
      region: z.string(),
      dataCenter: z.string().optional(),
      restrictCrossRegion: z.boolean().optional(),
    })
    .optional(),
});

export const TestIntegrationSchema = z.object({
  config: z.record(z.unknown()),
});

export const SyncIntegrationSchema = z.object({
  force: z.boolean().optional().default(false),
});

export const IntegrationCredentialSchema = z.object({
  id: z.string().uuid(),
  integrationId: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['api_key', 'oauth_token', 'webhook_secret', 'custom']),
  encryptedValue: z.string(),
  expiresAt: z.date().optional(),
  status: z.enum(['active', 'expired', 'revoked']),
  createdAt: z.date(),
  updatedAt: z.date(),
  secretMetadata: z
    .object({
      encrypted: z.boolean(),
      managedBy: z.enum(['user', 'system']).optional(),
      rotationIntervalDays: z.number().min(1).optional(),
      lastRotatedAt: z.date().optional(),
      redactInLogs: z.boolean().optional(),
    })
    .optional(),
});

export type ValidatedIntegration = z.infer<typeof IntegrationSchema>;
export type ValidatedCreateIntegration = z.infer<typeof CreateIntegrationSchema>;
export type ValidatedUpdateIntegration = z.infer<typeof UpdateIntegrationSchema>;
export type ValidatedTestIntegration = z.infer<typeof TestIntegrationSchema>;
export type ValidatedSyncIntegration = z.infer<typeof SyncIntegrationSchema>;
export type ValidatedIntegrationCredential = z.infer<typeof IntegrationCredentialSchema>;
