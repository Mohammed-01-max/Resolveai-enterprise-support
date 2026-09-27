import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';

const API_URL = 'http://localhost:8080/api/chat/stream';
const SESSION_ID = Math.random().toString(36).slice(2);

const QUICK_PROMPTS = [
  'What is the status of order ORD-101?',
  'Show all orders for customer C001',
  'Cancel order ORD-102',
  'Request a refund for order ORD-103',
];

export default function ChatWindow({ initialHint, onHintUsed }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm HeyCart's AI support assistant 🛍️\n\nI can help you:\n• Check order status & tracking\n• Cancel a PENDING order\n• View your full order history\n• Request a refund for DELIVERED orders\n\nJust tell me your Order ID (e.g. ORD-101) or Customer ID (e.g. C001)!",
      streaming: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialHint) {
      setInput(initialHint);
      if (onHintUsed) onHintUsed();
      inputRef.current?.focus();
    }
  }, [initialHint, onHintUsed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: trimmed, streaming: false }]);
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      const res = await fetch(`${API_URL}?sessionId=${SESSION_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          let token = '';
          if (line.startsWith('data:')) token = line.slice(5);
          else if (line.trim() && !line.startsWith(':')) token = line;
          if (token) {
            setMessages(prev => {
              const upd = [...prev];
              const last = upd[upd.length - 1];
              if (last?.role === 'assistant') upd[upd.length - 1] = { ...last, content: last.content + token };
              return upd;
            });
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const upd = [...prev];
        const last = upd[upd.length - 1];
        if (last?.role === 'assistant' && last.streaming) {
          upd[upd.length - 1] = { ...last, content: last.content || '⚠️ Could not reach the backend. Is Spring Boot running on port 8080?' };
        }
        return upd;
      });
    } finally {
      setMessages(prev => {
        const upd = [...prev];
        const last = upd[upd.length - 1];
        if (last?.role === 'assistant') upd[upd.length - 1] = { ...last, streaming: false };
        return upd;
      });
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>

      {/* HeyCart Chat header */}
      <div style={{ background: '#232F3E', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: '#FF9900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>HeyCart Assistant</div>
          <div style={{ color: '#aaa', fontSize: 11 }}>Powered by Spring AI + Claude · Tool calls enabled</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, background: '#44DD44', borderRadius: '50%' }} />
          <span style={{ color: '#aaa', fontSize: 11 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="chat-scroll"
        style={{ height: 420, overflowY: 'auto', padding: '16px', background: '#F0F2F2', display: 'flex', flexDirection: 'column' }}
      >
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} streaming={msg.streaming} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — first load only */}
      {messages.length === 1 && (
        <div style={{ padding: '10px 14px', background: '#F0F2F2', borderTop: '1px solid #e0e0e0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              style={{
                background: '#fff', border: '1px solid #ddd', borderRadius: 20,
                padding: '4px 12px', fontSize: 11, color: '#0066C0', cursor: 'pointer'
              }}
            >{prompt}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid #e0e0e0', background: '#fff', alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask about your order, cancel, or request a refund..."
          disabled={loading}
          style={{
            flex: 1, resize: 'none', border: '1px solid #ddd', borderRadius: 20,
            padding: '8px 14px', fontSize: 13, outline: 'none', maxHeight: 100,
            background: loading ? '#f5f5f5' : '#fff', color: '#111',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: loading || !input.trim() ? '#ccc' : '#FF9900',
            color: '#111', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}
