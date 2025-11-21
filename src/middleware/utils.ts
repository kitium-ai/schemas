/**
 * Utility functions for middleware validation
 */

import { ZodSchema, z } from 'zod';
import { ValidationErrorDetail } from '../validators/index.js';

/**
 * Creates a custom Zod schema with cross-field validation
 * @param schema - Base Zod schema
 * @param validator - Validation function that receives the entire object
 * @returns Enhanced Zod schema with cross-field validation
 */
export function withCrossFieldValidation<T extends z.ZodTypeAny>(
  schema: T,
  validator: (data: z.infer<T>) => boolean | { field: string; message: string }[],
): z.ZodEffects<T, any, any> {
  return schema.refine(
    (data) => {
      const result = validator(data);
      return result === true || (Array.isArray(result) && result.length === 0);
    },
    {
      message: 'Cross-field validation failed',
    },
  );
}

/**
 * Creates a conditional validation schema
 * @param schema - Base Zod schema
 * @param condition - Function that determines if validation should apply
 * @param validator - Validation function to apply when condition is true
 * @returns Conditional Zod schema
 */
export function withConditionalValidation<T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: z.infer<T>) => boolean,
  validator: (data: z.infer<T>) => boolean,
): z.ZodEffects<T, any, any> {
  return schema.refine(
    (data) => {
      if (condition(data)) {
        return validator(data);
      }
      return true;
    },
    {
      message: 'Conditional validation failed',
    },
  );
}

/**
 * Merges multiple validation errors from different sources
 * @param errors - Array of error arrays to merge
 * @returns Merged unique validation errors
 */
export function mergeValidationErrors(...errors: ValidationErrorDetail[][]): ValidationErrorDetail[] {
  const errorMap = new Map<string, ValidationErrorDetail>();

  for (const errorArray of errors) {
    for (const error of errorArray) {
      const key = `${error.field}:${error.code}`;
      if (!errorMap.has(key)) {
        errorMap.set(key, error);
      }
    }
  }

  return Array.from(errorMap.values());
}

/**
 * Filters validation errors by field name(s)
 * @param errors - Array of validation errors
 * @param fields - Field name(s) to filter by
 * @returns Filtered validation errors
 */
export function filterErrorsByField(
  errors: ValidationErrorDetail[],
  fields: string | string[],
): ValidationErrorDetail[] {
  const fieldArray = Array.isArray(fields) ? fields : [fields];
  return errors.filter((error) => fieldArray.includes(error.field));
}

/**
 * Creates a custom error message mapper for validation errors
 * @param errorMap - Object mapping field names to custom messages
 * @returns Function that transforms validation errors
 */
export function createErrorMessageMapper(
  errorMap: Record<string, Record<string, string>>,
): (errors: ValidationErrorDetail[]) => ValidationErrorDetail[] {
  return (errors: ValidationErrorDetail[]) => {
    return errors.map((error) => {
      const fieldMessages = errorMap[error.field];
      const customMessage = fieldMessages?.[error.code];
      return {
        ...error,
        message: customMessage || error.message,
      };
    });
  };
}

/**
 * Combines multiple validation schemas into one
 * @param schemas - Array of Zod schemas
 * @returns Combined schema
 */
export function combineSchemas(schemas: ZodSchema[]): ZodSchema {
  return z.object({}).merge(schemas[0] as any);
}

/**
 * Creates a decorator-like validator function for methods
 * @param schema - Zod schema for validation
 * @param dataExtractor - Function to extract data from arguments
 * @returns Decorator function
 */
export function createValidatorDecorator(
  schema: ZodSchema,
  dataExtractor: (args: any[]) => unknown,
) {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const data = dataExtractor(args);
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Sanitizes request data by removing undefined/null values
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeData(data: Record<string, any>): Record<string, any> {
  return Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

/**
 * Transforms validation errors into different formats
 * @param errors - Array of validation errors
 * @param format - Output format ('json', 'csv', 'html')
 * @returns Formatted errors
 */
export function formatErrorsAs(
  errors: ValidationErrorDetail[],
  format: 'json' | 'csv' | 'html' = 'json',
): string {
  switch (format) {
    case 'csv':
      return errors.map((e) => `"${e.field}","${e.message}","${e.code}"`).join('\n');
    case 'html':
      return (
        '<ul>' +
        errors.map((e) => `<li><strong>${e.field}:</strong> ${e.message} (${e.code})</li>`).join('') +
        '</ul>'
      );
    case 'json':
    default:
      return JSON.stringify(errors, null, 2);
  }
}

/**
 * Creates a batch validator for processing multiple items
 * @param schema - Zod schema for validation
 * @returns Function to validate batch of items
 */
export function createBatchValidator(schema: ZodSchema) {
  return (items: unknown[]) => {
    const results = items.map((item, index) => {
      const result = schema.safeParse(item);
      return {
        index,
        success: result.success,
        data: result.success ? result.data : null,
        errors: !result.success
          ? result.error.errors.map((err: any) => ({
              field: `${index}.${err.path.join('.')}`,
              message: err.message,
              code: err.code,
            }))
          : [],
      };
    });

    const allErrors = results.flatMap((r) => r.errors);
    const allData = results.filter((r) => r.success).map((r) => r.data);

    return {
      success: allErrors.length === 0,
      data: allData,
      errors: allErrors,
      details: results,
    };
  };
}

/**
 * Creates a type guard function from a Zod schema
 * @param schema - Zod schema
 * @returns Type guard function
 */
export function createTypeGuard<T>(schema: ZodSchema): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return schema.safeParse(value).success;
  };
}

/**
 * Performs deep merging of validation schemas
 * @param baseSchema - Base schema to extend
 * @param extensions - Additional schema definitions to merge
 * @returns Merged schema
 */
export function extendSchema(baseSchema: z.ZodObject<any>, extensions: Record<string, ZodSchema>) {
  return baseSchema.extend(extensions as any);
}
