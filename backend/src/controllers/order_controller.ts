import type { Request, Response } from 'express';
import { create_order, get_order, get_orders, update_order_status } from '../services/order_service.js';

export async function add_order(request: Request, response: Response): Promise<void> {
  response.status(201).json({ data: await create_order(request.user!.user_id, request.body.items, request.body.shipping_address) });
}

export async function list_orders(request: Request, response: Response): Promise<void> {
  const { page, limit, status } = request.query as unknown as { page: number; limit: number; status?: string };
  response.json(await get_orders(request.user!.user_id, request.user!.role, page, limit, status));
}

export async function show_order(request: Request, response: Response): Promise<void> {
  response.json({ data: await get_order(request.params.order_id as string, request.user!.user_id, request.user!.role) });
}

export async function change_order_status(request: Request, response: Response): Promise<void> {
  response.json({
    data: await update_order_status(request.params.order_id as string, request.body.status, request.user!.user_id, request.body.note),
  });
}
