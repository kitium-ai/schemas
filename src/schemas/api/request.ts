/**
 * API request schema for standardized request structures
 */

import { z } from 'zod';
import { PaginationParams } from '../../types/common';

/**
 * API request interface definitions
 */
export interface ApiRequest<T> {
  data: T;
  metadata?: {
    requestId: string;
    timestamp: Date;
    version: string;
  };
}

export interface BulkRequest<T> {
  items: T[];
  metadata?: {
    requestId: string;
    timestamp: Date;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  filter?: Record<string, unknown>;
  search?: string;
}

export interface ListRequest extends QueryParams {
  includeArchived?: boolean;
  includeDeleted?: boolean;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'exists' | 'regex';
  value: unknown;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface AdvancedFilterRequest {
  filters: FilterCondition[];
  sort?: SortOption[];
  pagination?: PaginationParams;
  search?: string;
}

/**
 * Zod validation schemas
 */
const FilterConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'exists', 'regex']),
  value: z.unknown(),
});

const SortOptionSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']),
});

export const QueryParamsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sort: z.string().optional(),
  filter: z.record(z.unknown()).optional(),
  search: z.string().optional(),
});

export const ListRequestSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sort: z.string().optional(),
  filter: z.record(z.unknown()).optional(),
  search: z.string().optional(),
  includeArchived: z.boolean().optional(),
  includeDeleted: z.boolean().optional(),
});

export const AdvancedFilterRequestSchema = z.object({
  filters: z.array(FilterConditionSchema),
  sort: z.array(SortOptionSchema).optional(),
  pagination: z
    .object({
      page: z.number().min(1),
      limit: z.number().min(1).max(100),
      offset: z.number().min(0).optional(),
    })
    .optional(),
  search: z.string().optional(),
});

export const ApiRequestSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    metadata: z
      .object({
        requestId: z.string().uuid(),
        timestamp: z.date(),
        version: z.string(),
      })
      .optional(),
  });

export const BulkRequestSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema).min(1).max(1000),
    metadata: z
      .object({
        requestId: z.string().uuid(),
        timestamp: z.date(),
      })
      .optional(),
  });

export type ValidatedQueryParams = z.infer<typeof QueryParamsSchema>;
export type ValidatedListRequest = z.infer<typeof ListRequestSchema>;
export type ValidatedAdvancedFilterRequest = z.infer<typeof AdvancedFilterRequestSchema>;
