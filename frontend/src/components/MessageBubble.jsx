import React from 'react';

export default function MessageBubble({ role, content, streaming }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#232F3E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginRight: 8, flexShrink: 0, marginTop: 2
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '76%',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        background: isUser ? '#FF9900' : '#fff',
        color: isUser ? '#111' : '#222',
        border: isUser ? 'none' : '1px solid #e0e0e0',
        fontWeight: isUser ? 500 : 400,
      }}>
        {content}
        {streaming && (
          <span style={{
            display: 'inline-block', width: 2, height: '1em',
            background: 'currentColor', marginLeft: 2,
            animation: 'blink 0.7s infinite', verticalAlign: 'text-bottom'
          }} />
        )}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#FF9900',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, marginLeft: 8, flexShrink: 0, marginTop: 2
        }}>👤</div>
      )}
    </div>
  );
}
