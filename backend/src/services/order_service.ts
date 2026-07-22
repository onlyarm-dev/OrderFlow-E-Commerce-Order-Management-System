import type { PoolClient } from 'pg';
import { db } from '../config/database.js';
import { AppError } from '../utils/app_error.js';

type OrderItemInput = { product_id: string; quantity: number };
type Address = { name: string; address_line_1: string; city: string; postal_code: string; country: string };
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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

export async function get_order(order_id: string, user_id: string, role: string) {
  const values: unknown[] = [order_id];
  const conditions = ['o.id = $1', 'o.deleted_at IS NULL'];
  if (role === 'customer') {
    values.push(user_id);
    conditions.push(`o.user_id = $${values.length}`);
  }

  const order_result = await db.query(
    `SELECT o.id, o.order_number, o.user_id, o.status, o.total_amount,
            o.shipping_address, o.created_at, o.updated_at,
            u.email AS customer_email, u.first_name AS customer_first_name,
            u.last_name AS customer_last_name
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE ${conditions.join(' AND ')}`,
    values,
  );
  const order = order_result.rows[0];
  if (!order) throw new AppError(404, 'order_not_found', 'Order not found');

  const [items_result, history_result] = await Promise.all([
    db.query(
      `SELECT id, product_id, sku, product_name, quantity, unit_price, line_total, created_at
       FROM order_items
       WHERE order_id = $1
       ORDER BY created_at ASC, id ASC`,
      [order_id],
    ),
    db.query(
      `SELECT h.id, h.status, h.note, h.created_at, h.changed_by,
              u.first_name AS changed_by_first_name, u.last_name AS changed_by_last_name
       FROM order_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.order_id = $1
       ORDER BY h.created_at DESC, h.id DESC`,
      [order_id],
    ),
  ]);

  return { ...order, items: items_result.rows, status_history: history_result.rows };
}

function check_status_transition(current_status: OrderStatus, next_status: OrderStatus): void {
  const can_ship = ['pending', 'confirmed', 'processing'].includes(current_status) && next_status === 'shipped';
  const can_deliver = current_status === 'shipped' && next_status === 'delivered';
  if (!can_ship && !can_deliver) {
    throw new AppError(409, 'invalid_status_transition', `Cannot change order from ${current_status} to ${next_status}`);
  }
}

async function commit_reserved_stock(client: PoolClient, order_id: string): Promise<void> {
  const items_result = await client.query(
    `SELECT product_id, quantity
     FROM order_items
     WHERE order_id = $1
     ORDER BY product_id ASC
     FOR UPDATE`,
    [order_id],
  );

  for (const item of items_result.rows) {
    const inventory_result = await client.query(
      `UPDATE inventory
       SET quantity = quantity - $1,
           reserved_quantity = reserved_quantity - $1,
           updated_at = now()
       WHERE product_id = $2
         AND quantity >= $1
         AND reserved_quantity >= $1
       RETURNING product_id`,
      [item.quantity, item.product_id],
    );
    if (inventory_result.rowCount !== 1) {
      throw new AppError(409, 'stock_reservation_error', 'Reserved stock is inconsistent');
    }
  }
}

export async function update_order_status(order_id: string, status: OrderStatus, changed_by: string, note?: string) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const current_result = await client.query(
      `SELECT id, status
       FROM orders
       WHERE id = $1 AND deleted_at IS NULL
       FOR UPDATE`,
      [order_id],
    );
    const current_order = current_result.rows[0];
    if (!current_order) throw new AppError(404, 'order_not_found', 'Order not found');
    check_status_transition(current_order.status, status);

    if (status === 'shipped') await commit_reserved_stock(client, order_id);

    const updated_result = await client.query(
      `UPDATE orders
       SET status = $1, updated_at = now()
       WHERE id = $2
       RETURNING id, order_number, user_id, status, total_amount, shipping_address, created_at, updated_at`,
      [status, order_id],
    );
    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, note)
       VALUES ($1, $2, $3, $4)`,
      [order_id, status, changed_by, note ?? null],
    );
    await client.query('COMMIT');
    return updated_result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
