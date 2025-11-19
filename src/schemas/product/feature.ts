/**
 * Product feature schema for managing feature flags and product features
 */

import { z } from 'zod';
import { UUID, Timestamps } from '../../types/common';

/**
 * Feature interface definitions
 */
export interface Feature extends Timestamps {
  id: UUID;
  organizationId?: UUID;
  name: string;
  key: string;
  description?: string;
  type: 'feature' | 'experiment' | 'release';
  enabled: boolean;
  rolloutPercentage?: number;
  targetAudiences?: TargetAudience[];
  variants?: Variant[];
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface Variant {
  id: UUID;
  featureId: UUID;
  key: string;
  value: unknown;
  weight?: number; // percentage for A/B testing
  description?: string;
}

export interface TargetAudience {
  id?: UUID;
  featureId?: UUID;
  name: string;
  condition: AudienceCondition[];
  rolloutPercentage?: number;
}

export interface AudienceCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: unknown;
}

export interface CreateFeatureInput {
  name: string;
  key: string;
  description?: string;
  type: 'feature' | 'experiment' | 'release';
  enabled?: boolean;
  rolloutPercentage?: number;
  variants?: Variant[];
  targetAudiences?: TargetAudience[];
  metadata?: Record<string, unknown>;
}

export interface UpdateFeatureInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  variants?: Variant[];
  targetAudiences?: TargetAudience[];
  status?: 'draft' | 'active' | 'deprecated' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface EvaluateFeatureInput {
  featureKey: string;
  userId?: UUID;
  attributes?: Record<string, unknown>;
  defaultValue?: unknown;
}

/**
 * Zod validation schemas
 */
const AudienceConditionSchema = z.object({
  attribute: z.string().min(1),
  operator: z.enum([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'gt',
    'gte',
    'lt',
    'lte',
    'in',
    'not_in',
  ]),
  value: z.unknown(),
});

const TargetAudienceSchema = z.object({
  id: z.string().uuid().optional(),
  featureId: z.string().uuid().optional(),
  name: z.string().min(1),
  condition: z.array(AudienceConditionSchema).min(1),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

const VariantSchema = z.object({
  id: z.string().uuid().optional(),
  featureId: z.string().uuid().optional(),
  key: z.string().min(1),
  value: z.unknown(),
  weight: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export const FeatureSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  key: z.string().regex(/^[a-z0-9_]+$/),
  description: z.string().max(500).optional(),
  type: z.enum(['feature', 'experiment', 'release']),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetAudiences: z.array(TargetAudienceSchema).optional(),
  variants: z.array(VariantSchema).optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateFeatureSchema = z.object({
  name: z.string().min(1, 'Feature name is required').max(200),
  key: z.string().regex(/^[a-z0-9_]+$/, 'Key must contain only lowercase letters, numbers, and underscores'),
  description: z.string().max(500).optional(),
  type: z.enum(['feature', 'experiment', 'release']),
  enabled: z.boolean().optional().default(false),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  variants: z.array(VariantSchema).optional(),
  targetAudiences: z.array(TargetAudienceSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateFeatureSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  variants: z.array(VariantSchema).optional(),
  targetAudiences: z.array(TargetAudienceSchema).optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const EvaluateFeatureSchema = z.object({
  featureKey: z.string().min(1),
  userId: z.string().uuid().optional(),
  attributes: z.record(z.unknown()).optional(),
  defaultValue: z.unknown().optional(),
});

export type ValidatedFeature = z.infer<typeof FeatureSchema>;
export type ValidatedCreateFeature = z.infer<typeof CreateFeatureSchema>;
export type ValidatedUpdateFeature = z.infer<typeof UpdateFeatureSchema>;
export type ValidatedEvaluateFeature = z.infer<typeof EvaluateFeatureSchema>;
