import { Router } from 'express';
import { z } from 'zod';
import { add_order, change_order_status, list_orders, show_order } from '../controllers/order_controller.js';
import { require_auth, require_role } from '../middleware/auth.js';
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
const order_params = z.object({ order_id: z.string().uuid() });
const detail_schema = z.object({ body: z.any(), params: order_params, query: empty });
const update_status_schema = z.object({
  body: z.object({ status: z.enum(['shipped', 'delivered']), note: z.string().trim().max(1000).optional() }).strict(),
  params: order_params,
  query: empty,
});

router.use(require_auth);
router.get('/', validate(list_schema), async_handler(list_orders));
router.post('/', validate(create_schema), async_handler(add_order));
router.get('/:order_id', validate(detail_schema), async_handler(show_order));
router.patch('/:order_id/status', require_role('admin', 'staff'), validate(update_status_schema), async_handler(change_order_status));

export default router;
