import React, { useState, useEffect } from 'react';

const STATUS_COLORS = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  SHIPPED:   'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
};

const CATEGORY_ICONS = {
  Electronics:  '🎧',
  Wearables:    '⌚',
  Accessories:  '🖱️',
  Tablets:      '📱',
};

export default function PlaceOrderForm({ onOrderPlaced }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ customerId: '', productId: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Load customers + products on mount
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/customers').then(r => r.json()),
      fetch('http://localhost:8080/api/products').then(r => r.json()),
    ])
      .then(([customerData, productData]) => {
        setCustomers(customerData);
        setProducts(productData);
        setForm(f => ({
          ...f,
          customerId: customerData[0]?.id || '',
          productId: productData[0]?.id || '',
        }));
      })
      .catch(() => setError('Cannot reach backend. Is Spring Boot running on port 8080?'));
  }, []);

  // Reload recent orders when customer changes or after a successful order
  useEffect(() => {
    if (!form.customerId) return;
    fetch(`http://localhost:8080/api/orders/customer/${form.customerId}`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {});
  }, [form.customerId, success]);

  const selectedProduct = products.find(p => p.id === form.productId);
  const total = selectedProduct
    ? (selectedProduct.price * form.quantity).toFixed(2)
    : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: form.customerId,
          productId: form.productId,
          quantity: form.quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      setSuccess(data);
      if (onOrderPlaced) onOrderPlaced(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto" style={{ maxHeight: '600px' }}>

      {/* Place Order Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>🛒</span> Place a New Order
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Customer */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
            <select
              value={form.customerId}
              onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
            <select
              value={form.productId}
              onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {CATEGORY_ICONS[p.category] || '📦'} {p.name} — ${p.price}
                </option>
              ))}
            </select>

            {/* Product detail card */}
            {selectedProduct && (
              <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-2xl">{CATEGORY_ICONS[selectedProduct.category] || '📦'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedProduct.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Category: {selectedProduct.category} · In Stock: {selectedProduct.stock}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg flex items-center justify-center"
              >−</button>
              <span className="text-lg font-semibold text-gray-800 w-8 text-center">{form.quantity}</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, quantity: Math.min(10, f.quantity + 1) }))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg flex items-center justify-center"
              >+</button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Order Total</span>
            <span className="text-xl font-bold text-blue-700">${total}</span>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">
              ✅ Order <strong>{success.id}</strong> placed! Status: {success.status}
              <p className="text-xs mt-1 text-green-600">Switching to Order History…</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.customerId || !form.productId}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            {loading ? 'Placing order...' : '🛒 Place Order'}
          </button>
        </form>
      </div>

      {/* Recent orders preview */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
            <span>📦</span> Recent Orders
          </h2>
          <div className="flex flex-col gap-2">
            {orders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{order.id}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{order.productName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${parseFloat(order.totalAmount).toFixed(2)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
