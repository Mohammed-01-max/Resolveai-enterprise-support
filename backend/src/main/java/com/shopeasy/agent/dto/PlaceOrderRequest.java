package com.shopeasy.agent.dto;

/**
 * Request body for POST /api/orders
 */
public record PlaceOrderRequest(
        String customerId,
        String productId,
        Integer quantity
) {}
