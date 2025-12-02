/**
 * Validation utilities for schema validation and error handling
 *
 * Provides comprehensive validation with integration to @kitiumai/error and @kitiumai/logger
 * for enterprise-grade error handling and observability.
 */

import type { ZodSchema, ZodError } from 'zod';
import { getLogger } from '@kitiumai/logger';
import { ValidationError as KitiumValidationError, type ErrorContext } from '@kitiumai/error';

const logger = getLogger();

/**
 * Validation result types
 */
export type ValidationResult<T> =
  | { success: true; data: T; errors?: undefined }
  | { success: false; data?: undefined; errors: ValidationErrorDetail[] };

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

/**
 * Validates data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Validation result with data or errors
 */
export function validate<T>(schema: ZodSchema, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated as T,
    };
  } catch (error) {
    const zodError = error as ZodError;
    if (zodError?.errors) {
      const errors: ValidationErrorDetail[] = zodError.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: String(err.code),
      }));

      logger.debug('Schema validation failed', {
        errorCount: errors.length,
        fields: errors.map((e) => e.field),
      });

      return {
        success: false,
        errors,
      };
    }
    logger.error('Unknown validation error occurred', { error });
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'An unknown validation error occurred',
          code: 'UNKNOWN_ERROR',
        },
      ],
    };
  }
}

/**
 * Validates data and throws an error if validation fails
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Validated data
 * @throws ValidationError if validation fails
 */
export function validateOrThrow<T>(schema: ZodSchema, data: unknown): T {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    const zodError = error as ZodError;
    const errors: ValidationErrorDetail[] = zodError?.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: String(err.code),
    })) ?? [{ field: 'unknown', message: String(error), code: 'UNKNOWN_ERROR' }];

    const context: ErrorContext = {
      validationErrors: errors,
      fieldCount: errors.length,
    };

    const kitiumError = new KitiumValidationError({
      code: 'schemas/validation_failed',
      message: 'Schema validation failed',
      statusCode: 400,
      severity: 'warning',
      retryable: false,
      context,
      help: `Validation errors: ${errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`,
    });

    logger.warn('Validation error thrown', { errors, context });
    throw kitiumError;
  }
}

/**
 * Safe validation that returns a Promise
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Promise with validation result
 */
export async function validateAsync<T>(
  schema: ZodSchema,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validated = await schema.parseAsync(data);
    return {
      success: true,
      data: validated as T,
    };
  } catch (error) {
    const zodError = error as ZodError;
    if (zodError?.errors) {
      const errors: ValidationErrorDetail[] = zodError.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: String(err.code),
      }));

      logger.debug('Async schema validation failed', {
        errorCount: errors.length,
        fields: errors.map((e) => e.field),
      });

      return {
        success: false,
        errors,
      };
    }
    logger.error('Unknown async validation error occurred', { error });
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'An unknown validation error occurred',
          code: 'UNKNOWN_ERROR',
        },
      ],
    };
  }
}

/**
 * Formats validation errors into a readable message
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationErrorDetail[]): string {
  return errors.map((err) => `${err.field}: ${err.message}`).join('; ');
}

/**
 * Partial validation - only validates specified fields
 * @param schema - The Zod schema to validate against
 * @param data - The data to partially validate
 * @param fields - Fields to validate (if not specified, validates all)
 * @returns Validation result
 */
export function partialValidate<T>(
  schema: ZodSchema,
  data: unknown,
  fields?: string[]
): ValidationResult<Partial<T>> {
  if (!fields || fields.length === 0) {
    return validate<Partial<T>>(schema, data);
  }

  const result = validate<T>(schema, data);
  if (result.errors) {
    result.errors = result.errors.filter((err) => fields.includes(err.field));
  }
  return result as ValidationResult<Partial<T>>;
}

/**
 * Batch validation for multiple items
 * @param schema - The Zod schema to validate against
 * @param items - Array of items to validate
 * @returns Array of validation results
 */
export function validateBatch<T>(schema: ZodSchema, items: unknown[]): ValidationResult<T>[] {
  return items.map((item) => validate<T>(schema, item));
}

/**
 * Check if an item is valid against a schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Boolean indicating if data is valid
 */
export function isValid<T>(schema: ZodSchema, data: unknown): data is T {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom validation error that wraps @kitiumai/error ValidationError
 * Maintains backward compatibility while leveraging error infrastructure
 */
export class ValidationError extends KitiumValidationError {
  constructor(
    public errors: ValidationErrorDetail[],
    message?: string
  ) {
    const context: ErrorContext = {
      validationErrors: errors,
      fieldCount: errors.length,
    };

    super({
      code: 'schemas/validation_error',
      message: message || formatValidationErrors(errors),
      statusCode: 400,
      severity: 'warning',
      retryable: false,
      context,
      help: formatValidationErrors(errors),
    });

    this.name = 'ValidationError';
  }
}

/**
 * Validates data against multiple schemas and returns combined results
 * @param schemas - Array of schemas to validate against
 * @param data - The data to validate
 * @returns Combined validation result
 */
export function validateMultiple<T extends Record<string, unknown>>(
  schemas: Record<string, ZodSchema>,
  data: unknown
): ValidationResult<Partial<T>> {
  const errors: ValidationErrorDetail[] = [];
  const validated: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(schemas)) {
    const result = validate(schema, (data as Record<string, unknown>)?.[key]);
    if (!result.success && result.errors) {
      errors.push(
        ...result.errors.map((err) => ({
          ...err,
          field: `${key}.${err.field}`,
        }))
      );
    } else if (result.data) {
      validated[key] = result.data;
    }
  }

  if (errors.length === 0) {
    return {
      success: true,
      data: validated as Partial<T>,
    };
  }
  return {
    success: false,
    errors,
  };
}

/**
 * Cross-field validation result with field dependency tracking
 */
export type CrossFieldValidationResult<T> =
  | { success: true; data: T; errors?: undefined; fieldDependencies?: Record<string, string[]> }
  | {
      success: false;
      data?: undefined;
      errors: ValidationErrorDetail[];
      fieldDependencies?: Record<string, string[]>;
    };

/**
 * Validates cross-field dependencies and relationships
 * @param schema - The main Zod schema
 * @param data - The data to validate
 * @param rules - Array of cross-field validation rules
 * @returns Validation result including cross-field errors
 */
export function validateWithCrossFields<T>(
  schema: ZodSchema,
  data: unknown,
  rules: Array<{
    condition: (data: unknown) => boolean;
    message: string;
    fields: string[];
  }> = []
): CrossFieldValidationResult<T> {
  const baseResult = validate<T>(schema, data);
  const crossFieldErrors: ValidationErrorDetail[] = [];
  const allErrors: ValidationErrorDetail[] = [];

  if (baseResult.success && data) {
    for (const rule of rules) {
      if (!rule.condition(data)) {
        for (const field of rule.fields) {
          crossFieldErrors.push({
            field,
            message: rule.message,
            code: 'CROSS_FIELD_VALIDATION_FAILED',
          });
        }
      }
    }
  } else if (!baseResult.success && baseResult.errors) {
    allErrors.push(...baseResult.errors);
  }

  allErrors.push(...crossFieldErrors);

  const fieldDependencies = rules.reduce(
    (acc, rule, idx) => {
      acc[`rule_${idx}`] = rule.fields;
      return acc;
    },
    {} as Record<string, string[]>
  );

  if (baseResult.success && crossFieldErrors.length === 0) {
    const hasDependencies = Object.keys(fieldDependencies).length > 0;
    return {
      success: true,
      data: baseResult.data,
      ...(hasDependencies ? { fieldDependencies } : {}),
    };
  }
  const hasDependencies = Object.keys(fieldDependencies).length > 0;
  return {
    success: false,
    errors: allErrors,
    ...(hasDependencies ? { fieldDependencies } : {}),
  };
}

/**
 * Conditional validation - validates based on a condition
 * @param schema - The Zod schema
 * @param data - The data to validate
 * @param condition - Function that determines if validation should proceed
 * @returns Validation result
 */
export function validateConditional<T>(
  schema: ZodSchema,
  data: unknown,
  condition: (data: unknown) => boolean
): ValidationResult<T> {
  if (!condition(data)) {
    return {
      success: true,
      data: data as T,
    };
  }

  return validate<T>(schema, data);
}
