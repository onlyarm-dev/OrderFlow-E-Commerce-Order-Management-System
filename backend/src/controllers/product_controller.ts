import type { Request, Response } from 'express';
import { create_product, get_products } from '../services/product_service.js';

export async function list_products(request: Request, response: Response): Promise<void> {
  response.json(await get_products(request.query as never));
}

export async function add_product(request: Request, response: Response): Promise<void> {
  response.status(201).json({ data: await create_product(request.body) });
}
