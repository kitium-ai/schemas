/**
 * Role-Based Access Control (RBAC) schema
 */

import { z } from 'zod';
import { UUID, PermissionAction, Timestamps } from '../../types/common';

/**
 * RBAC interface definitions
 */
export interface Role extends Timestamps {
  id: UUID;
  organizationId: UUID;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
}

export interface Permission {
  id?: UUID;
  resource: string;
  actions: PermissionAction[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface UserRole {
  id: UUID;
  userId: UUID;
  organizationId: UUID;
  roleId: UUID;
  assignedAt: Date;
  assignedBy?: UUID;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: Permission[];
  status?: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
}

export interface CheckPermissionInput {
  userId: UUID;
  organizationId: UUID;
  resource: string;
  action: PermissionAction;
  context?: Record<string, unknown>;
}

/**
 * Predefined system roles
 */
export const SYSTEM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

/**
 * Zod validation schemas
 */
const PermissionConditionSchema = z.object({
  field: z.string(),
  operator: z.enum([
    'equals',
    'not_equals',
    'in',
    'not_in',
    'contains',
    'greater_than',
    'less_than',
  ]),
  value: z.unknown(),
});

const PermissionSchema = z.object({
  id: z.string().uuid().optional(),
  resource: z.string().min(1),
  actions: z.array(z.enum(['create', 'read', 'update', 'delete', 'execute', 'manage'])),
  conditions: z.array(PermissionConditionSchema).optional(),
});

export const RoleSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(PermissionSchema),
  isSystem: z.boolean(),
  status: z.enum(['active', 'inactive']),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(PermissionSchema).min(1, 'At least one permission is required'),
  isSystem: z.boolean().optional().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(PermissionSchema).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UserRoleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  roleId: z.string().uuid(),
  assignedAt: z.date(),
  assignedBy: z.string().uuid().optional(),
});

export const CheckPermissionSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  resource: z.string(),
  action: z.enum(['create', 'read', 'update', 'delete', 'execute', 'manage']),
  context: z.record(z.unknown()).optional(),
});

export type ValidatedRole = z.infer<typeof RoleSchema>;
export type ValidatedCreateRole = z.infer<typeof CreateRoleSchema>;
export type ValidatedUpdateRole = z.infer<typeof UpdateRoleSchema>;
export type ValidatedUserRole = z.infer<typeof UserRoleSchema>;
export type ValidatedCheckPermission = z.infer<typeof CheckPermissionSchema>;
