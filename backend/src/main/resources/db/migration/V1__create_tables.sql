-- ============================================================
--  V1 — Create Tables
--  Project: spring-ai-order-support-agent (orderdb)
-- ============================================================

CREATE TABLE IF NOT EXISTS customer (
    id      VARCHAR(20)  NOT NULL,
    name    VARCHAR(255) NOT NULL,
    email   VARCHAR(255) NOT NULL,
    phone   VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uq_customer_email (email)
);

CREATE TABLE IF NOT EXISTS product (
    id          VARCHAR(20)    NOT NULL,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL,
    category    VARCHAR(50),
    stock       INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id              VARCHAR(20)    NOT NULL,
    customer_id     VARCHAR(20)    NOT NULL,
    product_name    VARCHAR(255)   NOT NULL,
    quantity        INT            NOT NULL,
    total_amount    DECIMAL(10, 2) NOT NULL,
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    created_at      DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS payment (
    id              VARCHAR(20)    NOT NULL,
    order_id        VARCHAR(20)    NOT NULL,
    amount          DECIMAL(10, 2) NOT NULL,
    method          VARCHAR(30),
    status          VARCHAR(20)    NOT NULL,
    transaction_ref VARCHAR(50),
    paid_at         DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_payment_order_id   ON payment(order_id);
CREATE INDEX idx_product_category   ON product(category);
