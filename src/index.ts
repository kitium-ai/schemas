/**
 * @kitium-ai/schema - Enterprise-ready reusable schema definitions for Product SaaS
 *
 * This package provides comprehensive, type-safe, and validated schema definitions
 * for building enterprise SaaS applications. It includes schemas for:
 *
 * - Core entities (Users, Organizations, RBAC)
 * - Authentication and authorization
 * - Products and features
 * - Billing and subscriptions
 * - API requests and responses
 * - Common types and utilities
 *
 * @example
 * ```typescript
 * import { UserSchema, validate } from '@kitium-ai/schema';
 *
 * const result = validate(UserSchema, userData);
 * if (result.success) {
 *   console.log('Valid user:', result.data);
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */

// Core schemas - User, Organization, RBAC
export * from './schemas/core';

// Authentication schemas
export * from './schemas/auth';

// Organization team management
export * from './schemas/organization';

// Product schemas - Features, Workspaces, Integrations
export * from './schemas/product';

// Billing schemas - Subscriptions, Payments, Invoices
export * from './schemas/billing';

// API schemas - Requests and Responses
export * from './schemas/api';

// Common types
export * from './schemas/common';

// Validators and utilities
export * from './validators';
