import { z, type ZodSchema, type ZodTypeAny } from 'zod';
import { validate, validateOrThrow, type ValidationErrorDetail } from '../validators/index.js';

export interface NextValidationResult<T> {
  data?: T;
  errors?: ValidationErrorDetail[];
  status?: number;
}

export function withNextValidation<T>(
  schema: ZodSchema,
  handler: (request: Request, data: T) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const payload = await request.json();
    const result = validate<T>(schema, payload);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: result.errors,
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return handler(request, result.data as T);
  };
}

export interface NestPipeTransform<T> {
  transform: (value: unknown) => T;
}

export function createNestValidationPipe<T>(schema: ZodSchema): NestPipeTransform<T> {
  return {
    transform: (value: unknown): T => validateOrThrow<T>(schema, value),
  };
}

export function createTRPCInputValidator<T>(schema: ZodSchema): (input: unknown) => T {
  return (input: unknown): T => validateOrThrow<T>(schema, input);
}

export interface JsonSchema {
  title?: string;
  type?: string;
  format?: string;
  enum?: string[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  anyOf?: JsonSchema[];
  additionalProperties?: JsonSchema | boolean;
  description?: string;
}

function unwrap(schema: ZodTypeAny): ZodTypeAny {
  let current: ZodTypeAny = schema;

  while (current._def?.typeName === z.ZodFirstPartyTypeKind.ZodEffects) {
    current = (current._def as { schema: ZodTypeAny }).schema;
  }
  return current;
}

function convertSchema(schema: ZodTypeAny): JsonSchema {
  const unwrapped = unwrap(schema);

  switch (unwrapped._def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const shape = (unwrapped._def as { shape: () => Record<string, ZodTypeAny> }).shape();
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = convertSchema(value);

        if (value._def.typeName !== z.ZodFirstPartyTypeKind.ZodOptional) {
          required.push(key);
        }
      }
      const schema: JsonSchema = { type: 'object', properties };
      if (required.length) {
        schema.required = required;
      }
      return schema;
    }
    case z.ZodFirstPartyTypeKind.ZodString: {
      const stringFormat = (unwrapped._def as { checks?: Array<{ kind: string }> }).checks?.[0]
        ?.kind;
      return {
        type: 'string',
        ...(stringFormat ? { format: stringFormat } : {}),
      };
    }
    case z.ZodFirstPartyTypeKind.ZodNumber:
      return { type: 'number' };
    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return { type: 'boolean' };
    case z.ZodFirstPartyTypeKind.ZodDate:
      return { type: 'string', format: 'date-time' };
    case z.ZodFirstPartyTypeKind.ZodEnum:
      return { type: 'string', enum: [...(unwrapped._def as { values: string[] }).values] };
    case z.ZodFirstPartyTypeKind.ZodArray:
      return { type: 'array', items: convertSchema((unwrapped._def as { type: ZodTypeAny }).type) };
    case z.ZodFirstPartyTypeKind.ZodOptional:
      return convertSchema((unwrapped._def as { innerType: ZodTypeAny }).innerType);
    case z.ZodFirstPartyTypeKind.ZodUnion:
      return {
        anyOf: (unwrapped._def as { options: ZodTypeAny[] }).options.map((option) =>
          convertSchema(option)
        ),
      };
    case z.ZodFirstPartyTypeKind.ZodRecord:
      return {
        type: 'object',
        additionalProperties: convertSchema(
          (unwrapped._def as { valueType: ZodTypeAny }).valueType
        ),
      };
    default:
      return { type: 'string' };
  }
}

export function exportJsonSchema(schema: ZodSchema, title?: string): JsonSchema {
  const json = convertSchema(schema as ZodTypeAny);
  if (title) {
    json.title = title;
  }
  return json;
}

export function toOpenAPIParameter(
  schema: ZodSchema,
  name: string,
  location: 'query' | 'path' | 'header'
) {
  return {
    name,
    in: location,
    required: true,
    schema: exportJsonSchema(schema),
  };
}
