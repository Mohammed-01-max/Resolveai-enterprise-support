package com.shopeasy.agent.dto;

/**
 * Request body for POST /api/chat/stream
 */
public record ChatRequest(String message) {
}
