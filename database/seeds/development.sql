BEGIN;

INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES
  ('admin@onlyarm.test', crypt('OnlyarmDemo123!', gen_salt('bf', 12)), 'Admin', 'Onlyarm', 'admin'),
  ('customer@onlyarm.test', crypt('OnlyarmDemo123!', gen_salt('bf', 12)), 'Customer', 'Onlyarm', 'customer')
ON CONFLICT (email) WHERE deleted_at IS NULL DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = now();

WITH sample_products (sku, name, description, price, quantity) AS (
  VALUES
    ('OA-TSHIRT-001', 'Essential T-Shirt', 'Heavyweight cotton everyday t-shirt', 690.00::numeric, 120),
    ('OA-HOODIE-001', 'Studio Hoodie', 'Relaxed fit brushed cotton hoodie', 1590.00::numeric, 48),
    ('OA-TOTE-001', 'Utility Tote', 'Structured canvas carry-all tote', 890.00::numeric, 75)
), inserted AS (
  INSERT INTO products (sku, name, description, price)
  SELECT sku, name, description, price FROM sample_products
  ON CONFLICT DO NOTHING
  RETURNING id, sku
)
INSERT INTO inventory (product_id, quantity)
SELECT inserted.id, sample_products.quantity
FROM inserted
JOIN sample_products USING (sku)
ON CONFLICT (product_id) DO NOTHING;

COMMIT;
