const api_url = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'customer';
};

export type AuthSession = { user: User; access_token: string };

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  status: 'active' | 'inactive';
  quantity: number;
  reserved_quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: string;
  shipping_address: { name: string; city: string; country: string };
  created_at: string;
};

export type ProductPage = { data: Product[]; pagination: { total: number } };
export type OrderPage = { data: Order[]; pagination: { total: number } };

type ApiError = { error?: { message?: string } };

async function api_request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${api_url}${path}`, { ...options, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ApiError;
    throw new Error(payload.error?.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<AuthSession> {
  return api_request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function register(input: { email: string; password: string; first_name: string; last_name: string }): Promise<AuthSession> {
  return api_request('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export function fetch_products(search = ''): Promise<ProductPage> {
  const params = new URLSearchParams({ limit: '50', sort_by: 'created_at', sort_order: 'desc' });
  if (search.trim()) params.set('search', search.trim());
  return api_request(`/products?${params}`);
}

export function create_product(input: { sku: string; name: string; description: string; price: number; quantity: number }, token: string): Promise<{ data: Product }> {
  return api_request('/products', { method: 'POST', body: JSON.stringify(input) }, token);
}

export function fetch_orders(token: string): Promise<OrderPage> {
  return api_request('/orders?limit=50', {}, token);
}

export function create_order(input: {
  items: { product_id: string; quantity: number }[];
  shipping_address: { name: string; address_line_1: string; city: string; postal_code: string; country: string };
}, token: string): Promise<{ data: Order }> {
  return api_request('/orders', { method: 'POST', body: JSON.stringify(input) }, token);
}
