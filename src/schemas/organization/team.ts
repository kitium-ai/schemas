/**
 * Team member and invitation schemas for organization management
 */

import { z } from 'zod';
import { UUID, Timestamps, Email } from '../../types/common';

/**
 * Team member interface definitions
 */
export interface TeamMember extends Timestamps {
  id: UUID;
  organizationId: UUID;
  userId: UUID;
  roles: UUID[];
  joinedAt: Date;
  status: 'active' | 'pending' | 'inactive';
  invitedBy?: UUID;
  lastActivityAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface OrganizationInvitation extends Timestamps {
  id: UUID;
  organizationId: UUID;
  email: Email;
  roleIds: UUID[];
  invitedBy: UUID;
  acceptedAt?: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  metadata?: Record<string, unknown>;
}

export interface InviteMemberInput {
  email: Email;
  roleIds: UUID[];
  message?: string;
  expiresIn?: number; // in days
}

export interface InviteBulkMembersInput {
  members: InviteMemberInput[];
}

export interface AcceptInvitationInput {
  token: string;
}

export interface UpdateTeamMemberInput {
  roleIds?: UUID[];
  status?: 'active' | 'pending' | 'inactive';
  metadata?: Record<string, unknown>;
}

export interface RemoveTeamMemberInput {
  userId: UUID;
}

/**
 * Zod validation schemas
 */
export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  roles: z.array(z.string().uuid()),
  joinedAt: z.date(),
  status: z.enum(['active', 'pending', 'inactive']),
  invitedBy: z.string().uuid().optional(),
  lastActivityAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const OrganizationInvitationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  email: z.string().email(),
  roleIds: z.array(z.string().uuid()),
  invitedBy: z.string().uuid(),
  acceptedAt: z.date().optional(),
  expiresAt: z.date(),
  status: z.enum(['pending', 'accepted', 'expired', 'cancelled']),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const InviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  roleIds: z.array(z.string().uuid()).min(1, 'At least one role is required'),
  message: z.string().max(500).optional(),
  expiresIn: z.number().positive().optional().default(7),
});

export const InviteBulkMembersSchema = z.object({
  members: z.array(InviteMemberSchema).min(1).max(50),
});

export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
});

export const UpdateTeamMemberSchema = z.object({
  roleIds: z.array(z.string().uuid()).optional(),
  status: z.enum(['active', 'pending', 'inactive']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const RemoveTeamMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type ValidatedTeamMember = z.infer<typeof TeamMemberSchema>;
export type ValidatedOrganizationInvitation = z.infer<typeof OrganizationInvitationSchema>;
export type ValidatedInviteMember = z.infer<typeof InviteMemberSchema>;
export type ValidatedInviteBulkMembers = z.infer<typeof InviteBulkMembersSchema>;
export type ValidatedAcceptInvitation = z.infer<typeof AcceptInvitationSchema>;
export type ValidatedUpdateTeamMember = z.infer<typeof UpdateTeamMemberSchema>;
export type ValidatedRemoveTeamMember = z.infer<typeof RemoveTeamMemberSchema>;
