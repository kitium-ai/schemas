# @kitium-ai/schema

Enterprise-ready reusable schema definitions for Product SaaS applications. Provides comprehensive, type-safe, and validated schemas using Zod for TypeScript-first development.

## Features

✅ **Type-Safe** - Full TypeScript support with inferred types
✅ **Validation** - Built-in validation using Zod
✅ **Request Middleware** - Express.js and Fastify middleware for automatic validation
✅ **Cross-Field Validation** - Support for complex field relationships
✅ **Enterprise-Ready** - Schemas for multi-tenant SaaS applications
✅ **Comprehensive** - Covers core entities, auth, products, billing, and APIs
✅ **Extensible** - Easy to extend and customize for your needs
✅ **Zero Runtime Dependencies** - Minimal dependencies (only Zod)
✅ **Well-Documented** - Extensive examples and documentation

## Installation

```bash
npm install @kitium-ai/schema
# or
yarn add @kitium-ai/schema
# or
pnpm add @kitium-ai/schema
```

## Quick Start

```typescript
import { UserSchema, validate } from '@kitium-ai/schema';

const userData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'active',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = validate(UserSchema, userData);
if (result.success) {
  console.log('Valid user:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}
```

## Schema Categories

### Core Schemas

Core entities for user and organization management:

- **User** - User account management with preferences
- **Organization** - Multi-tenant organization management
- **Team** - Team management within organizations
- **Role** - Role-based access control (RBAC)
- **Permission** - Fine-grained permission management

```typescript
import {
  UserSchema,
  OrganizationSchema,
  RoleSchema,
  CreateUserSchema,
  CreateOrganizationSchema,
  validate,
} from '@kitium-ai/schema/core';

// Validate user creation
const result = validate(CreateUserSchema, {
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  acceptTerms: true,
});
```

### Authentication Schemas

Authentication, login, and token management:

- **AuthToken** - Access and refresh tokens
- **Session** - User sessions with activity tracking
- **MFASettings** - Multi-factor authentication configuration
- **LoginCredentials** - Login request validation
- **PasswordReset** - Password reset flow
- **OAuthInput** - OAuth provider integration

```typescript
import {
  LoginCredentialsSchema,
  RegisterInputSchema,
  PasswordResetSchema,
  validate,
} from '@kitium-ai/schema/auth';

// Validate login
const loginResult = validate(LoginCredentialsSchema, {
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
});

// Validate registration
const regResult = validate(RegisterInputSchema, {
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  firstName: 'Jane',
  lastName: 'Doe',
  organizationName: 'Acme Corp',
  acceptTerms: true,
});
```

### Organization Schemas

Team member management and invitations:

- **TeamMember** - Organization team members
- **OrganizationInvitation** - Invitation system
- **InviteMember** - Invite member request

```typescript
import {
  InviteMemberSchema,
  UpdateTeamMemberSchema,
  validate,
} from '@kitium-ai/schema/organization';

// Validate team member invitation
const inviteResult = validate(InviteMemberSchema, {
  email: 'newmember@example.com',
  roleIds: ['role-uuid-1', 'role-uuid-2'],
  message: 'Welcome to our team!',
  expiresIn: 7,
});
```

### Product Schemas

Features, workspaces, and integrations:

- **Feature** - Feature flags and feature management
- **Workspace** - Project workspaces
- **WorkspaceMember** - Workspace member management
- **Integration** - Third-party integrations
- **IntegrationCredential** - Integration credentials

```typescript
import {
  CreateFeatureSchema,
  CreateWorkspaceSchema,
  CreateIntegrationSchema,
  validate,
} from '@kitium-ai/schema/product';

// Create feature flag
const featureResult = validate(CreateFeatureSchema, {
  name: 'New Dashboard',
  key: 'new_dashboard',
  description: 'Experimental new dashboard design',
  type: 'feature',
  enabled: false,
  rolloutPercentage: 10,
});

// Create workspace
const workspaceResult = validate(CreateWorkspaceSchema, {
  name: 'Engineering',
  description: 'Engineering team workspace',
  visibility: 'private',
});

// Create integration
const integrationResult = validate(CreateIntegrationSchema, {
  name: 'Stripe Payment',
  key: 'stripe_payment',
  type: 'api',
  config: {
    apiVersion: '2023-10-16',
    environment: 'production',
  },
});
```

### Billing Schemas

Subscriptions, payments, and invoicing:

- **Plan** - Pricing plans
- **Subscription** - Customer subscriptions
- **Invoice** - Invoice generation and tracking
- **Payment** - Payment processing
- **PaymentMethod** - Payment method management
- **Refund** - Refund handling

```typescript
import {
  CreatePlanSchema,
  CreateSubscriptionSchema,
  CreateInvoiceSchema,
  CreatePaymentSchema,
  validate,
} from '@kitium-ai/schema/billing';

// Create pricing plan
const planResult = validate(CreatePlanSchema, {
  name: 'Pro Plan',
  key: 'pro',
  price: 99.99,
  currency: 'USD',
  billingCycle: 'monthly',
  features: [
    { name: 'Users', included: true, limit: 50 },
    { name: 'Custom Integrations', included: true, limit: 10 },
    { name: 'API Access', included: true },
  ],
});

// Create subscription
const subResult = validate(CreateSubscriptionSchema, {
  planId: 'plan-uuid',
  autoRenew: true,
});

// Create invoice
const invoiceResult = validate(CreateInvoiceSchema, {
  subscriptionId: 'sub-uuid',
  items: [
    {
      description: 'Monthly subscription',
      quantity: 1,
      unitPrice: 99.99,
      amount: 99.99,
    },
  ],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

### API Schemas

Standardized request and response structures:

- **QueryParams** - Pagination and filtering
- **ListRequest** - List requests with advanced filtering
- **ApiRequest** - Standardized request wrapper
- **ApiResponse** - Standardized response wrapper
- **PaginatedApiResponse** - Paginated responses
- **BulkResponse** - Bulk operation responses

```typescript
import {
  QueryParamsSchema,
  ListRequestSchema,
  ApiResponseSchema,
  PaginatedApiResponseSchema,
  validate,
} from '@kitium-ai/schema/api';

// Validate list query
const queryResult = validate(QueryParamsSchema, {
  page: 1,
  limit: 20,
  sort: 'createdAt:desc',
  search: 'john',
});

// Validate advanced filtering
const listResult = validate(ListRequestSchema, {
  page: 1,
  limit: 50,
  filter: { status: 'active' },
  sort: 'name:asc',
  includeArchived: false,
});

// Type-safe response
const createResponseSchema = ApiResponseSchema(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
);

const apiResult = validate(createResponseSchema, {
  success: true,
  data: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Created Item',
  },
});
```

## Request Validation Middleware

The package includes built-in middleware for automatic request validation in Express.js and Fastify applications.

### Express.js Middleware

Use middleware functions to automatically validate request body, query, params, and headers:

```typescript
import express from 'express';
import {
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validationErrorHandler,
} from '@kitium-ai/schema';
import {
  CreateUserSchema,
  QueryParamsSchema,
  UserParamsSchema,
} from '@kitium-ai/schema';

const app = express();
app.use(express.json());

// Validate single source
app.post(
  '/users',
  validateBody(CreateUserSchema),
  (req, res) => {
    // req.body is validated and type-safe
    res.json({ user: req.body });
  },
);

// Validate multiple sources
app.get(
  '/users/:id',
  validateParams(UserParamsSchema),
  validateQuery(QueryParamsSchema),
  (req, res) => {
    // req.params and req.query are validated
    res.json({ user: req.params });
  },
);

// Error handling middleware (place after all routes)
app.use(validationErrorHandler());
```

### Fastify Plugin

Register validation as a Fastify plugin:

```typescript
import Fastify from 'fastify';
import { createValidationPlugin } from '@kitium-ai/schema';
import { CreateUserSchema, QueryParamsSchema } from '@kitium-ai/schema';

const fastify = Fastify();

// Register validation plugin
fastify.register(
  createValidationPlugin({
    body: CreateUserSchema,
    query: QueryParamsSchema,
  }),
);

fastify.post('/users', async (request, reply) => {
  // request.body and request.query are validated
  reply.send({ user: request.body });
});
```

### Cross-Field Validation

Validate relationships between fields:

```typescript
import { validateWithCrossFields } from '@kitium-ai/schema';
import { UpdateUserSchema } from '@kitium-ai/schema';

const result = validateWithCrossFields(
  UpdateUserSchema,
  {
    email: 'user@example.com',
    password: 'NewPass123!',
    passwordConfirm: 'NewPass123!',
  },
  [
    {
      condition: (data) => data.password === data.passwordConfirm,
      message: 'Passwords must match',
      fields: ['password', 'passwordConfirm'],
    },
  ],
);

if (!result.success) {
  console.log('Validation errors:', result.errors);
  console.log('Field dependencies:', result.fieldDependencies);
}
```

### Conditional Validation

Validate based on conditions:

```typescript
import { validateConditional, validateMultiple } from '@kitium-ai/schema';
import { UserSchema, BillingSchema } from '@kitium-ai/schema';

// Validate only if condition is true
const isPremium = true;
const result = validateConditional(
  BillingSchema,
  userData,
  () => isPremium,
);

// Validate multiple schemas
const multiResult = validateMultiple(
  {
    user: UserSchema,
    billing: BillingSchema,
  },
  data,
);
```

### Custom Error Messages

Map validation errors to custom messages:

```typescript
import {
  validate,
  createErrorMessageMapper,
} from '@kitium-ai/schema';
import { CreateUserSchema } from '@kitium-ai/schema';

const errorMapper = createErrorMessageMapper({
  email: {
    invalid_string: 'Please provide a valid email address',
  },
  password: {
    too_small: 'Password must be at least 8 characters',
  },
});

const result = validate(CreateUserSchema, data);
if (!result.success && result.errors) {
  const customErrors = errorMapper(result.errors);
  console.log('User-friendly errors:', customErrors);
}
```

### Middleware Utilities

Powerful utility functions for advanced validation scenarios:

```typescript
import {
  filterErrorsByField,
  sanitizeData,
  createBatchValidator,
  createTypeGuard,
  extendSchema,
} from '@kitium-ai/schema';
import { UserSchema } from '@kitium-ai/schema';

// Filter errors by specific fields
const emailErrors = filterErrorsByField(result.errors, ['email']);

// Remove null/undefined values
const clean = sanitizeData({ name: 'John', age: null });

// Batch validate items
const batchValidator = createBatchValidator(UserSchema);
const batchResult = batchValidator([user1, user2, user3]);

// Create type guard from schema
const isValidUser = createTypeGuard(UserSchema);
if (isValidUser(data)) {
  // data is typed as User
}

// Extend existing schema
const ExtendedUserSchema = extendSchema(UserSchema, {
  metadata: z.record(z.string()),
});
```

## Validation Utilities

The package provides convenient validation utilities:

### `validate<T>(schema, data)`

Validates data and returns a result object (no exceptions):

```typescript
import { UserSchema, validate } from '@kitium-ai/schema';

const result = validate(UserSchema, userData);
if (result.success) {
  console.log('Data:', result.data); // Type is UserSchema
} else {
  console.log('Errors:', result.errors);
  // errors is ValidationErrorDetail[]
}
```

### `validateOrThrow<T>(schema, data)`

Validates data and throws if invalid:

```typescript
import { UserSchema, validateOrThrow } from '@kitium-ai/schema';

try {
  const user = validateOrThrow(UserSchema, userData);
  console.log('Valid user:', user);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### `validateAsync<T>(schema, data)`

Async validation (useful for async validators):

```typescript
import { UserSchema, validateAsync } from '@kitium-ai/schema';

const result = await validateAsync(UserSchema, userData);
if (result.success) {
  console.log('Valid user:', result.data);
}
```

### `isValid<T>(schema, data)`

Type-safe validation check:

```typescript
import { UserSchema, isValid } from '@kitium-ai/schema';

if (isValid(UserSchema, userData)) {
  // userData is now typed as ValidatedUser
  console.log(userData.email);
}
```

### `validateBatch<T>(schema, items)`

Validate multiple items:

```typescript
import { UserSchema, validateBatch } from '@kitium-ai/schema';

const results = validateBatch(UserSchema, [user1, user2, user3]);
results.forEach((result) => {
  if (result.success) {
    console.log('Valid:', result.data);
  } else {
    console.log('Errors:', result.errors);
  }
});
```

### `partialValidate<T>(schema, data, fields)`

Validate only specific fields:

```typescript
import { UserSchema, partialValidate } from '@kitium-ai/schema';

const result = partialValidate(UserSchema, userData, ['email', 'firstName']);
// Only validates the specified fields
```

## Type Inference

All schemas support TypeScript type inference:

```typescript
import {
  UserSchema,
  CreateUserSchema,
  ValidatedUser,
  ValidatedCreateUser,
  UpdateUserSchema,
  ValidatedUpdateUser,
} from '@kitium-ai/schema/core';

// Using inferred types from validation
const result = validate(UserSchema, data);
if (result.success) {
  const user: ValidatedUser = result.data;
  // user is properly typed
}

// Pre-defined validated types
const createUser: ValidatedCreateUser = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  // ... other fields
};
```

## Error Handling

Comprehensive error handling with detailed validation messages:

```typescript
import { validate } from '@kitium-ai/schema';

const result = validate(UserSchema, invalidData);
if (!result.success) {
  result.errors?.forEach((error) => {
    console.log(`Field: ${error.field}`);
    console.log(`Message: ${error.message}`);
    console.log(`Code: ${error.code}`);
  });
}

// Or use the ValidationError class
import { ValidationError, validateOrThrow } from '@kitium-ai/schema';

try {
  validateOrThrow(UserSchema, data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation errors:', error.errors);
  }
}
```

## Common Type Systems

All schemas utilize common types for consistency:

```typescript
import {
  UUID,
  Email,
  URL,
  Status,
  SubscriptionStatus,
  PaymentStatus,
  Permission,
  PermissionAction,
  WebhookEventType,
  AuditLog,
} from '@kitium-ai/schema/common';

// Use branded types for type safety
const userId: UUID = generateUUID();
const email: Email = 'user@example.com';
const website: URL = 'https://example.com';

// Use enums for consistent status values
const status: Status = 'active';
const subStatus: SubscriptionStatus = 'active';
```

## Security Best Practices

The schemas implement security best practices:

- **Password Validation** - Requires uppercase, lowercase, numbers, and special characters
- **Email Validation** - Uses email validation rules
- **URL Validation** - Validates URLs are properly formatted
- **Data Encryption** - Credentials are marked as encrypted in billing schemas
- **Permission Controls** - Fine-grained RBAC support
- **Audit Logging** - Support for audit trails

## Integration Examples

### Express.js with Middleware

Using automatic request validation middleware:

```typescript
import express, { Request, Response } from 'express';
import {
  validateBody,
  validateQuery,
  validationErrorHandler,
} from '@kitium-ai/schema';
import { CreateUserSchema, QueryParamsSchema } from '@kitium-ai/schema';

const app = express();
app.use(express.json());

// Automatic validation with middleware
app.post(
  '/api/users',
  validateBody(CreateUserSchema),
  (req: Request, res: Response) => {
    // req.body is already validated and type-safe
    const user = req.body;
    res.status(201).json({ success: true, data: user });
  },
);

// Error handling
app.use(validationErrorHandler());
```

### Express.js Manual Validation

```typescript
import express, { Request, Response } from 'express';
import { CreateUserSchema, validate } from '@kitium-ai/schema';

const app = express();

app.post('/api/users', (req: Request, res: Response) => {
  const result = validate(CreateUserSchema, req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.errors,
    });
  }

  // Process valid user
  const user = result.data;
  // ...
});
```

### GraphQL

```typescript
import { UserSchema, validate } from '@kitium-ai/schema';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
  },
});

const resolvers = {
  Mutation: {
    createUser: async (_: any, args: any) => {
      const result = validate(CreateUserSchema, args);
      if (!result.success) {
        throw new Error('Validation failed');
      }
      return createUserInDB(result.data);
    },
  },
};
```

### Next.js API Routes

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { validate, CreateUserSchema } from '@kitium-ai/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = validate(CreateUserSchema, req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.errors,
    });
  }

  // Process valid user
  const user = await db.users.create(result.data);
  res.status(201).json({ success: true, data: user });
}
```

### Framework adapters and OpenAPI helpers

Reusable adapters make it simple to plug the same schemas into other popular stacks:

- **Next.js App Router**: `withNextValidation(schema, handler)` wraps route handlers and returns a typed `Response` when validation fails.
- **NestJS**: `createNestValidationPipe(schema)` returns a pipe-compatible transformer that throws `ValidationError` on failure.
- **tRPC / GraphQL**: `createTRPCInputValidator(schema)` validates router inputs without bringing extra runtime dependencies.
- **OpenAPI / JSON Schema**: `exportJsonSchema(schema)` and `toOpenAPIParameter(schema, name, location)` provide exportable specs for governance and documentation.

```typescript
import { withNextValidation, createNestValidationPipe, exportJsonSchema } from '@kitium-ai/schema';
import { CreateUserSchema } from '@kitium-ai/schema';

// Next.js App Router
export const POST = withNextValidation(CreateUserSchema, async (_req, user) => {
  return new Response(JSON.stringify({ created: true, user }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
});

// NestJS pipe
export const CreateUserPipe = createNestValidationPipe(CreateUserSchema);

// JSON Schema export for governance tools
const userJsonSchema = exportJsonSchema(CreateUserSchema, 'CreateUser');
```

### Security, compliance, and residency defaults

Schemas include audit stamps, tenant ownership, data residency metadata, and PII classification helpers so regulated deployments start with safe defaults.

```typescript
import { UserSchema, validate } from '@kitium-ai/schema';

const result = validate(UserSchema, {
  id: 'uuid',
  email: 'user@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  status: 'active',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  tenantId: 'tenant-uuid',
  dataClassification: {
    pii: 'high',
    redactionPaths: ['preferences.notifications.sms'],
  },
  residency: { region: 'eu-west-1', restrictCrossRegion: true },
  audit: { createdBy: 'admin-uuid', requestId: 'req-123' },
});
```

### Middleware hardening controls

Express and Fastify middleware support secure defaults without extra packages:

- `hardening.maxBodyBytes` – reject oversized payloads with a 413 response.
- `hardening.allowedContentTypes` – enforce an allowlist to limit attack surface.
- `hardening.correlationIdHeader` – propagate request IDs into structured error responses for observability.
- `logger` – inject your own logger; the library uses console-based no-op logging by default to stay dependency-light.

```typescript
app.post(
  '/integrations',
  validateBody(CreateIntegrationSchema, {
    hardening: { maxBodyBytes: 1024 * 128, allowedContentTypes: ['application/json'] },
    logger: customLogger,
  }),
  handler,
);
```

### Extensibility playbook

- **Namespacing**: export domain-specific schemas from folders such as `schemas/commerce` or `schemas/hr` to prevent collisions in large monorepos.
- **Composition over mutation**: use `extendSchema` and `combineSchemas` utilities to layer organization-specific fields while preserving the upstream contract.
- **Override hooks**: wrap middleware with the `logger` and `errorHandler` options to map errors into your platform-wide problem details format.

```typescript
import { extendSchema, UserSchema } from '@kitium-ai/schema';

const EnterpriseUserSchema = extendSchema(UserSchema, {
  attributes: z.record(z.string()),
  dataClassification: z
    .object({ pii: z.enum(['low', 'medium', 'high']), allowedUses: z.array(z.string()).optional() })
    .optional(),
});
```

### Versioning, support, and migration policy

- **Semantic versioning**: breaking changes ship only in majors; minors remain backward compatible with deprecation warnings documented below.
- **LTS windows**: every major stays supported for 12 months with security fixes; the two latest minors receive patch support.
- **Deprecations**: deprecated APIs are announced in the `Unreleased` changelog with at least one minor of overlap and migration notes.
- **Migration guides**: see the `CHANGELOG.md` and README examples for side-by-side before/after guidance when middleware or schemas evolve.

### Performance, compatibility, and quality gates

- **Zero runtime dependencies** beyond Zod with optional logging hooks for lean bundles; tree-shake by importing from deep paths (e.g., `@kitium-ai/schema/core`).
- **Compatibility matrix**: tested against Node.js >= 18 and TypeScript >= 5.6 via `npm test`, `npm run lint`, and `npm run type-check`.
- **Benchmarks**: validation utilities avoid heavy abstractions; middleware short-circuits on size/content-type checks before parsing.
- **Security hygiene**: credential schemas mark secrets as encrypted and support rotation metadata; integrations include residency flags for data governance.

## Migration Guide

### From Raw Objects

```typescript
// Before
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// After
import { UserSchema, ValidatedUser } from '@kitium-ai/schema';

const result = validate(UserSchema, userData);
const user: ValidatedUser = result.data!;
```

### From Custom Validation

```typescript
// Before
function validateUser(data: any) {
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email');
  }
  // ... more validation
}

// After
import { CreateUserSchema, validate } from '@kitium-ai/schema';

const result = validate(CreateUserSchema, data);
if (!result.success) {
  // Handle validation errors
}
```

## API Reference

For detailed API reference, see [API_REFERENCE.md](./API_REFERENCE.md)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

## Support

- 📖 [Documentation](https://github.com/kitium-ai/schemas)
- 🐛 [Issues](https://github.com/kitium-ai/schemas/issues)
- 💬 [Discussions](https://github.com/kitium-ai/schemas/discussions)
