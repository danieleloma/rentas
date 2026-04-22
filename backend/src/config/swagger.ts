import { config } from './index';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Rentas API',
    version: '1.0.0',
    description: 'Rental marketplace REST API',
    contact: { email: 'dev@rentas.app' },
  },
  servers: [
    { url: `http://localhost:${config.port}/api`, description: 'Local dev' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UNAUTHORIZED' },
              message: { type: 'string', example: 'Invalid or expired token' },
            },
          },
        },
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['renter', 'landlord', 'mover', 'admin'] },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, maxLength: 128 },
                  firstName: { type: 'string', maxLength: 100 },
                  lastName: { type: 'string', maxLength: 100 },
                  phone: { type: 'string', maxLength: 20 },
                  role: { type: 'string', enum: ['renter', 'landlord', 'mover'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      allOf: [
                        { $ref: '#/components/schemas/UserPublic' },
                        { $ref: '#/components/schemas/Tokens' },
                      ],
                    },
                  },
                },
              },
            },
          },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      allOf: [
                        { $ref: '#/components/schemas/UserPublic' },
                        { $ref: '#/components/schemas/Tokens' },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and get new access token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'New token pair issued', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Tokens' } } } } } },
          401: { description: 'Invalid or revoked refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged out successfully' },
          401: { description: 'Missing access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        responses: {
          200: { description: 'Current user', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/UserPublic' } } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/listings': {
      get: { tags: ['Listings'], summary: 'List listings (with filters)', responses: { 200: { description: 'Paginated listing results' } } },
      post: { tags: ['Listings'], summary: 'Create a listing (landlord)', responses: { 201: { description: 'Listing created' }, 401: { description: 'Unauthorized' } } },
    },
    '/listings/{id}': {
      get: { tags: ['Listings'], summary: 'Get listing by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Listing detail' }, 404: { description: 'Not found' } } },
      put: { tags: ['Listings'], summary: 'Update listing', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Listings'], summary: 'Delete listing', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 204: { description: 'Deleted' } } },
    },
    '/conversations': {
      get: { tags: ['Messaging'], summary: 'List conversations for current user', responses: { 200: { description: 'Conversation list' } } },
      post: { tags: ['Messaging'], summary: 'Start or retrieve a conversation', responses: { 200: { description: 'Conversation' } } },
    },
    '/conversations/{id}/messages': {
      get: { tags: ['Messaging'], summary: 'Get messages in a conversation', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Messages' } } },
    },
    '/visits': {
      get: { tags: ['Visits'], summary: 'List visits for current user', responses: { 200: { description: 'Visit list' } } },
      post: { tags: ['Visits'], summary: 'Schedule a visit', responses: { 201: { description: 'Visit created' } } },
    },
    '/visits/{id}': {
      put: { tags: ['Visits'], summary: 'Update visit status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/reviews': {
      get: { tags: ['Reviews'], summary: 'List reviews', responses: { 200: { description: 'Review list' } } },
      post: { tags: ['Reviews'], summary: 'Submit a review', responses: { 201: { description: 'Review created' } } },
    },
    '/movers': {
      get: { tags: ['Movers'], summary: 'Search movers', responses: { 200: { description: 'Mover list' } } },
      post: { tags: ['Movers'], summary: 'Create mover profile', responses: { 201: { description: 'Profile created' } } },
    },
    '/movers/{id}': {
      get: { tags: ['Movers'], summary: 'Get mover by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Mover detail' } } },
    },
    '/reports': {
      post: { tags: ['Reports'], summary: 'File a report', responses: { 201: { description: 'Report filed' } } },
    },
    '/upload': {
      post: { tags: ['Upload'], summary: 'Upload a file to Supabase Storage', responses: { 200: { description: 'Upload URL' } } },
    },
  },
};
