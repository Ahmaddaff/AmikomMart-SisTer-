import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function MerchantLogin() {
    const navigate = useNavigate();
    
    const merchantOptions = [
        "Universitas Amikom Purwokerto",
        "Fakultas Ilmu Komputer",
        "Fakultas Bisnis dan Ilmu Sosial",
        "Prodi Teknologi Informasi",
        "Prodi Informatika",
        "Prodi Sistem Informasi",
        "Prodi Ilmu Komunikasi",
        "Prodi Bisnis Digital",
        "Prodi Manajemen",
        "Prodi Hukum"
    ];

    const [selectedEntity, setSelectedEntity] = useState(merchantOptions[0]);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/merchant/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    storeName: selectedEntity, 
                    password: password 
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.setItem('merchantToken', result.token);
                localStorage.setItem('merchantData', JSON.stringify(result.merchant));
                navigate('/merchant/dashboard');
            } else {
                setError(result.message || 'Login merchant gagal.');
            }
        } catch (err) {
            console.error('Merchant login error:', err);
            setError('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            fontFamily: 'sans-serif', 
            background: '#0f172a', 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px' 
        }}>
            <div style={{ 
                maxWidth: '420px', 
                width: '100%', 
                padding: '40px 30px', 
                background: '#1e293b', 
                borderRadius: '16px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                border: '1px solid #334155',
                color: '#f8fafc'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img 
                        src="http://localhost:3000/logo/logoamikom.png" 
                        alt="Logo Amikom" 
                        style={{ height: '52px', objectFit: 'contain', marginBottom: '15px' }} 
                    />
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#f8fafc' }}>Login Portal Merchant</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                        Khusus Pengelola Prodi, Fakultas, & Universitas Amikom
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '12px', 
                        background: 'rgba(239, 68, 68, 0.2)', 
                        border: '1px solid #ef4444', 
                        color: '#fca5a5', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        fontSize: '13px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#e2e8f0' }}>
                            Pilih Instansi / Toko:
                        </label>
                        <select 
                            value={selectedEntity} 
                            onChange={(e) => setSelectedEntity(e.target.value)} 
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                background: '#0f172a',
                                border: '1px solid #475569', 
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        >
                            {merchantOptions.map((opt, idx) => (
                                <option key={idx} value={opt} style={{ background: '#1e293b', color: '#f8fafc' }}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#e2e8f0' }}>
                            Password / Kode Akses:
                        </label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Masukkan sandi khusus instansi..." 
                            required 
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                background: '#0f172a',
                                border: '1px solid #475569', 
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
                            color: '#fff', 
                            padding: '14px', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard Toko'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <Link 
                        to="/login"
                        style={{ 
                            color: '#a78bfa', 
                            fontSize: '13px',
                            textDecoration: 'underline'
                        }}
                    >
                        &larr; Kembali ke Halaman Login Mahasiswa
                    </Link>
                </div>
            </div>
        </div>
    );
}