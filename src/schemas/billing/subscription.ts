/**
 * Subscription schema for managing plans and subscriptions
 */

import { z } from 'zod';
import { UUID, Timestamps, SubscriptionStatus } from '../../types/common';

/**
 * Subscription interface definitions
 */
export interface Plan extends Timestamps {
  id: UUID;
  organizationId?: UUID;
  name: string;
  key: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  features: PlanFeature[];
  limits?: {
    [key: string]: number;
  };
  trial?: {
    durationDays: number;
    freeTier?: boolean;
  };
  status: 'draft' | 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface PlanFeature {
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
}

export interface Subscription extends Timestamps {
  id: UUID;
  organizationId: UUID;
  planId: UUID;
  status: typeof SubscriptionStatus[keyof typeof SubscriptionStatus];
  startDate: Date;
  renewalDate?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  autoRenew: boolean;
  trialEndsAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionItem extends Timestamps {
  id: UUID;
  subscriptionId: UUID;
  planId: UUID;
  price: number;
  currency: string;
  quantity: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
}

export interface Usage extends Timestamps {
  id: UUID;
  organizationId: UUID;
  subscriptionId: UUID;
  metric: string;
  value: number;
  resetAt?: Date;
  limit?: number;
}

export interface CreatePlanInput {
  name: string;
  key: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  features: PlanFeature[];
  limits?: Record<string, number>;
  trial?: {
    durationDays: number;
    freeTier?: boolean;
  };
  metadata?: Record<string, unknown>;
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  price?: number;
  features?: PlanFeature[];
  limits?: Record<string, number>;
  status?: 'draft' | 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface CreateSubscriptionInput {
  planId: UUID;
  autoRenew?: boolean;
  customPricing?: {
    price: number;
    discountPercent?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionInput {
  planId?: UUID;
  autoRenew?: boolean;
  status?: typeof SubscriptionStatus[keyof typeof SubscriptionStatus];
  metadata?: Record<string, unknown>;
}

export interface CancelSubscriptionInput {
  reason?: string;
  effectiveDate?: Date;
  refundable?: boolean;
}

export interface UpdateUsageInput {
  metric: string;
  value: number;
}

/**
 * Zod validation schemas
 */
const PlanFeatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  included: z.boolean(),
  limit: z.number().positive().optional(),
});

const TrialSchema = z.object({
  durationDays: z.number().positive(),
  freeTier: z.boolean().optional(),
});

export const PlanSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  key: z.string().regex(/^[a-z0-9_]+$/),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  currency: z.string().length(3),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
  features: z.array(PlanFeatureSchema),
  limits: z.record(z.number()).optional(),
  trial: TrialSchema.optional(),
  status: z.enum(['draft', 'active', 'archived']),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(200),
  key: z.string().regex(/^[a-z0-9_]+$/, 'Key must contain only lowercase letters, numbers, and underscores'),
  description: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be a 3-character ISO code'),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
  features: z.array(PlanFeatureSchema).min(1, 'At least one feature is required'),
  limits: z.record(z.number()).optional(),
  trial: TrialSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  features: z.array(PlanFeatureSchema).optional(),
  limits: z.record(z.number()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  planId: z.string().uuid(),
  status: z.enum(['active', 'past_due', 'paused', 'cancelled', 'expired']),
  startDate: z.date(),
  renewalDate: z.date().optional(),
  cancelledAt: z.date().optional(),
  cancellationReason: z.string().optional(),
  autoRenew: z.boolean(),
  trialEndsAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateSubscriptionSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  autoRenew: z.boolean().optional().default(true),
  customPricing: z
    .object({
      price: z.number().min(0),
      discountPercent: z.number().min(0).max(100).optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateSubscriptionSchema = z.object({
  planId: z.string().uuid().optional(),
  autoRenew: z.boolean().optional(),
  status: z.enum(['active', 'past_due', 'paused', 'cancelled', 'expired']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
  effectiveDate: z.date().optional(),
  refundable: z.boolean().optional(),
});

export const UpdateUsageSchema = z.object({
  metric: z.string().min(1),
  value: z.number().min(0),
});

export type ValidatedPlan = z.infer<typeof PlanSchema>;
export type ValidatedCreatePlan = z.infer<typeof CreatePlanSchema>;
export type ValidatedUpdatePlan = z.infer<typeof UpdatePlanSchema>;
export type ValidatedSubscription = z.infer<typeof SubscriptionSchema>;
export type ValidatedCreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type ValidatedUpdateSubscription = z.infer<typeof UpdateSubscriptionSchema>;
export type ValidatedCancelSubscription = z.infer<typeof CancelSubscriptionSchema>;
export type ValidatedUpdateUsage = z.infer<typeof UpdateUsageSchema>;
