-- ============================================================
--  V2 — Seed Data
--  Project: spring-ai-order-support-agent (orderdb)
-- ============================================================

-- Customers
INSERT IGNORE INTO customer (id, name, email, phone) VALUES
    ('C001', 'Alice Johnson', 'alice@example.com', '+65-9123-4567'),
    ('C002', 'Bob Smith',     'bob@example.com',   '+65-9765-4321');

-- Products
INSERT IGNORE INTO product (id, name, description, price, category, stock) VALUES
    ('P001', 'Sony WH-1000XM5 Headphones',    'Industry-leading noise cancellation with 30hr battery',              349.99, 'Electronics', 50),
    ('P002', 'Apple AirPods Pro (2nd Gen)',    'Active noise cancellation with Adaptive Audio',                     249.00, 'Electronics', 30),
    ('P003', 'Samsung Galaxy Watch 6',         'Advanced health monitoring with sleep coaching',                    299.00, 'Wearables',   25),
    ('P004', 'Logitech MX Master 3S',          'Ultra-precise 8K DPI sensor, near-silent clicks',                   99.99, 'Accessories', 100),
    ('P005', 'iPad Pro 13-inch M4',            'Supercharged by the Apple M4 chip, Ultra Retina XDR display',     1099.00, 'Tablets',     15),
    ('P006', 'Keychron K2 Mechanical Keyboard','Compact wireless mechanical keyboard, Gateron Brown switches',       89.99, 'Accessories', 75);

-- Orders
INSERT IGNORE INTO orders (id, customer_id, product_name, quantity, total_amount, status, created_at) VALUES
    ('ORD-101', 'C001', 'Sony WH-1000XM5 Headphones',  1,  349.99, 'SHIPPED',    '2026-05-15 10:00:00'),
    ('ORD-102', 'C001', 'Apple AirPods Pro (2nd Gen)',  2,  498.00, 'PENDING',    '2026-05-19 14:30:00'),
    ('ORD-103', 'C002', 'Samsung Galaxy Watch 6',       1,  299.00, 'DELIVERED',  '2026-05-10 09:00:00'),
    ('ORD-104', 'C002', 'Logitech MX Master 3S',        1,   99.99, 'CANCELLED',  '2026-05-12 11:00:00');

-- Payments
INSERT IGNORE INTO payment (id, order_id, amount, method, status, transaction_ref, paid_at) VALUES
    ('PAY-001', 'ORD-101', 349.99, 'CREDIT_CARD', 'SUCCESS',  'TXN-A1B2C3D4', '2026-05-15 10:01:00'),
    ('PAY-002', 'ORD-102', 498.00, 'STRIPE',      'SUCCESS',  'TXN-E5F6G7H8', '2026-05-19 14:31:00'),
    ('PAY-003', 'ORD-103', 299.00, 'PAYPAL',      'SUCCESS',  'TXN-I9J0K1L2', '2026-05-10 09:01:00'),
    ('PAY-004', 'ORD-104',  99.99, 'DEBIT_CARD',  'REFUNDED', 'TXN-M3N4O5P6', '2026-05-12 11:01:00');
