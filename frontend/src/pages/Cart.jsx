import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// URL Base Backend (sesuai port Express Anda)
const API_BASE_URL = 'http://localhost:3000';

// Helper untuk format URL Gambar
const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('studentToken');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCart(token);
    }, [navigate]);

    const fetchCart = async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setCart(result.cart);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menghapus item spesifik dari keranjang
    const handleRemoveItem = async (productId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini dari keranjang?')) return;

        try {
            const token = localStorage.getItem('studentToken');
            const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setMessage('🗑️ Produk berhasil dihapus dari keranjang.');
                fetchCart(token); // Muat ulang data keranjang
            } else {
                setMessage(`Gagal menghapus: ${result.message}`);
            }
        } catch (error) {
            console.error('Remove cart item error:', error);
            setMessage('Terjadi kesalahan saat menghapus produk.');
        }
    };

    const handleCheckout = async () => {
        if (!window.confirm('Apakah Anda yakin ingin memproses pesanan ini?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('studentToken');
            const response = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            const result = await response.json();

            if (result.success) {
                navigate('/payment', {
                    state: {
                        order: {
                            orderId: result.orderId,
                            totalAmount: result.totalAmount || totalHarga
                        }
                    }
                });
            } else {
                setMessage(`Gagal: ${result.message}`);
            }
        } catch (error) {
            setMessage('Terjadi kesalahan saat memproses checkout.');
            console.error('Checkout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const cartItems = cart?.items || [];
    const totalHarga = cart?.total || 0;

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', padding: '40px' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🛒 Keranjang Belanja
                    </h2>
                    <button 
                        onClick={() => navigate('/home')} 
                        style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #7c3aed', color: '#c084fc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ← Kembali Belanja
                    </button>
                </div>

                {message && (
                    <div style={{ 
                        padding: '15px', 
                        borderRadius: '8px', 
                        marginBottom: '20px', 
                        background: message.includes('Berhasil') || message.includes('dihapus') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: message.includes('Berhasil') || message.includes('dihapus') ? '1px solid #10b981' : '1px solid #ef4444',
                        color: message.includes('Berhasil') || message.includes('dihapus') ? '#6ee7b7' : '#fca5a5'
                    }}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8' }}>Memuat keranjang...</p>
                ) : cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Keranjang belanja Anda masih kosong.</p>
                    </div>
                ) : (
                    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {cartItems.map((item) => (
                            <div key={item.cart_item_id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px' }}>
                                
                                {/* Container Gambar Produk */}
                                <div style={{ width: '90px', height: '90px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginRight: '20px', flexShrink: 0 }}>
                                    {item.image_url ? (
                                        <img 
                                            src={getImageUrl(item.image_url)} 
                                            alt={item.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '11px' }}>Tidak Ada Gambar</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>{item.name}</h4>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#94a3b8' }}>SKU: {item.sku}</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#c084fc', fontWeight: '600' }}>{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    <strong style={{ fontSize: '18px', color: '#fff' }}>Rp {Number(item.subtotal).toLocaleString('id-ID')}</strong>
                                    
                                    <button 
                                        onClick={() => handleRemoveItem(item.product_id)}
                                        style={{ 
                                            background: 'rgba(239, 68, 68, 0.15)', 
                                            color: '#fca5a5', 
                                            border: '1px solid rgba(239, 68, 68, 0.4)', 
                                            padding: '6px 12px', 
                                            borderRadius: '6px', 
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '2px dashed rgba(255,255,255,0.2)' }}>
                            <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '500' }}>Total Belanja:</span>
                            <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#c084fc' }}>Rp {totalHarga.toLocaleString('id-ID')}</span>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 'bold', 
                                fontSize: '16px', 
                                cursor: 'pointer',
                                marginTop: '25px',
                                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
                            }}
                        >
                            Proses Pembayaran (Checkout)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}