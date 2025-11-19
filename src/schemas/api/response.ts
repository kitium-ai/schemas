/**
 * API response schema for standardized response structures
 */

import { z } from 'zod';
import { ErrorDetail } from '../../types/common';

/**
 * API response interface definitions
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    requestId: string;
    timestamp: Date;
    version: string;
    duration: number; // milliseconds
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: ErrorDetail[];
  statusCode: number;
  trackingId?: string;
}

export interface BulkResponse<T> {
  success: boolean;
  results: BulkResponseItem<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    errors: BulkError[];
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
  };
}

export interface BulkResponseItem<T> {
  id: string;
  data?: T;
  error?: ApiError;
  status: 'success' | 'error';
}

export interface BulkError {
  index: number;
  error: ApiError;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

/**
 * Success response codes
 */
export enum SuccessCode {
  OK = 'OK',
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  NO_CONTENT = 'NO_CONTENT',
  RESET_CONTENT = 'RESET_CONTENT',
}

/**
 * Error response codes
 */
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  INVALID_STATE_ERROR = 'INVALID_STATE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Zod validation schemas
 */
const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
  code: z.string(),
});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(ErrorDetailSchema).optional(),
  statusCode: z.number().int().min(400).max(599),
  trackingId: z.string().optional(),
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    metadata: z
      .object({
        requestId: z.string().uuid(),
        timestamp: z.date(),
        version: z.string(),
        duration: z.number().positive(),
      })
      .optional(),
  });

export const PaginatedApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema).optional(),
    error: ApiErrorSchema.optional(),
    pagination: z.object({
      page: z.number().min(1),
      limit: z.number().min(1),
      total: z.number().min(0),
      pages: z.number().min(0),
      hasMore: z.boolean(),
    }),
    metadata: z
      .object({
        requestId: z.string().uuid(),
        timestamp: z.date(),
        version: z.string(),
        duration: z.number().positive(),
      })
      .optional(),
  });

const BulkResponseItemSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    id: z.string(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    status: z.enum(['success', 'error']),
  });

const BulkErrorSchema = z.object({
  index: z.number().min(0),
  error: ApiErrorSchema,
});

export const BulkResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    results: z.array(BulkResponseItemSchema(dataSchema)),
    summary: z.object({
      total: z.number().min(0),
      successful: z.number().min(0),
      failed: z.number().min(0),
      errors: z.array(BulkErrorSchema),
    }),
    metadata: z
      .object({
        requestId: z.string().uuid(),
        timestamp: z.date(),
      })
      .optional(),
  });

export type ValidatedApiError = z.infer<typeof ApiErrorSchema>;
