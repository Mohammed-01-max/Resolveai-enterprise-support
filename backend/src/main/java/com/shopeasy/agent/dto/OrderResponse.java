package com.shopeasy.agent.dto;

import com.shopeasy.agent.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for order endpoints — avoids exposing JPA entity directly.
 */
public record OrderResponse(
        String id,
        String customerId,
        String productName,
        Integer quantity,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerId(),
                order.getProductName(),
                order.getQuantity(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
