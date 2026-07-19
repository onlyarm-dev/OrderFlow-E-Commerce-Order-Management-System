BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE product_status AS ENUM ('active', 'inactive');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

CREATE UNIQUE INDEX users_email_active_uq ON users (email) WHERE deleted_at IS NULL;

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku varchar(64) NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  price numeric(12, 2) NOT NULL,
  status product_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT products_price_non_negative CHECK (price >= 0)
);

CREATE UNIQUE INDEX products_sku_active_uq ON products (sku) WHERE deleted_at IS NULL;
CREATE INDEX products_list_idx ON products (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX products_name_search_idx ON products (lower(name) text_pattern_ops) WHERE deleted_at IS NULL;

CREATE TABLE inventory (
  product_id uuid PRIMARY KEY REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inventory_quantity_non_negative CHECK (quantity >= 0),
  CONSTRAINT inventory_reserved_valid CHECK (reserved_quantity >= 0 AND reserved_quantity <= quantity)
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number varchar(32) NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'pending',
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  shipping_address jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT orders_total_non_negative CHECK (total_amount >= 0),
  CONSTRAINT orders_shipping_address_object CHECK (jsonb_typeof(shipping_address) = 'object')
);

CREATE INDEX orders_user_list_idx ON orders (user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX orders_status_list_idx ON orders (status, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  sku varchar(64) NOT NULL,
  product_name varchar(255) NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(12, 2) NOT NULL,
  line_total numeric(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT order_items_product_once UNIQUE (order_id, product_id)
);

CREATE INDEX order_items_order_idx ON order_items (order_id);

CREATE TABLE order_status_history (
  id bigserial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_by uuid REFERENCES users(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_status_history_order_idx ON order_status_history (order_id, created_at DESC);

COMMIT;
