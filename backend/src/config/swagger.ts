import swagger_jsdoc from 'swagger-jsdoc';

export const swagger_spec = swagger_jsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Onlyarm OMS API', version: '0.1.0', description: 'Order management REST API' },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: { bearer_auth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        Error: { type: 'object', properties: { error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } } } } },
      },
    },
    paths: {
      '/auth/register': { post: { tags: ['Auth'], summary: 'Register a customer', responses: { '201': { description: 'Registered' }, '400': { description: 'Invalid request' } } } },
      '/auth/login': { post: { tags: ['Auth'], summary: 'Log in', responses: { '200': { description: 'Authenticated' }, '401': { description: 'Invalid credentials' } } } },
      '/products': {
        get: { tags: ['Products'], summary: 'List products', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } }], responses: { '200': { description: 'Product page' } } },
        post: { tags: ['Products'], summary: 'Create product', security: [{ bearer_auth: [] }], responses: { '201': { description: 'Created' }, '403': { description: 'Forbidden' } } },
      },
      '/orders': {
        get: { tags: ['Orders'], summary: 'List accessible orders', security: [{ bearer_auth: [] }], responses: { '200': { description: 'Order page' } } },
        post: { tags: ['Orders'], summary: 'Create an order and reserve stock', security: [{ bearer_auth: [] }], responses: { '201': { description: 'Created' }, '409': { description: 'Insufficient stock' } } },
      },
      '/orders/{order_id}': {
        get: {
          tags: ['Orders'], summary: 'Get order details, items, and status history', security: [{ bearer_auth: [] }],
          parameters: [{ in: 'path', name: 'order_id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Order details' }, '404': { description: 'Order not found' } },
        },
      },
      '/orders/{order_id}/status': {
        patch: {
          tags: ['Orders'], summary: 'Mark an order as shipped or delivered', security: [{ bearer_auth: [] }],
          parameters: [{ in: 'path', name: 'order_id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Status updated' }, '403': { description: 'Admin or staff required' }, '409': { description: 'Invalid status transition' } },
        },
      },
    },
  },
  apis: [],
});
