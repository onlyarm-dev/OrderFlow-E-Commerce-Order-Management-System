import type { PoolClient } from 'pg';
import { db } from '../config/database.js';
import { AppError } from '../utils/app_error.js';

type OrderItemInput = { product_id: string; quantity: number };
type Address = { name: string; address_line_1: string; city: string; postal_code: string; country: string };

function create_order_number(): string {
  return `OMS-${Date.now()}-${Math.floor(Math.random() * 10_000).toString().padStart(4, '0')}`;
}

async function lock_products(client: PoolClient, items: OrderItemInput[]) {
  const product_ids = items.map((item) => item.product_id);
  const result = await client.query(
    `SELECT p.id, p.sku, p.name, p.price, i.quantity, i.reserved_quantity
     FROM products p
     JOIN inventory i ON i.product_id = p.id
     WHERE p.id = ANY($1::uuid[]) AND p.status = 'active' AND p.deleted_at IS NULL
     FOR UPDATE OF i`,
    [product_ids],
  );
  if (result.rowCount !== product_ids.length) throw new AppError(400, 'invalid_product', 'One or more products are unavailable');
  return new Map(result.rows.map((product) => [product.id, product]));
}

export async function create_order(user_id: string, items: OrderItemInput[], shipping_address: Address) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const products = await lock_products(client, items);
    let total_amount = 0;
    for (const item of items) {
      const product = products.get(item.product_id);
      const available = product.quantity - product.reserved_quantity;
      if (available < item.quantity) throw new AppError(409, 'insufficient_stock', `Insufficient stock for ${product.sku}`);
      total_amount += Number(product.price) * item.quantity;
    }

    const order_result = await client.query(
      `INSERT INTO orders (order_number, user_id, total_amount, shipping_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_number, user_id, status, total_amount, shipping_address, created_at, updated_at`,
      [create_order_number(), user_id, total_amount, shipping_address],
    );
    const order = order_result.rows[0];

    for (const item of items) {
      const product = products.get(item.product_id);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, sku, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, product.id, product.sku, product.name, item.quantity, product.price],
      );
      await client.query(
        `UPDATE inventory SET reserved_quantity = reserved_quantity + $1, updated_at = now() WHERE product_id = $2`,
        [item.quantity, product.id],
      );
    }
    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by) VALUES ($1, 'pending', $2)`,
      [order.id, user_id],
    );
    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function get_orders(user_id: string, role: string, page: number, limit: number, status?: string) {
  const values: unknown[] = [];
  const conditions = ['o.deleted_at IS NULL'];
  if (role === 'customer') {
    values.push(user_id);
    conditions.push(`o.user_id = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`o.status = $${values.length}`);
  }
  values.push(limit, (page - 1) * limit);
  const result = await db.query(
    `SELECT o.id, o.order_number, o.user_id, o.status, o.total_amount,
            o.shipping_address, o.created_at, o.updated_at,
            count(*) OVER()::integer AS total_count
     FROM orders o
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.created_at DESC, o.id DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  const total = result.rows[0]?.total_count ?? 0;
  return {
    data: result.rows.map(({ total_count: _total_count, ...order }) => order),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
