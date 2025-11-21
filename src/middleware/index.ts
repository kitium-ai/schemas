/**
 * Request validation middleware
 *
 * Provides Express and Fastify middleware for automatic request validation
 * with Zod schemas.
 *
 * @example Express Usage:
 * ```typescript
 * import { validateBody, validateQuery, validateParams } from '@kitium-ai/schema/middleware';
 * import { CreateUserSchema, QueryUsersSchema, UserParamsSchema } from '@kitium-ai/schema';
 *
 * app.post('/users',
 *   validateBody(CreateUserSchema),
 *   validateQuery(QueryUsersSchema),
 *   (req, res) => {
 *     // req.body is now validated and type-safe
 *     res.json({ user: req.body });
 *   }
 * );
 * ```
 *
 * @example Fastify Usage:
 * ```typescript
 * import { createValidationPlugin } from '@kitium-ai/schema/middleware';
 * import { CreateUserSchema } from '@kitium-ai/schema';
 *
 * fastify.register(createValidationPlugin({ body: CreateUserSchema }));
 * ```
 */

export * from './express';
export * from './fastify';
export * from './utils';
