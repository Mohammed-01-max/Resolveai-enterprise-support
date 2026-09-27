package com.shopeasy.agent.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @Column(name = "id", length = 20)
    private String id;

    /**
     * Links back to the order this payment is for.
     */
    @Column(name = "order_id", nullable = false, length = 20)
    private String orderId;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * CREDIT_CARD, DEBIT_CARD, PAYPAL, STRIPE
     */
    @Column(name = "method", length = 30)
    private String method;

    /**
     * SUCCESS, FAILED, REFUNDED, PENDING
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    /**
     * Mock transaction reference — e.g. TXN-ABC123
     */
    @Column(name = "transaction_ref", length = 50)
    private String transactionRef;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
