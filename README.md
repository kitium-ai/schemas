# @kitium-ai/schema

Enterprise-ready reusable schema definitions for Product SaaS applications. Provides comprehensive, type-safe, and validated schemas using Zod for TypeScript-first development.

## Features

✅ **Type-Safe** - Full TypeScript support with inferred types
✅ **Validation** - Built-in validation using Zod
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

### Express.js

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
