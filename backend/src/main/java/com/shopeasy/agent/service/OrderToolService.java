package com.shopeasy.agent.service;

import com.shopeasy.agent.model.Order;
import com.shopeasy.agent.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Tools exposed to Claude via @Tool annotation.
 * Spring AI automatically registers these as callable functions
 * when this bean is passed to ChatClient.defaultTools().
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderToolService {

    private final OrderRepository orderRepository;

    @Tool(description = "Get the current status and full details of an order by its order ID (e.g. ORD-101)")
    public String getOrderStatus(String orderId) {
        log.info("[Tool] getOrderStatus called with orderId={}", orderId);
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return "Order " + orderId + " not found. Please double-check the order ID.";
        }
        Order order = orderOpt.get();
        return String.format(
            "Order %s | Product: %s | Qty: %d | Amount: $%.2f | Status: %s | Placed: %s",
            order.getId(),
            order.getProductName(),
            order.getQuantity(),
            order.getTotalAmount(),
            order.getStatus(),
            order.getCreatedAt()
        );
    }

    @Tool(description = "Cancel an order by order ID. Only PENDING orders can be cancelled.")
    @Transactional
    public String cancelOrder(String orderId) {
        log.info("[Tool] cancelOrder called with orderId={}", orderId);
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return "Order " + orderId + " not found.";
        }
        Order order = orderOpt.get();
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            return "Order " + orderId + " cannot be cancelled. Current status: " + order.getStatus()
                + ". Only PENDING orders can be cancelled.";
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return "Order " + orderId + " has been successfully cancelled. A refund will be processed within 3-5 business days.";
    }

    @Tool(description = "Get all orders placed by a customer using their customer ID (e.g. C001)")
    public String getOrderHistory(String customerId) {
        log.info("[Tool] getOrderHistory called with customerId={}", customerId);
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        if (orders.isEmpty()) {
            return "No orders found for customer " + customerId + ".";
        }
        StringBuilder sb = new StringBuilder("Order history for customer " + customerId + ":\n");
        for (Order o : orders) {
            sb.append(String.format(
                "  - %s | %s | $%.2f | %s\n",
                o.getId(), o.getProductName(), o.getTotalAmount(), o.getStatus()
            ));
        }
        return sb.toString().trim();
    }

    @Tool(description = "Request a refund for a DELIVERED order. Provide the order ID and the reason for the refund.")
    @Transactional
    public String requestRefund(String orderId, String reason) {
        log.info("[Tool] requestRefund called with orderId={}, reason={}", orderId, reason);
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return "Order " + orderId + " not found.";
        }
        Order order = orderOpt.get();
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            return "Refund cannot be processed for order " + orderId
                + " because its status is " + order.getStatus()
                + ". Only DELIVERED orders are eligible for a refund.";
        }
        // In a real system, this would create a refund record
        return String.format(
            "Refund request submitted for order %s (Product: %s, Amount: $%.2f). "
            + "Reason: %s. Your refund will be processed within 5-7 business days.",
            order.getId(), order.getProductName(), order.getTotalAmount(), reason
        );
    }
}
