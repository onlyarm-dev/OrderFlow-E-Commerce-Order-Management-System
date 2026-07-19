import cors from 'cors';
import express from 'express';
import swagger_ui from 'swagger-ui-express';
import { env } from './config/env.js';
import { swagger_spec } from './config/swagger.js';
import { error_handler } from './middleware/error_handler.js';
import auth_routes from './routes/auth_routes.js';
import order_routes from './routes/order_routes.js';
import product_routes from './routes/product_routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/docs', swagger_ui.serve, swagger_ui.setup(swagger_spec));
app.use('/api/v1/auth', auth_routes);
app.use('/api/v1/products', product_routes);
app.use('/api/v1/orders', order_routes);
app.use((_request, response) => response.status(404).json({ error: { code: 'not_found', message: 'Route not found' } }));
app.use(error_handler);
