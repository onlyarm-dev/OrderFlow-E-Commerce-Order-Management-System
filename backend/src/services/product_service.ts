import { db } from '../config/database.js';
import { AppError } from '../utils/app_error.js';

type ProductFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive';
  sort_by: 'created_at' | 'name' | 'price';
  sort_order: 'asc' | 'desc';
};

type ProductInput = {
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
};

export async function get_products(filters: ProductFilters) {
  const values: unknown[] = [];
  const conditions = ['p.deleted_at IS NULL'];
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`p.status = $${values.length}`);
  }
  if (filters.search) {
    values.push(`${filters.search.toLowerCase()}%`);
    conditions.push(`lower(p.name) LIKE $${values.length}`);
  }

  const where = conditions.join(' AND ');
  values.push(filters.limit, (filters.page - 1) * filters.limit);
  const result = await db.query(
    `SELECT p.id, p.sku, p.name, p.description, p.price, p.status,
            i.quantity, i.reserved_quantity, p.created_at, p.updated_at,
            count(*) OVER()::integer AS total_count
     FROM products p
     JOIN inventory i ON i.product_id = p.id
     WHERE ${where}
     ORDER BY p.${filters.sort_by} ${filters.sort_order}, p.id ASC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  const total = result.rows[0]?.total_count ?? 0;
  return {
    data: result.rows.map(({ total_count: _total_count, ...product }) => product),
    pagination: { page: filters.page, limit: filters.limit, total, total_pages: Math.ceil(total / filters.limit) },
  };
}

export async function create_product(input: ProductInput) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const product_result = await client.query(
      `INSERT INTO products (sku, name, description, price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, sku, name, description, price, status, created_at, updated_at`,
      [input.sku.toUpperCase(), input.name, input.description ?? null, input.price],
    );
    const product = product_result.rows[0];
    await client.query('INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)', [product.id, input.quantity]);
    await client.query('COMMIT');
    return { ...product, quantity: input.quantity, reserved_quantity: 0 };
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw new AppError(409, 'sku_exists', 'SKU already exists');
    }
    throw error;
  } finally {
    client.release();
  }
}
