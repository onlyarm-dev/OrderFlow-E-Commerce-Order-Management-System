import type { Request, Response } from 'express';
import { login_user, register_user } from '../services/auth_service.js';

export async function register(request: Request, response: Response): Promise<void> {
  response.status(201).json(await register_user(request.body));
}

export async function login(request: Request, response: Response): Promise<void> {
  response.json(await login_user(request.body));
}
