import { Router } from 'express';
import { z } from 'zod';
import { add_order, list_orders } from '../controllers/order_controller.js';
import { require_auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { async_handler } from '../utils/async_handler.js';

const router = Router();
const empty = z.object({});
const status = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
const list_schema = z.object({ body: z.any(), params: empty, query: z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: status.optional(),
}) });
const create_schema = z.object({ body: z.object({
  items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.coerce.number().int().positive() })).min(1).max(100)
    .refine((items) => new Set(items.map((item) => item.product_id)).size === items.length, 'Duplicate products are not allowed'),
  shipping_address: z.object({
    name: z.string().trim().min(1).max(200), address_line_1: z.string().trim().min(1).max(255),
    city: z.string().trim().min(1).max(100), postal_code: z.string().trim().min(1).max(20), country: z.string().trim().length(2),
  }).strict(),
}).strict(), params: empty, query: empty });

router.use(require_auth);
router.get('/', validate(list_schema), async_handler(list_orders));
router.post('/', validate(create_schema), async_handler(add_order));

export default router;
