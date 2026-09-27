-- ============================================================
--  Spring AI Order Support Agent — Database Schema & Queries
--  Project  : shopeasy / spring-ai-order-support-agent
--  Package  : com.shopeasy.agent
-- ============================================================


-- ============================================================
--  SCHEMA (DDL)
-- ============================================================

-- Customer table
CREATE TABLE IF NOT EXISTS customer (
    id      VARCHAR(20)  PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    email   VARCHAR(255) NOT NULL UNIQUE,
    phone   VARCHAR(50)
);

-- Product table
CREATE TABLE IF NOT EXISTS product (
    id          VARCHAR(20)     PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2)  NOT NULL,
    category    VARCHAR(50),
    stock       INT             NOT NULL DEFAULT 0
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id              VARCHAR(20)     PRIMARY KEY,
    customer_id     VARCHAR(20)     NOT NULL,
    product_name    VARCHAR(255)    NOT NULL,
    quantity        INT             NOT NULL,
    total_amount    DECIMAL(10, 2)  NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    -- status values: PENDING | SHIPPED | DELIVERED | CANCELLED
    created_at      TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Payment table
CREATE TABLE IF NOT EXISTS payment (
    id              VARCHAR(20)     PRIMARY KEY,
    order_id        VARCHAR(20)     NOT NULL,
    amount          DECIMAL(10, 2)  NOT NULL,
    method          VARCHAR(30),
    -- method values: CREDIT_CARD | DEBIT_CARD | PAYPAL | STRIPE
    status          VARCHAR(20)     NOT NULL,
    -- status values: SUCCESS | FAILED | REFUNDED | PENDING
    transaction_ref VARCHAR(50),
    paid_at         TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id   ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_order_id     ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status       ON payment(status);
CREATE INDEX IF NOT EXISTS idx_product_category     ON product(category);


-- ============================================================
--  SEED DATA
-- ============================================================

-- Customers
INSERT INTO customer (id, name, email, phone)
SELECT 'C001', 'Alice Johnson', 'alice@example.com', '+65-9123-4567'
WHERE NOT EXISTS (SELECT 1 FROM customer WHERE id = 'C001');

INSERT INTO customer (id, name, email, phone)
SELECT 'C002', 'Bob Smith', 'bob@example.com', '+65-9765-4321'
WHERE NOT EXISTS (SELECT 1 FROM customer WHERE id = 'C002');

-- Products
INSERT INTO product (id, name, description, price, category, stock)
SELECT 'P001', 'Sony WH-1000XM5 Headphones', 'Industry-leading noise cancellation with 30hr battery', 349.99, 'Electronics', 50
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 'P001');

INSERT INTO product (id, name, description, price, category, stock)
SELECT 'P002', 'Apple AirPods Pro (2nd Gen)', 'Active noise cancellation with Adaptive Audio', 249.00, 'Electronics', 30
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 'P002');

INSERT INTO product (id, name, description, price, category, stock)
SELECT 'P003', 'Samsung Galaxy Watch 6', 'Advanced health monitoring with sleep coaching', 299.00, 'Wearables', 25
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 'P003');

INSERT INTO product (id, name, description, price, category, stock)
SELECT 'P004', 'Logitech MX Master 3S', 'Ultra-precise 8K DPI sensor, near-silent clicks', 99.99, 'Accessories', 100
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 'P004');

INSERT INTO product (id, name, description, price, category, stock)
SELECT 'P005', 'iPad Pro 13-inch M4', 'Supercharged by the Apple M4 chip, Ultra Retina XDR display', 1099.00, 'Tablets', 15
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 'P005');

INSERT INTO product (id, name, description, price, category, stock)
SELECT 'P006', 'Keychron K2 Mechanical Keyboard', 'Compact wireless mechanical keyboard, Gateron Brown switches', 89.99, 'Accessories', 75
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 'P006');

-- Orders
INSERT INTO orders (id, customer_id, product_name, quantity, total_amount, status, created_at)
SELECT 'ORD-101', 'C001', 'Sony WH-1000XM5 Headphones', 1, 349.99, 'SHIPPED',    '2026-05-15 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-101');

INSERT INTO orders (id, customer_id, product_name, quantity, total_amount, status, created_at)
SELECT 'ORD-102', 'C001', 'Apple AirPods Pro (2nd Gen)', 2, 498.00, 'PENDING',   '2026-05-19 14:30:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-102');

INSERT INTO orders (id, customer_id, product_name, quantity, total_amount, status, created_at)
SELECT 'ORD-103', 'C002', 'Samsung Galaxy Watch 6',      1, 299.00, 'DELIVERED', '2026-05-10 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-103');

INSERT INTO orders (id, customer_id, product_name, quantity, total_amount, status, created_at)
SELECT 'ORD-104', 'C002', 'Logitech MX Master 3S',       1,  99.99, 'CANCELLED', '2026-05-12 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-104');

-- Payments
INSERT INTO payment (id, order_id, amount, method, status, transaction_ref, paid_at)
SELECT 'PAY-001', 'ORD-101', 349.99, 'CREDIT_CARD', 'SUCCESS',  'TXN-A1B2C3D4', '2026-05-15 10:01:00'
WHERE NOT EXISTS (SELECT 1 FROM payment WHERE id = 'PAY-001');

INSERT INTO payment (id, order_id, amount, method, status, transaction_ref, paid_at)
SELECT 'PAY-002', 'ORD-102', 498.00, 'STRIPE',      'SUCCESS',  'TXN-E5F6G7H8', '2026-05-19 14:31:00'
WHERE NOT EXISTS (SELECT 1 FROM payment WHERE id = 'PAY-002');

INSERT INTO payment (id, order_id, amount, method, status, transaction_ref, paid_at)
SELECT 'PAY-003', 'ORD-103', 299.00, 'PAYPAL',      'SUCCESS',  'TXN-I9J0K1L2', '2026-05-10 09:01:00'
WHERE NOT EXISTS (SELECT 1 FROM payment WHERE id = 'PAY-003');

INSERT INTO payment (id, order_id, amount, method, status, transaction_ref, paid_at)
SELECT 'PAY-004', 'ORD-104',  99.99, 'DEBIT_CARD',  'REFUNDED', 'TXN-M3N4O5P6', '2026-05-12 11:01:00'
WHERE NOT EXISTS (SELECT 1 FROM payment WHERE id = 'PAY-004');


-- ============================================================
--  QUERIES
-- ============================================================

-- 1. All orders for a customer (by customer id)
SELECT o.id          AS order_id,
       o.product_name,
       o.quantity,
       o.total_amount,
       o.status,
       o.created_at
FROM orders o
WHERE o.customer_id = 'C001'
ORDER BY o.created_at DESC;

-- 2. Full order details — customer + order + payment
SELECT c.name        AS customer_name,
       c.email,
       o.id          AS order_id,
       o.product_name,
       o.quantity,
       o.total_amount,
       o.status      AS order_status,
       o.created_at,
       p.method      AS payment_method,
       p.status      AS payment_status,
       p.transaction_ref,
       p.paid_at
FROM orders o
JOIN customer c ON o.customer_id = c.id
LEFT JOIN payment p ON p.order_id = o.id
ORDER BY o.created_at DESC;

-- 3. Orders filtered by status
SELECT o.id, c.name AS customer, o.product_name, o.total_amount, o.created_at
FROM orders o
JOIN customer c ON o.customer_id = c.id
WHERE o.status = 'PENDING'          -- change to: SHIPPED | DELIVERED | CANCELLED
ORDER BY o.created_at DESC;

-- 4. Cancel an order (update status)
UPDATE orders
SET status = 'CANCELLED'
WHERE id = 'ORD-102'
  AND status NOT IN ('DELIVERED', 'CANCELLED');

-- 5. Place a new order
INSERT INTO orders (id, customer_id, product_name, quantity, total_amount, status, created_at)
VALUES ('ORD-105', 'C001', 'iPad Pro 13-inch M4', 1, 1099.00, 'PENDING', NOW());

-- 6. Record a payment for a new order
INSERT INTO payment (id, order_id, amount, method, status, transaction_ref, paid_at)
VALUES ('PAY-005', 'ORD-105', 1099.00, 'CREDIT_CARD', 'SUCCESS', 'TXN-Q7R8S9T0', NOW());

-- 7. Update order status to SHIPPED after payment confirmed
UPDATE orders
SET status = 'SHIPPED'
WHERE id = 'ORD-105'
  AND status = 'PENDING';

-- 8. All products in a category
SELECT id, name, description, price, stock
FROM product
WHERE category = 'Electronics'     -- change to: Wearables | Accessories | Tablets
ORDER BY price;

-- 9. Products with low stock (threshold = 20)
SELECT id, name, category, price, stock
FROM product
WHERE stock < 20
ORDER BY stock;

-- 10. Reduce stock after an order is placed
UPDATE product
SET stock = stock - 1
WHERE name = 'iPad Pro 13-inch M4'
  AND stock > 0;

-- 11. Revenue summary per customer
SELECT c.id, c.name, c.email,
       COUNT(o.id)          AS total_orders,
       SUM(o.total_amount)  AS total_spent
FROM customer c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name, c.email
ORDER BY total_spent DESC;

-- 12. Overall revenue from successful payments
SELECT SUM(p.amount)          AS total_revenue,
       COUNT(p.id)            AS total_payments,
       COUNT(DISTINCT o.customer_id) AS unique_customers
FROM payment p
JOIN orders o ON p.order_id = o.id
WHERE p.status = 'SUCCESS';

-- 13. Orders count by status
SELECT status, COUNT(*) AS count
FROM orders
GROUP BY status
ORDER BY count DESC;

-- 14. Refunded payments with customer details
SELECT c.name AS customer_name, c.email,
       o.id   AS order_id, o.product_name,
       p.amount, p.transaction_ref, p.paid_at
FROM payment p
JOIN orders o ON p.order_id = o.id
JOIN customer c ON o.customer_id = c.id
WHERE p.status = 'REFUNDED';

-- 15. Find a customer's order by order id (used by AI agent tool)
SELECT c.name, c.email, c.phone,
       o.id AS order_id, o.product_name, o.quantity,
       o.total_amount, o.status, o.created_at,
       p.method, p.status AS payment_status, p.transaction_ref
FROM orders o
JOIN customer c ON o.customer_id = c.id
LEFT JOIN payment p ON p.order_id = o.id
WHERE o.id = 'ORD-101';
