import { Router } from 'express';
import { z } from 'zod';
import { add_product, list_products } from '../controllers/product_controller.js';
import { require_auth, require_role } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { async_handler } from '../utils/async_handler.js';

const router = Router();
const empty = z.object({});
const list_schema = z.object({ body: z.any(), params: empty, query: z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(), status: z.enum(['active', 'inactive']).optional(),
  sort_by: z.enum(['created_at', 'name', 'price']).default('created_at'), sort_order: z.enum(['asc', 'desc']).default('desc'),
}) });
const create_schema = z.object({ body: z.object({
  sku: z.string().trim().min(1).max(64), name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(), price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
}).strict(), params: empty, query: empty });

router.get('/', validate(list_schema), async_handler(list_products));
router.post('/', require_auth, require_role('admin', 'staff'), validate(create_schema), async_handler(add_product));

export default router;
