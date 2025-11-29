/**
 * Validation utilities for schema validation and error handling
 */

import { ZodSchema, ZodError } from 'zod';

/**
 * Validation result types
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationErrorDetail[];
}

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
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
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
  return schema.parse(data) as T;
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
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
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

export class ValidationError extends Error {
  constructor(
    public errors: ValidationErrorDetail[],
    message?: string
  ) {
    super(message || formatValidationErrors(errors));
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

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? (validated as Partial<T>) : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Cross-field validation result
 */
export interface CrossFieldValidationResult<T> extends ValidationResult<T> {
  fieldDependencies?: Record<string, string[]>;
}

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
  }

  return {
    success: baseResult.success && crossFieldErrors.length === 0,
    data: baseResult.success && crossFieldErrors.length === 0 ? baseResult.data : undefined,
    errors: [...(baseResult.errors || []), ...crossFieldErrors],
    fieldDependencies: rules.reduce(
      (acc, rule, idx) => {
        acc[`rule_${idx}`] = rule.fields;
        return acc;
      },
      {} as Record<string, string[]>
    ),
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
