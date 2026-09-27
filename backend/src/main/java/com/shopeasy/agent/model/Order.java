package com.shopeasy.agent.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @Column(name = "id", length = 20)
    private String id;

    @Column(name = "customer_id", nullable = false, length = 20)
    private String customerId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /**
     * Possible values: PENDING, SHIPPED, DELIVERED, CANCELLED
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
