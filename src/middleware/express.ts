/**
 * Express.js middleware for request validation
 */

import { ZodSchema } from 'zod';
import { validate, ValidationResult, ValidationErrorDetail } from '../validators/index.js';

type ExpressRequest = any;
type ExpressResponse = any;
type ExpressNextFunction = (error?: any) => void;

export interface ValidationOptions {
  stopOnError?: boolean;
  coerceTypes?: boolean;
}

export interface ValidatedRequest extends ExpressRequest {
  validated?: Record<string, any>;
  validationErrors?: ValidationErrorDetail[];
}

/**
 * Express middleware factory for body validation
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateBody(schema: ZodSchema, options: ValidationOptions = {}) {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const result = validate(schema, req.body);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        return res.status(400).json({
          success: false,
          message: 'Request validation failed',
          errors: result.errors,
        });
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated.body = result.data;
      req.body = result.data;
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
export function validateQuery(schema: ZodSchema, options: ValidationOptions = {}) {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const result = validate(schema, req.query);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: result.errors,
        });
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated.query = result.data;
      req.query = result.data;
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
export function validateParams(schema: ZodSchema, options: ValidationOptions = {}) {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const result = validate(schema, req.params);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        return res.status(400).json({
          success: false,
          message: 'Route parameter validation failed',
          errors: result.errors,
        });
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated.params = result.data;
      req.params = result.data;
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
export function validateHeaders(schema: ZodSchema, options: ValidationOptions = {}) {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const result = validate(schema, req.headers);

    if (!result.success && result.errors) {
      if (options.stopOnError) {
        return res.status(400).json({
          success: false,
          message: 'Header validation failed',
          errors: result.errors,
        });
      }
      req.validationErrors = (req.validationErrors || []).concat(result.errors);
    } else if (result.data) {
      req.validated = req.validated || {};
      req.validated.headers = result.data;
    }

    next();
  };
}

/**
 * Express error handling middleware for validation errors
 * Should be placed after all other middleware
 * @returns Express error handler middleware
 */
export function validationErrorHandler() {
  return (req: ValidatedRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    if (req.validationErrors && req.validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Request validation failed',
        errors: req.validationErrors,
      });
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
  options: ValidationOptions = {},
) {
  return [
    ...(schemas.body ? [validateBody(schemas.body, options)] : []),
    ...(schemas.query ? [validateQuery(schemas.query, options)] : []),
    ...(schemas.params ? [validateParams(schemas.params, options)] : []),
    ...(schemas.headers ? [validateHeaders(schemas.headers, options)] : []),
  ];
}
