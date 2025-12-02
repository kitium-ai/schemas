/**
 * Express.js middleware for request validation
 *
 * Integrates with @kitiumai/error and @kitiumai/logger for comprehensive
 * request validation with structured error handling and observability.
 */

import type { ZodSchema } from 'zod';
import { getLogger } from '@kitiumai/logger';
import { type ProblemDetails } from '@kitiumai/error';
import { validate, type ValidationErrorDetail } from '../validators/index.js';

const logger = getLogger();

export type ExpressRequest = {
  body: unknown;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  headers: Record<string, unknown>;
  [key: string]: unknown;
};
export type ExpressResponse = {
  status(code: number): ExpressResponse;
  json(data: unknown): ExpressResponse;
  [key: string]: unknown;
};
export type ExpressNextFunction = (error?: Error | unknown) => void;

export interface ValidationOptions {
  stopOnError?: boolean;
  coerceTypes?: boolean;
  errorHandler?: (errors: ValidationErrorDetail[]) => ProblemDetails;
}

export interface ValidatedRequest extends ExpressRequest {
  validated?: Record<string, unknown>;
  validationErrors?: ValidationErrorDetail[];
}

/**
 * Express middleware factory for body validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateBody(
  schema: ZodSchema,
  options: ValidationOptions = {}
): (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => void {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
    const result = validate(schema, req.body);

    if (!result.success && result.errors) {
      logger.warn('Body validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
      });

      if (options.stopOnError) {
        const problemDetails: ProblemDetails = options.errorHandler
          ? options.errorHandler(result.errors)
          : {
              type: 'https://docs.kitium.ai/errors/validation_failed',
              title: 'Request validation failed',
              status: 400,
              detail: 'The request body failed validation',
              extensions: {
                code: 'schemas/body_validation_failed',
                errors: result.errors,
              },
            };

        res.status(problemDetails.status ?? 400).json({
          success: false,
          message: problemDetails.title,
          ...problemDetails,
        });
        return;
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated['body'] = result.data;
      (req as unknown as Record<string, unknown>)['body'] = result.data;
    }

    next();
  };
}

/**
 * Express middleware factory for query validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateQuery(
  schema: ZodSchema,
  options: ValidationOptions = {}
): (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => void {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
    const result = validate(schema, req.query);

    if (!result.success && result.errors) {
      logger.warn('Query validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
      });

      if (options.stopOnError) {
        const problemDetails: ProblemDetails = options.errorHandler
          ? options.errorHandler(result.errors)
          : {
              type: 'https://docs.kitium.ai/errors/validation_failed',
              title: 'Query validation failed',
              status: 400,
              detail: 'The query parameters failed validation',
              extensions: {
                code: 'schemas/query_validation_failed',
                errors: result.errors,
              },
            };

        res.status(problemDetails.status ?? 400).json({
          success: false,
          message: problemDetails.title,
          ...problemDetails,
        });
        return;
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated['query'] = result.data;
      (req as unknown as Record<string, unknown>)['query'] = result.data;
    }

    next();
  };
}

/**
 * Express middleware factory for params validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateParams(
  schema: ZodSchema,
  options: ValidationOptions = {}
): (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => void {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
    const result = validate(schema, req.params);

    if (!result.success && result.errors) {
      logger.warn('Route parameters validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
      });

      if (options.stopOnError) {
        const problemDetails: ProblemDetails = options.errorHandler
          ? options.errorHandler(result.errors)
          : {
              type: 'https://docs.kitium.ai/errors/validation_failed',
              title: 'Route parameter validation failed',
              status: 400,
              detail: 'The route parameters failed validation',
              extensions: {
                code: 'schemas/params_validation_failed',
                errors: result.errors,
              },
            };

        res.status(problemDetails.status ?? 400).json({
          success: false,
          message: problemDetails.title,
          ...problemDetails,
        });
        return;
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated['params'] = result.data;
      (req as unknown as Record<string, unknown>)['params'] = result.data;
    }

    next();
  };
}

/**
 * Express middleware factory for header validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateHeaders(
  schema: ZodSchema,
  options: ValidationOptions = {}
): (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => void {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
    const result = validate(schema, req.headers);

    if (!result.success && result.errors) {
      logger.warn('Header validation failed', {
        errorCount: result.errors.length,
        fields: result.errors.map((e) => e.field),
      });

      if (options.stopOnError) {
        const problemDetails: ProblemDetails = options.errorHandler
          ? options.errorHandler(result.errors)
          : {
              type: 'https://docs.kitium.ai/errors/validation_failed',
              title: 'Header validation failed',
              status: 400,
              detail: 'The request headers failed validation',
              extensions: {
                code: 'schemas/headers_validation_failed',
                errors: result.errors,
              },
            };

        res.status(problemDetails.status ?? 400).json({
          success: false,
          message: problemDetails.title,
          ...problemDetails,
        });
        return;
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated['headers'] = result.data;
    }

    next();
  };
}

/**
 * Express error handling middleware for validation errors
 * Should be placed after all other middleware
 * @returns Express error handler middleware
 */
export function validationErrorHandler(): (
  req: ValidatedRequest,
  res: ExpressResponse,
  next: ExpressNextFunction
) => void {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
    if (req.validationErrors && req.validationErrors.length > 0) {
      logger.error('Request validation failed', {
        errorCount: req.validationErrors.length,
        errors: req.validationErrors,
      });

      const problemDetails: ProblemDetails = {
        type: 'https://docs.kitium.ai/errors/request_validation_failed',
        title: 'Request validation failed',
        status: 400,
        detail: 'One or more request fields failed validation',
        extensions: {
          code: 'schemas/request_validation_failed',
          errors: req.validationErrors,
        },
      };

      res.status(400).json({
        success: false,
        message: problemDetails.title,
        ...problemDetails,
      });
      return;
    }
    next();
  };
}

/**
 * Express middleware to validate multiple sources (body, query, params, headers)
 * @param schemas - Object with optional schema definitions
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateRequest(
  schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
  },
  options: ValidationOptions = {}
): Array<(req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => void> {
  return [
    ...(schemas.body ? [validateBody(schemas.body, options)] : []),
    ...(schemas.query ? [validateQuery(schemas.query, options)] : []),
    ...(schemas.params ? [validateParams(schemas.params, options)] : []),
    ...(schemas.headers ? [validateHeaders(schemas.headers, options)] : []),
  ];
}
