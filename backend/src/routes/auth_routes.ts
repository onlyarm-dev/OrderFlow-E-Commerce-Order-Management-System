import { Router } from 'express';
import { z } from 'zod';
import { login, register } from '../controllers/auth_controller.js';
import { validate } from '../middleware/validate.js';
import { async_handler } from '../utils/async_handler.js';

const router = Router();
const empty = z.object({});
const register_schema = z.object({ body: z.object({
  email: z.string().email(), password: z.string().min(8).max(72),
  first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100),
}).strict(), params: empty, query: empty });
const login_schema = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }).strict(), params: empty, query: empty });

router.post('/register', validate(register_schema), async_handler(register));
router.post('/login', validate(login_schema), async_handler(login));

export default router;
