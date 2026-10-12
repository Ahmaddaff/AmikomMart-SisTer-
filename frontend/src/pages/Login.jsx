import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [nim, setNim] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/student/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nim })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.setItem('studentToken', result.token);
                localStorage.setItem('studentData', JSON.stringify(result.student));
                navigate('/home');
            } else {
                setError(result.message || 'Login gagal, NIM tidak terdaftar.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
            <div style={{ maxWidth: '400px', width: '100%', background: '#1e293b', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img 
                        src="http://localhost:3000/logo/logoamikom.png" 
                        alt="Logo Amikom" 
                        style={{ height: '50px', objectFit: 'contain', marginBottom: '15px' }} 
                    />
                    <h2 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '24px', fontWeight: '800' }}>AMIKOM MART</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Login Mahasiswa (Cukup masukkan NIM)</p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>NIM Mahasiswa:</label>
                        <input 
                            type="text" 
                            value={nim} 
                            onChange={(e) => setNim(e.target.value)} 
                            placeholder="Contoh: 24SA31A035" 
                            required 
                            style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)', marginBottom: '20px' }}
                    >
                        {loading ? 'Memproses...' : 'Masuk ke Beranda'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                        Ingin mengelola toko sebagai Penjual?{' '}
                        <Link to="/merchant/login" style={{ color: '#c084fc', fontWeight: 'bold', textDecoration: 'none' }}>
                            Masuk ke Halaman Merchant &rarr;
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}