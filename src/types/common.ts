/**
 * Common types and interfaces used across all schemas
 */

export type UUID = string & { readonly __brand: 'UUID' };
export type Email = string & { readonly __brand: 'Email' };
export type URL = string & { readonly __brand: 'URL' };
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

/**
 * Timestamp types for consistency
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface TimestampsWithDelete extends Timestamps {
  deletedAt: Date | null;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Status types
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

/**
 * Location types
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email: Email;
  phone?: PhoneNumber;
  website?: URL;
}

/**
 * Metadata and soft delete
 */
export interface SoftDeletable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

export type Metadata = Record<string, unknown>;

/**
 * Error response types
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code: string;
}

/**
 * Audit types
 */
export interface AuditLog {
  id: UUID;
  entityType: string;
  entityId: UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  changes?: Record<string, { oldValue: unknown; newValue: unknown }>;
  userId: UUID;
  createdAt: Date;
}

/**
 * Permission and Role types
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage',
}

/**
 * Webhook event types
 */
export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  ORG_CREATED = 'organization.created',
  ORG_UPDATED = 'organization.updated',
  SUB_CREATED = 'subscription.created',
  SUB_UPDATED = 'subscription.updated',
  SUB_CANCELLED = 'subscription.cancelled',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
}
