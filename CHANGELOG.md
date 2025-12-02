# Changelog

All notable changes to the `@kitium-ai/schema` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Request Validation Middleware

- **Express.js Middleware** - Automatic request validation for Express applications
  - `validateBody(schema, options)` - Validate request body
  - `validateQuery(schema, options)` - Validate query parameters
  - `validateParams(schema, options)` - Validate route parameters
  - `validateHeaders(schema, options)` - Validate request headers
  - `validateRequest(schemas, options)` - Validate multiple request sources
  - `validationErrorHandler()` - Centralized error handling middleware
  - `ValidatedRequest` interface for type-safe request objects

- **Fastify.js Plugin** - Request validation for Fastify applications
  - `createBodyValidationHook(schema, options)` - Fastify body validation hook
  - `createQueryValidationHook(schema, options)` - Fastify query validation hook
  - `createParamsValidationHook(schema, options)` - Fastify params validation hook
  - `createHeadersValidationHook(schema, options)` - Fastify headers validation hook
  - `createValidationPlugin(schemas, options)` - Fastify plugin for automatic validation
  - `createValidationErrorHandler()` - Fastify error handler

#### Cross-Field & Conditional Validation

- `validateWithCrossFields<T>(schema, data, rules)` - Validate field relationships and dependencies
  - `CrossFieldValidationResult<T>` interface with `fieldDependencies` tracking
  - Support for conditional validation rules with field mapping

- `validateMultiple<T>(schemas, data)` - Validate multiple schemas simultaneously
- `validateConditional<T>(schema, data, condition)` - Conditional schema validation based on predicates

#### Middleware Utilities & Helpers

- **Schema Composition:**
  - `withCrossFieldValidation(schema, validator)` - Add cross-field validation to Zod schemas
  - `withConditionalValidation(schema, condition, validator)` - Conditional schema validation decorator
  - `combineSchemas(schemas)` - Merge multiple Zod schemas
  - `extendSchema(baseSchema, extensions)` - Extend existing schema with new fields

- **Error Management:**
  - `filterErrorsByField(errors, fields)` - Filter validation errors by field names
  - `createErrorMessageMapper(errorMap)` - Custom error message transformation
  - `mergeValidationErrors(...errors)` - Combine multiple error arrays with deduplication
  - `formatErrorsAs(errors, format)` - Format errors as JSON, CSV, or HTML

- **Data Processing:**
  - `sanitizeData(data)` - Remove null and undefined values
  - `createBatchValidator(schema)` - Batch validation with detailed results
  - `createTypeGuard(schema)` - Create TypeScript type guard from schema
  - `createValidatorDecorator(schema, extractor)` - Decorator-based validation support

#### Middleware Module

- New `/middleware` module with:
  - `src/middleware/express.ts` - Express.js middleware implementations
  - `src/middleware/fastify.ts` - Fastify plugin implementations
  - `src/middleware/utils.ts` - Utility functions for validation
  - `src/middleware/index.ts` - Module exports

#### Compliance & Governance

- Added audit stamps, tenant ownership, residency metadata, and PII classification to core user, organization, billing, and integration schemas
- Added secret metadata and rotation flags to integration credentials for safer handling of sensitive values

#### Framework Integrations & Exports

- Next.js App Router wrapper (`withNextValidation`) for typed route handlers
- NestJS pipe factory (`createNestValidationPipe`) and tRPC input validator helper
- Lightweight JSON Schema/OpenAPI exports via `exportJsonSchema` and `toOpenAPIParameter`

#### Middleware Hardening

- Optional `hardening` options for Express/Fastify middleware to enforce payload size, allowed content types, and correlation ID headers
- Logger injection hooks for middleware and validators with console-based defaults to keep runtime dependencies minimal

#### Updated Exports

- Updated `src/index.ts` to export all middleware and utilities
- All middleware functionality accessible from `@kitium-ai/schema` and `@kitium-ai/schema/middleware`

### Fixed

- **TypeScript Compilation Errors:**
  - Resolved `ValidationOptions` export name conflict between Express and Fastify modules
    - Renamed Fastify's `ValidationOptions` to `FastifyValidationOptions` to avoid export collision
  - Fixed type casting issues in `withCrossFieldValidation` and `withConditionalValidation`
    - Changed return types from `T` to `z.ZodEffects<T, any, any>` for proper type safety
  - Removed unused imports in Express middleware
  - Fixed unused variable warnings with proper underscore prefixes
  - Added proper type annotations for error parameters in callback functions
  - Fixed type safety in `createValidatorDecorator` and `createBatchValidator`

### Documentation

- **README Updates:**
  - New "Request Validation Middleware" section with comprehensive examples
  - Express.js middleware examples with body, query, params, and header validation
  - Fastify plugin integration examples
  - Cross-field validation examples with condition-based validation
  - Conditional validation examples
  - Custom error message mapping examples
  - Middleware utilities examples

- **Governance & Operations:**
  - Added versioning, deprecation, and LTS support policy
  - Documented security/compliance defaults (audit stamps, residency, PII classification, secret metadata)
  - Added extensibility playbook, tree-shaking guidance, and compatibility expectations
  - New adapter examples for Next.js, NestJS, and OpenAPI/JSON Schema export

- **Integration Examples:**
  - Express.js with automatic middleware validation
  - Fastify with plugin registration
  - Advanced validation patterns and utilities

### Technical Details

- **ValidationOptions Interface:**
  - `stopOnError?: boolean` - Stop validation on first error
  - `coerceTypes?: boolean` - Type coercion support

- **FastifyValidationOptions Interface:**
  - `stopOnError?: boolean` - Stop validation on first error
  - `coerceTypes?: boolean` - Type coercion support

- **Middleware Features:**
  - Automatic request body, query, params, and header validation
  - Chainable middleware for multiple validation steps
  - Accumulated error handling with optional immediate stops
  - Type-safe request objects with validated data

- **Cross-Field Validation:**
  - Field dependency tracking
  - Custom error messages per rule
  - Support for complex validation logic
  - Integration with standard validation flow

## [1.0.0] - 2024

### Added

- Initial stable release of `@kitium-ai/schema`
- Comprehensive schema definitions for:
  - Core entities (User, Organization, Team, Role, Permission)
  - Authentication (Login, Registration, Tokens, Sessions, MFA)
  - Organization management (Team Members, Invitations)
  - Product features (Features, Workspaces, Integrations)
  - Billing (Plans, Subscriptions, Payments, Invoices)
  - API standards (Requests, Responses, Pagination, Filtering)
  - Common types and utilities

- Validation utilities:
  - `validate<T>()` - Safe validation with result object
  - `validateOrThrow<T>()` - Validation with error throwing
  - `validateAsync<T>()` - Promise-based validation
  - `partialValidate<T>()` - Field-specific validation
  - `validateBatch<T>()` - Batch item validation
  - `isValid<T>()` - Type guard validation

- Error handling:
  - `ValidationError` class
  - `ValidationErrorDetail` interface
  - `ValidationResult<T>` interface
  - `formatValidationErrors()` utility

- Type safety:
  - Full TypeScript support
  - Type inference from schemas
  - Branded types for UUIDs, emails, URLs
  - Status enums and constants

- Security features:
  - Password complexity validation
  - Email validation
  - URL validation
  - Permission-based access control
  - Audit logging support

---

## Migration Guide

### From 1.0.0 to Unreleased (with Middleware)

**Express.js Integration:**

Before:
```typescript
const result = validate(CreateUserSchema, req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.errors });
}
```

After:
```typescript
app.post('/users', validateBody(CreateUserSchema), (req, res) => {
  res.json({ user: req.body });
});
```

**Fastify Integration:**

Before:
```typescript
// Manual validation in route handler
```

After:
```typescript
fastify.register(createValidationPlugin({ body: CreateUserSchema }));
// Automatic validation for all registered schemas
```

---

## Support

For issues, questions, or contributions, please visit:
- 🐛 [Issues](https://github.com/kitium-ai/schemas/issues)
- 💬 [Discussions](https://github.com/kitium-ai/schemas/discussions)
- 📖 [Documentation](https://github.com/kitium-ai/schemas)
