package com.shopeasy.agent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

/**
 * Wraps ChatClient with:
 * - Gemini (gemini-2.0-flash) via Vertex AI as the LLM
 * - OrderToolService tools registered via @Tool
 * - MessageWindowChatMemory: retains last 10 messages per session
 * - SSE streaming via Flux<String>
 */
@Service
@Slf4j
public class AiChatService {

    private static final String SYSTEM_PROMPT = """
            You are a helpful and friendly customer support agent for ShopEasy, an e-commerce platform.

            You help customers with:
            - Checking order status
            - Cancelling pending orders
            - Viewing order history
            - Requesting refunds for delivered orders

            Guidelines:
            - Always be polite and empathetic
            - Ask for an order ID or customer ID when needed to look up information
            - If a customer seems frustrated, acknowledge their concern first
            - Never make up order information — always use the provided tools to look up real data
            - Keep responses concise and friendly
            """;

    private final ChatClient chatClient;
    private final ChatMemory chatMemory = MessageWindowChatMemory.builder()
            .chatMemoryRepository(new InMemoryChatMemoryRepository())
            .maxMessages(10)
            .build();

    public AiChatService(ChatClient.Builder builder, OrderToolService orderToolService) {
        this.chatClient = builder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultTools(orderToolService)
                .build();
    }

    /**
     * Streams the AI response as Server-Sent Events.
     *
     * @param sessionId unique chat session (one per browser tab is fine)
     * @param userMessage the user's message
     * @return Flux of text chunks streamed to the client
     */
    public Flux<String> streamChat(String sessionId, String userMessage) {
        log.info("[Chat] sessionId={} | message={}", sessionId, userMessage);
        return chatClient.prompt()
                .advisors(MessageChatMemoryAdvisor.builder(chatMemory)
                        .conversationId(sessionId)
                        .build())
                .user(userMessage)
                .stream()
                .content();
    }
}
