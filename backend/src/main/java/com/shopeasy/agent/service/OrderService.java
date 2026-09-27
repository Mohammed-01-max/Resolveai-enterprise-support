package com.shopeasy.agent.service;

import com.shopeasy.agent.dto.OrderResponse;
import com.shopeasy.agent.dto.PlaceOrderRequest;
import com.shopeasy.agent.model.Order;
import com.shopeasy.agent.model.Payment;
import com.shopeasy.agent.model.Product;
import com.shopeasy.agent.repository.CustomerRepository;
import com.shopeasy.agent.repository.OrderRepository;
import com.shopeasy.agent.repository.PaymentRepository;
import com.shopeasy.agent.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Business logic for the regular order REST API.
 * Separate from OrderToolService (which is the AI @Tool layer).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    private static final String[] PAYMENT_METHODS = {"CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "STRIPE"};
    private final Random random = new Random();

    /**
     * Place a new order.
     * 1. Validates customer + product + stock
     * 2. Deducts stock
     * 3. Creates the order (PENDING)
     * 4. Creates a mock payment (SUCCESS) — simulates instant payment processing
     */
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        if (!customerRepository.existsById(request.customerId())) {
            throw new IllegalArgumentException("Customer not found: " + request.customerId());
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + request.productId()));

        if (product.getStock() < request.quantity()) {
            throw new IllegalArgumentException(
                "Insufficient stock for " + product.getName()
                + ". Available: " + product.getStock()
            );
        }

        // Deduct stock
        product.setStock(product.getStock() - request.quantity());
        productRepository.save(product);

        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(request.quantity()));
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // Save order
        Order order = new Order(
                orderId,
                request.customerId(),
                product.getName(),
                request.quantity(),
                total,
                "PENDING",
                LocalDateTime.now()
        );
        Order saved = orderRepository.save(order);

        // Create mock payment — simulates instant card/PayPal payment
        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String txnRef    = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String method    = PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)];

        Payment payment = new Payment(
                paymentId,
                orderId,
                total,
                method,
                "SUCCESS",
                txnRef,
                LocalDateTime.now()
        );
        paymentRepository.save(payment);

        log.info("Order placed: {} | Product: {} | Total: ${} | Payment: {} [{}]",
                saved.getId(), product.getName(), total, paymentId, method);

        return OrderResponse.from(saved);
    }

    /**
     * Get a single order by ID.
     */
    public OrderResponse getOrder(String orderId) {
        return orderRepository.findById(orderId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    /**
     * Get all orders for a customer.
     */
    public List<OrderResponse> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }
}
