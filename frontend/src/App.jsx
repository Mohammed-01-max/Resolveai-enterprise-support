import React, { useState } from 'react';
import ProductCatalog from './components/ProductCatalog';
import OrderHistory from './components/OrderHistory';
import ChatWindow from './components/ChatWindow';

const TABS = [
  { id: 'store',   icon: '🏪', label: 'Store' },
  { id: 'orders',  icon: '📦', label: 'My Orders' },
  { id: 'support', icon: '🤖', label: 'AI Support' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('store');
  const [cartCount, setCartCount] = useState(0);
  const [chatHint, setChatHint] = useState(null);

  const handleOrderPlaced = () => {
    setCartCount(0);
    setTimeout(() => setActiveTab('orders'), 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EAEDED' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Amazon-style dark header */}
        <header style={{ background: '#0F1111', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo */}
          <div
            style={{ color: '#FF9900', fontSize: 22, fontWeight: 500, letterSpacing: -0.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('store')}
          >
            Hey<span style={{ color: '#fff' }}>Cart</span>
            <span style={{ fontSize: 9, color: '#aaa', fontWeight: 400, marginLeft: 4, verticalAlign: 'super' }}>beta</span>
          </div>

          {/* Search bar */}
          <div style={{ flex: 1, display: 'flex', borderRadius: 4, overflow: 'hidden', maxWidth: 520 }}>
            <input
              type="text"
              placeholder="Search products, orders or ask for help..."
              style={{
                flex: 1, border: 'none', padding: '8px 14px',
                fontSize: 13, outline: 'none', background: '#fff', color: '#111'
              }}
            />
            <button style={{ background: '#FF9900', border: 'none', padding: '0 14px', cursor: 'pointer' }}>
              🔍
            </button>
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
            {[
              { icon: '👤', label: 'Account' },
              { icon: '📦', label: 'Orders', onClick: () => setActiveTab('orders') },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center', fontSize: 11 }}
              >
                <div style={{ fontSize: 20 }}>{btn.icon}</div>
                {btn.label}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('store')}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center', fontSize: 11, position: 'relative' }}
            >
              <div style={{ fontSize: 20 }}>🛒</div>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: -4,
                  background: '#FF9900', color: '#111', borderRadius: '50%',
                  fontSize: 10, fontWeight: 700, width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{cartCount}</span>
              )}
              Cart
            </button>
          </div>
        </header>

        {/* Dark nav strip */}
        <nav style={{ background: '#232F3E', padding: '6px 16px', display: 'flex', gap: 24, overflowX: 'auto' }}>
          {['All Deals', 'Electronics', 'Wearables', 'Accessories', 'Tablets', 'New Arrivals'].map((cat, i) => (
            <span
              key={cat}
              style={{
                color: i === 0 ? '#FF9900' : '#fff',
                fontSize: 13,
                fontWeight: i === 0 ? 500 : 400,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                borderBottom: i === 0 ? '2px solid #FF9900' : '2px solid transparent',
                paddingBottom: 2,
              }}
            >{cat}</span>
          ))}
        </nav>

        {/* Tab bar */}
        <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #ddd' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.id ? 500 : 400,
                color: activeTab === tab.id ? '#0066C0' : '#555',
                borderBottom: activeTab === tab.id ? '3px solid #0066C0' : '3px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 14 }}>
          {activeTab === 'store' && (
            <ProductCatalog
              onOrderPlaced={handleOrderPlaced}
              onCartChange={setCartCount}
            />
          )}
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'support' && (
            <ChatWindow initialHint={chatHint} onHintUsed={() => setChatHint(null)} />
          )}
        </div>

      </div>
    </div>
  );
}
