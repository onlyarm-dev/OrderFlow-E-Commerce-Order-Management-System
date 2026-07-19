import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export function validate(schema: ZodTypeAny): RequestHandler {
  return (request, _response, next) => {
    const result = schema.parse({ body: request.body, params: request.params, query: request.query });
    request.body = result.body;
    request.params = result.params;
    request.query = result.query;
    next();
  };
}
