package com.shopeasy.agent.controller;

import com.shopeasy.agent.dto.OrderResponse;
import com.shopeasy.agent.dto.PlaceOrderRequest;
import com.shopeasy.agent.model.Customer;
import com.shopeasy.agent.repository.CustomerRepository;
import com.shopeasy.agent.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Standard REST API for order management.
 *
 * This is the "normal" e-commerce API — no AI involved here.
 * Customers use this to browse, place, and view orders.
 * The AI chat agent (ChatController) is used for support actions
 * like cancellation and refunds.
 *
 * Endpoints:
 *   POST   /api/orders                        → place a new order
 *   GET    /api/orders/{id}                   → get order by ID
 *   GET    /api/orders/customer/{customerId}  → list orders for a customer
 *   GET    /api/customers                     → list all customers (for demo UI)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CustomerRepository customerRepository;

    /**
     * Place a new order.
     * Body: { "customerId": "C001", "productName": "...", "quantity": 1, "totalAmount": 99.99 }
     */
    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody PlaceOrderRequest request) {
        try {
            OrderResponse response = orderService.placeOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Get a single order by ID.
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            return ResponseEntity.ok(orderService.getOrder(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Get all orders for a specific customer.
     */
    @GetMapping("/orders/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    /**
     * List all customers — used by the demo UI to populate the dropdown.
     */
    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerRepository.findAll());
    }

}
