import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app_error.js';

export const error_handler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: { code: 'validation_error', message: 'Invalid request', details: error.flatten() } });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.status_code).json({ error: { code: error.code, message: error.message } });
    return;
  }

  console.error(error);
  response.status(500).json({ error: { code: 'internal_error', message: 'Internal server error' } });
};
