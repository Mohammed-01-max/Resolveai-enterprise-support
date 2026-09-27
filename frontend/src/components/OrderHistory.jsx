import React, { useState, useEffect, useCallback } from 'react';

const STATUS = {
  PENDING:   { bg: '#FFF3CD', color: '#856404', border: '#FFC107', icon: '⏳', label: 'Pending' },
  SHIPPED:   { bg: '#D1ECF1', color: '#0C5460', border: '#17A2B8', icon: '🚚', label: 'Shipped' },
  DELIVERED: { bg: '#D4EDDA', color: '#155724', border: '#28A745', icon: '✅', label: 'Delivered' },
  CANCELLED: { bg: '#F8D7DA', color: '#721C24', border: '#DC3545', icon: '❌', label: 'Cancelled' },
};

export default function OrderHistory() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/customers')
      .then(r => r.json())
      .then(data => { setCustomers(data); if (data[0]) setSelected(data[0].id); })
      .catch(() => setError('Cannot reach backend on port 8080.'));
  }, []);

  const load = useCallback(() => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8080/api/orders/customer/${selected}`)
      .then(r => r.json())
      .then(data => { setOrders(data); setRefreshed(new Date().toLocaleTimeString()); })
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  const customer = customers.find(c => c.id === selected);

  return (
    <div>
      {/* Header bar */}
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>Customer:</span>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ border: '1px solid #ddd', borderRadius: 4, padding: '4px 10px', fontSize: 13, background: '#fff', color: '#111', cursor: 'pointer' }}
          >
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
          </select>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            marginLeft: 'auto', background: loading ? '#eee' : '#232F3E', color: loading ? '#999' : '#FF9900',
            border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
        {refreshed && <span style={{ fontSize: 11, color: '#999' }}>Updated {refreshed}</span>}
      </div>

      {error && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#856404' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      {orders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          {Object.entries(STATUS).map(([key, cfg]) => (
            <div key={key} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{cfg.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: cfg.color, marginTop: 2 }}>{counts[key] || 0}</div>
              <div style={{ fontSize: 11, color: cfg.color, opacity: 0.8 }}>{cfg.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Orders list */}
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ background: '#232F3E', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#FF9900', fontSize: 14, fontWeight: 500 }}>
            {customer ? `${customer.name}'s Orders` : 'Orders'}
          </span>
          <span style={{ color: '#aaa', fontSize: 12 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {loading && (
          <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>Loading orders...</div>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>
            No orders yet. Go to <strong>Store</strong> and place one!
          </div>
        )}

        {!loading && orders.map((order, idx) => {
          const cfg = STATUS[order.status] || { bg: '#f5f5f5', color: '#555', border: '#ccc', icon: '📋', label: order.status };
          return (
            <div
              key={order.id}
              style={{
                padding: '14px 16px',
                borderTop: idx === 0 ? 'none' : '1px solid #eee',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              {/* Status icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 6,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
              }}>
                {cfg.icon}
              </div>

              {/* Order details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0066C0' }}>{order.id}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 12,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
                  }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>{order.productName}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  Qty: {order.quantity} · Placed: {new Date(order.createdAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Amount */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#B12704' }}>
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div style={{ marginTop: 14, background: '#232F3E', borderRadius: 6, padding: '10px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <p style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>
          Go to the <span style={{ color: '#FF9900', fontWeight: 500 }}>AI Support</span> tab and ask HeyCart to cancel a PENDING order or request a refund.
          Then hit <span style={{ color: '#FF9900', fontWeight: 500 }}>Refresh</span> here to see the updated status — Claude actually changes the data in MySQL via the <code style={{ background: '#333', padding: '1px 5px', borderRadius: 3, color: '#FF9900' }}>@Tool</code> methods.
        </p>
      </div>
    </div>
  );
}
