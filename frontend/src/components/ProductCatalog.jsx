import React, { useState, useEffect } from 'react';

const CATEGORY_ICONS = {
  Electronics:  '🎧',
  Wearables:    '⌚',
  Accessories:  '🖱️',
  Tablets:      '📱',
};

const FAKE_RATINGS = {
  'P001': { stars: 4.8, count: 2841 },
  'P002': { stars: 4.7, count: 1923 },
  'P003': { stars: 4.4, count: 1203 },
  'P004': { stars: 4.9, count: 5102 },
  'P005': { stars: 4.6, count: 890 },
  'P006': { stars: 4.5, count: 3310 },
};

function StarRating({ value }) {
  return (
    <span style={{ color: '#FF9900', fontSize: 12 }}>
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

export default function ProductCatalog({ onOrderPlaced, onCartChange }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState({});       // { productId: quantity }
  const [placing, setPlacing] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/products').then(r => r.json()),
      fetch('http://localhost:8080/api/customers').then(r => r.json()),
    ])
      .then(([prods, custs]) => {
        setProducts(prods);
        setCustomers(custs);
        if (custs.length > 0) setSelectedCustomer(custs[0].id);
      })
      .catch(() => setError('Cannot reach backend on port 8080. Is Spring Boot running?'));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const addToCart = (productId) => {
    const updated = { ...cart, [productId]: (cart[productId] || 0) + 1 };
    setCart(updated);
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    onCartChange(total);
    showToast('Added to cart!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const placeOrder = async (productId) => {
    if (!selectedCustomer) return;
    setPlacing(productId);
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomer, productId, quantity: cart[productId] || 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');
      const updated = { ...cart };
      delete updated[productId];
      setCart(updated);
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      onCartChange(total);
      showToast(`Order ${data.id} placed!`);
      if (onOrderPlaced) onOrderPlaced(data);
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setPlacing(null);
    }
  };

  const cartTotal = products.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * parseFloat(p.price);
  }, 0);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 20, zIndex: 999,
          background: '#232F3E', color: '#fff', padding: '10px 18px',
          borderRadius: 6, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>{toast}</div>
      )}

      {error && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#856404' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Customer selector + cart summary */}
      <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #ddd', padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Shopping as:</span>
          <select
            value={selectedCustomer}
            onChange={e => setSelectedCustomer(e.target.value)}
            style={{ border: '1px solid #ddd', borderRadius: 4, padding: '4px 10px', fontSize: 13, background: '#fff', color: '#111', cursor: 'pointer' }}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
            ))}
          </select>
        </div>

        {Object.keys(cart).length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#555' }}>
              🛒 {Object.values(cart).reduce((a, b) => a + b, 0)} item{Object.values(cart).reduce((a, b) => a + b, 0) !== 1 ? 's' : ''} · <strong>${cartTotal.toFixed(2)}</strong>
            </span>
            <button
              onClick={() => Object.keys(cart).forEach(pid => placeOrder(pid))}
              style={{ background: '#FF9900', border: '1px solid #e88b00', borderRadius: 4, padding: '6px 14px', fontSize: 13, fontWeight: 500, color: '#111', cursor: 'pointer' }}
            >
              Place all orders
            </button>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? '#232F3E' : '#fff',
              color: activeCategory === cat ? '#FF9900' : '#333',
              border: '1px solid #ddd',
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: activeCategory === cat ? 500 : 400,
              cursor: 'pointer',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {filteredProducts.map(product => {
          const rating = FAKE_RATINGS[product.id] || { stars: 4.5, count: 500 };
          const inCart = cart[product.id] || 0;

          return (
            <div
              key={product.id}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Product image placeholder */}
              <div style={{
                background: '#F0F2F2',
                borderRadius: 4,
                height: 110,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
              }}>
                {CATEGORY_ICONS[product.category] || '📦'}
              </div>

              {/* Name */}
              <div style={{ fontSize: 13, color: '#0066C0', lineHeight: 1.4, cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.name}
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <StarRating value={rating.stars} />
                <span style={{ fontSize: 11, color: '#0066C0' }}>{rating.count.toLocaleString()}</span>
              </div>

              {/* Price */}
              <div>
                <span style={{ fontSize: 11, color: '#555', verticalAlign: 'top', lineHeight: '20px' }}>$</span>
                <span style={{ fontSize: 21, fontWeight: 500, color: '#B12704' }}>{Math.floor(product.price)}</span>
                <span style={{ fontSize: 13, color: '#B12704' }}>.{(product.price % 1).toFixed(2).slice(2)}</span>
              </div>

              {/* Category badge */}
              <div style={{ fontSize: 11, color: '#555' }}>
                <span style={{ background: '#F0F2F2', borderRadius: 3, padding: '2px 6px' }}>{product.category}</span>
                <span style={{ marginLeft: 6, color: product.stock > 10 ? '#007600' : '#c45500' }}>
                  {product.stock > 10 ? `In Stock` : `Only ${product.stock} left`}
                </span>
              </div>

              {/* Description */}
              <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.description}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Quantity in cart */}
                {inCart > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <button
                      onClick={() => {
                        const updated = { ...cart };
                        if (updated[product.id] <= 1) delete updated[product.id];
                        else updated[product.id]--;
                        setCart(updated);
                        onCartChange(Object.values(updated).reduce((a, b) => a + b, 0));
                      }}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 16 }}
                    >−</button>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{inCart}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 16 }}
                    >+</button>
                  </div>
                )}

                {inCart === 0 ? (
                  <button className="btn-cart" onClick={() => addToCart(product.id)} disabled={product.stock === 0}>
                    {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => placeOrder(product.id)}
                    disabled={placing === product.id}
                  >
                    {placing === product.id ? 'Placing...' : 'Place order'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
