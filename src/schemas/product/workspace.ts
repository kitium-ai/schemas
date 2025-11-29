/**
 * Workspace schema for managing project workspaces
 */

import { z } from 'zod';
import { UUID, Timestamps } from '../../types/common';

/**
 * Workspace interface definitions
 */
export interface Workspace extends Timestamps {
  id: UUID;
  organizationId: UUID;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status: 'active' | 'archived';
  visibility: 'private' | 'internal' | 'public';
  memberCount: number;
  settings?: WorkspaceSettings;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceSettings {
  allowPublicAccess?: boolean;
  defaultRole?: string;
  maxMembers?: number;
  customBranding?: {
    primaryColor?: string;
    logo?: string;
  };
}

export interface WorkspaceMember extends Timestamps {
  id: UUID;
  workspaceId: UUID;
  userId: UUID;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  status: 'active' | 'inactive';
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  visibility?: 'private' | 'internal' | 'public';
  settings?: WorkspaceSettings;
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  status?: 'active' | 'archived';
  visibility?: 'private' | 'internal' | 'public';
  settings?: WorkspaceSettings;
  metadata?: Record<string, unknown>;
}

export interface AddWorkspaceMemberInput {
  userId: UUID;
  role: 'admin' | 'editor' | 'viewer';
}

export interface UpdateWorkspaceMemberInput {
  role?: 'admin' | 'editor' | 'viewer';
  status?: 'active' | 'inactive';
}

/**
 * Zod validation schemas
 */
const WorkspaceSettingsSchema = z.object({
  allowPublicAccess: z.boolean().optional(),
  defaultRole: z.string().optional(),
  maxMembers: z.number().positive().optional(),
  customBranding: z
    .object({
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      logo: z.string().url().optional(),
    })
    .optional(),
});

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  status: z.enum(['active', 'archived']),
  visibility: z.enum(['private', 'internal', 'public']),
  memberCount: z.number().min(0),
  settings: WorkspaceSettingsSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  visibility: z.enum(['private', 'internal', 'public']).optional().default('private'),
  settings: WorkspaceSettingsSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  visibility: z.enum(['private', 'internal', 'public']).optional(),
  settings: WorkspaceSettingsSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const WorkspaceMemberSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['admin', 'editor', 'viewer']),
  joinedAt: z.date(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AddWorkspaceMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export const UpdateWorkspaceMemberSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type ValidatedWorkspace = z.infer<typeof WorkspaceSchema>;
export type ValidatedCreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
export type ValidatedUpdateWorkspace = z.infer<typeof UpdateWorkspaceSchema>;
export type ValidatedWorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
export type ValidatedAddWorkspaceMember = z.infer<typeof AddWorkspaceMemberSchema>;
export type ValidatedUpdateWorkspaceMember = z.infer<typeof UpdateWorkspaceMemberSchema>;
