import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const orderData = location.state?.order; // Menerima data pesanan dari halaman Cart

    const [paymentMethod, setPaymentMethod] = useState('QRIS');
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        // Jika diakses langsung tanpa data pesanan, kembalikan ke keranjang
        if (!orderData) {
            navigate('/cart');
        }
    }, [orderData, navigate]);

    if (!orderData) return null;

    const handleConfirmPayment = () => {
        setIsPaid(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', padding: '40px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
                
                <h2 style={{ fontSize: '24px', margin: '0 0 10px 0', color: '#fff', textAlign: 'center' }}>
                    💳 Pembayaran Pesanan
                </h2>
                <p style={{ textAlignment: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
                    Selesaikan pembayaran untuk memproses pesanan Amikom Mart Anda.
                </p>

                {isPaid ? (
                    <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px' }}>
                        <span style={{ fontSize: '48px' }}>🎉</span>
                        <h3 style={{ color: '#6ee7b7', margin: '15px 0 10px 0' }}>Pembayaran Berhasil!</h3>
                        <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '20px' }}>
                            Nomor Pesanan: <strong>#{orderData.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000)}</strong>
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            style={{ padding: '12px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Rincian Pesanan */}
                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#cbd5e1' }}>
                                <span>Total Tagihan:</span>
                                <strong style={{ color: '#c084fc', fontSize: '18px' }}>
                                    Rp {Number(orderData.totalAmount || 0).toLocaleString('id-ID')}
                                </strong>
                            </div>
                        </div>

                        {/* Pilihan Metode Pembayaran */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                Pilih Metode Pembayaran:
                            </label>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <label style={{ flex: 1, padding: '15px', background: paymentMethod === 'QRIS' ? 'rgba(124, 58, 237, 0.2)' : '#0f172a', border: paymentMethod === 'QRIS' ? '1px solid #7c3aed' : '1px solid #334155', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                                    <input type="radio" name="method" value="QRIS" checked={paymentMethod === 'QRIS'} onChange={() => setPaymentMethod('QRIS')} style={{ display: 'none' }} />
                                    📱 <strong>QRIS</strong>
                                </label>
                                <label style={{ flex: 1, padding: '15px', background: paymentMethod === 'BANK' ? 'rgba(124, 58, 237, 0.2)' : '#0f172a', border: paymentMethod === 'BANK' ? '1px solid #7c3aed' : '1px solid #334155', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                                    <input type="radio" name="method" value="BANK" checked={paymentMethod === 'BANK'} onChange={() => setPaymentMethod('BANK')} style={{ display: 'none' }} />
                                    🏦 <strong>Transfer Bank</strong>
                                </label>
                            </div>
                        </div>

                        {/* Tampilan QRIS / Bank Account */}
                        <div style={{ textAlign: 'center', padding: '20px', background: '#0f172a', borderRadius: '10px', marginBottom: '25px' }}>
                            {paymentMethod === 'QRIS' ? (
                                <div>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>Scan QRIS di bawah ini menggunakan GoPay, OVO, Dana, atau Mobile Banking:</p>
                                    <div style={{ width: '180px', height: '180px', background: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#000', fontWeight: 'bold' }}>
                                        [ Kode QRIS ]
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>Transfer ke Rekening Bank Mandiri AMIKOM Mart:</p>
                                    <strong style={{ fontSize: '18px', color: '#c084fc', display: 'block', marginBottom: '5px' }}>139-00-1234567-8</strong>
                                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>a.n. Universitas Amikom Purwokerto</span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleConfirmPayment}
                            style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                        >
                            Konfirmasi Pembayaran
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}