package com.shopeasy.agent.controller;

import com.shopeasy.agent.dto.ChatRequest;
import com.shopeasy.agent.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * REST controller that exposes the AI chat endpoint as a Server-Sent Event stream.
 *
 * Example curl:
 *   curl -N -X POST "http://localhost:8080/api/chat/stream?sessionId=abc123" \
 *        -H "Content-Type: application/json" \
 *        -d '{"message":"What is the status of order ORD-101?"}'
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final AiChatService aiChatService;

    /**
     * POST /api/chat/stream
     * Produces: text/event-stream (SSE)
     *
     * @param sessionId  unique session ID per user/tab
     * @param request    JSON body with { "message": "..." }
     * @return           streamed AI response tokens
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(
            @RequestParam String sessionId,
            @RequestBody ChatRequest request) {
        return aiChatService.streamChat(sessionId, request.message());
    }
}
