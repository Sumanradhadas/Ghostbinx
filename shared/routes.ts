import { z } from 'zod';
import { loginRequestSchema, createItemSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: loginRequestSchema,
      responses: {
        200: z.object({ success: z.boolean(), token: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/auth/status',
      responses: {
        200: z.object({ authenticated: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  items: {
    list: {
      method: 'GET' as const,
      path: '/api/items',
      responses: {
        200: z.array(z.object({
          id: z.string(),
          type: z.enum(['text', 'image']),
          title: z.string(),
          content: z.string(),
          createdAt: z.string(),
        })),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/items',
      input: createItemSchema,
      responses: {
        201: z.object({
          id: z.string(),
          type: z.enum(['text', 'image']),
          title: z.string(),
          content: z.string(),
          createdAt: z.string(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/items/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LoginRequest = z.infer<typeof api.auth.login.input>;
export type ItemInput = z.infer<typeof api.items.create.input>;
export type ItemResponse = z.infer<typeof api.items.create.responses[201]>;
export type ItemsListResponse = z.infer<typeof api.items.list.responses[200]>;
