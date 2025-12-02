/**
 * Fastify.js middleware for request validation
 */

import { ZodSchema } from 'zod';
import { validate, ValidationErrorDetail } from '../validators/index.js';

export interface FastifyRequest {
  body: unknown;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  headers: Record<string, unknown>;
  validationErrors?: ValidationErrorDetail[];
  validated?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FastifyReply {
  status(code: number): FastifyReply;
  send(data: unknown): FastifyReply;
  [key: string]: unknown;
}

export interface FastifyInstance {
  addHook(
    event: string,
    handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  ): void;
  register(plugin: (fastify: FastifyInstance) => Promise<void>): Promise<void>;
  [key: string]: unknown;
}

export interface FastifyValidationOptions {
  stopOnError?: boolean;
  coerceTypes?: boolean;
  logger?: FastifyLogger;
  hardening?: {
    maxBodyBytes?: number;
    allowedContentTypes?: string[];
    correlationIdHeader?: string;
  };
}

export interface FastifyValidationError {
  errors: ValidationErrorDetail[];
  message: string;
}

type FastifyLogger = Partial<{
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
}>;

let logger: FastifyLogger = console;

export function configureFastifyValidationLogger(custom: FastifyLogger): void {
  logger = custom;
}

/**
 * Fastify hook factory for body validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Fastify hook function
 */
export function createBodyValidationHook(
  schema: ZodSchema,
  options: FastifyValidationOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const activeLogger = options.logger ?? logger;
    const correlationIdHeader = options.hardening?.correlationIdHeader ?? 'x-request-id';
    const correlationId =
      (request.headers?.[correlationIdHeader] as string | undefined) ?? undefined;

    if (options.hardening?.maxBodyBytes) {
      const contentLengthHeader = request.headers?.['content-length'];
      const contentLength =
        typeof contentLengthHeader === 'string' ? Number(contentLengthHeader) : Number.NaN;
      if (!Number.isNaN(contentLength) && contentLength > options.hardening.maxBodyBytes) {
        await reply.status(413).send({
          success: false,
          message: 'Payload too large',
          code: 'schemas/body_size_exceeded',
          correlationId,
        });
        return;
      }
    }

    if (options.hardening?.allowedContentTypes?.length) {
      const contentType = String(request.headers?.['content-type'] ?? '').toLowerCase();
      const isAllowed = options.hardening.allowedContentTypes.some((allowed) =>
        contentType.includes(allowed.toLowerCase())
      );
      if (!isAllowed) {
        await reply.status(415).send({
          success: false,
          message: 'Unsupported content type',
          allowedContentTypes: options.hardening.allowedContentTypes,
          correlationId,
        });
        return;
      }
    }

    const result = validate(schema, request.body);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        await reply.status(400).send({
          success: false,
          message: 'Request body validation failed',
          errors: result.errors,
          correlationId,
        });
        return;
      }
      activeLogger.warn?.('Fastify body validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
        correlationId,
      });
      request.validationErrors = (request.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      request.validated = request.validated || {};
      request.validated['body'] = result.data;
      (request as unknown as Record<string, unknown>)['body'] = result.data;
    }
  };
}

/**
 * Fastify hook factory for query validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Fastify hook function
 */
export function createQueryValidationHook(
  schema: ZodSchema,
  options: FastifyValidationOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const activeLogger = options.logger ?? logger;
    const correlationIdHeader = options.hardening?.correlationIdHeader ?? 'x-request-id';
    const correlationId =
      (request.headers?.[correlationIdHeader] as string | undefined) ?? undefined;
    const result = validate(schema, request.query);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        await reply.status(400).send({
          success: false,
          message: 'Query validation failed',
          errors: result.errors,
          correlationId,
        });
        return;
      }
      activeLogger.warn?.('Fastify query validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
        correlationId,
      });
      request.validationErrors = (request.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      request.validated = request.validated || {};
      request.validated['query'] = result.data;
      (request as unknown as Record<string, unknown>)['query'] = result.data;
    }
  };
}

/**
 * Fastify hook factory for params validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Fastify hook function
 */
export function createParamsValidationHook(
  schema: ZodSchema,
  options: FastifyValidationOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const activeLogger = options.logger ?? logger;
    const correlationIdHeader = options.hardening?.correlationIdHeader ?? 'x-request-id';
    const correlationId =
      (request.headers?.[correlationIdHeader] as string | undefined) ?? undefined;
    const result = validate(schema, request.params);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        await reply.status(400).send({
          success: false,
          message: 'Route parameter validation failed',
          errors: result.errors,
          correlationId,
        });
        return;
      }
      activeLogger.warn?.('Fastify params validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
        correlationId,
      });
      request.validationErrors = (request.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      request.validated = request.validated || {};
      request.validated['params'] = result.data;
      (request as unknown as Record<string, unknown>)['params'] = result.data;
    }
  };
}

/**
 * Fastify hook factory for header validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Fastify hook function
 */
export function createHeadersValidationHook(
  schema: ZodSchema,
  options: FastifyValidationOptions = {}
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const activeLogger = options.logger ?? logger;
    const correlationIdHeader = options.hardening?.correlationIdHeader ?? 'x-request-id';
    const correlationId =
      (request.headers?.[correlationIdHeader] as string | undefined) ?? undefined;
    const result = validate(schema, request.headers);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        await reply.status(400).send({
          success: false,
          message: 'Header validation failed',
          errors: result.errors,
          correlationId,
        });
        return;
      }
      activeLogger.warn?.('Fastify header validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
        correlationId,
      });
      request.validationErrors = (request.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      request.validated = request.validated || {};
      request.validated['headers'] = result.data;
    }
  };
}

/**
 * Fastify error handler for validation errors
 * Register this as an error handler in Fastify
 * @returns Fastify error handler function
 */
export function createValidationErrorHandler(): (
  error: Error | unknown,
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void> {
  return async (
    error: Error | unknown,
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (request.validationErrors && request.validationErrors.length > 0) {
      const correlationId = (request.headers?.['x-request-id'] as string | undefined) ?? undefined;
      await reply.status(400).send({
        success: false,
        message: 'Request validation failed',
        errors: request.validationErrors,
        correlationId,
      });
      return;
    }
    throw error;
  };
}

/**
 * Fastify plugin factory for automatic validation
 * Usage: fastify.register(createValidationPlugin(schemas))
 * @param schemas - Object with optional schema definitions
 * @param options - Validation options
 * @returns Fastify plugin function
 */
export function createValidationPlugin(
  schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
  },
  options: FastifyValidationOptions = {}
): (fastify: FastifyInstance) => Promise<void> {
  return async (fastify: FastifyInstance): Promise<void> => {
    if (schemas.body) {
      fastify.addHook('preHandler', createBodyValidationHook(schemas.body, options));
    }
    if (schemas.query) {
      fastify.addHook('preHandler', createQueryValidationHook(schemas.query, options));
    }
    if (schemas.params) {
      fastify.addHook('preHandler', createParamsValidationHook(schemas.params, options));
    }
    if (schemas.headers) {
      fastify.addHook('preHandler', createHeadersValidationHook(schemas.headers, options));
    }
  };
}
