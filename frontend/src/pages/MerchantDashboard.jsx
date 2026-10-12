import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MerchantDashboard() {
    const navigate = useNavigate();
    const [merchant, setMerchant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // State Form Tambah Produk
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: '',
        access_scope: 'STUDY_PROGRAM',
        faculty_id: '',
        study_program_id: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key untuk reset file input HTML

    useEffect(() => {
        const storedMerchant = localStorage.getItem('merchantData');
        const token = localStorage.getItem('merchantToken');

        if (!storedMerchant || !token) {
            navigate('/merchant/login');
            return;
        }

        const parsedMerchant = JSON.parse(storedMerchant);
        setMerchant(parsedMerchant);

        // Fetch produk yang dimiliki oleh merchant ini
        fetchMerchantProducts(parsedMerchant.id);
    }, [navigate]);

    const fetchMerchantProducts = async (merchantId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/products/merchant/${merchantId}`);
            const result = await response.json();
            if (result.success) {
                setProducts(result.products);
            }
        } catch (error) {
            console.error('Error fetching merchant products:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('merchantToken');
            const data = new FormData();
            data.append('merchant_id', merchant.id);
            data.append('merchant_type', merchant.merchant_type);
            data.append('sku', formData.sku);
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('access_scope', formData.access_scope);
            
            if (formData.faculty_id) data.append('faculty_id', formData.faculty_id);
            if (formData.study_program_id) data.append('study_program_id', formData.study_program_id);
            if (imageFile) data.append('image', imageFile);

            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const result = await response.json();

            if (result.success) {
                setMessage('🎉 Produk berhasil ditambahkan!');
                setFormData({
                    sku: '',
                    name: '',
                    price: '',
                    access_scope: 'STUDY_PROGRAM',
                    faculty_id: '',
                    study_program_id: ''
                });
                setImageFile(null);
                setFileInputKey(Date.now()); // Reset input file UI
                fetchMerchantProducts(merchant.id);
            } else {
                setMessage(`Gagal: ${result.message}`);
            }
        } catch (error) {
            console.error('Submit product error:', error);
            setMessage('Terjadi kesalahan koneksi saat menyimpan produk.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

        try {
            const token = localStorage.getItem('merchantToken');
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setMessage('🗑️ Produk berhasil dihapus!');
                fetchMerchantProducts(merchant.id);
            } else {
                setMessage(`Gagal menghapus: ${result.message}`);
            }
        } catch (error) {
            console.error('Delete product error:', error);
            setMessage('Gagal menghapus produk.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('merchantToken');
        localStorage.removeItem('merchantData');
        navigate('/merchant/login');
    };

    if (!merchant) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', padding: '30px' }}>
            {/* Header Dashboard */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src="http://localhost:3000/logo/logoamikom.png" alt="Logo Amikom" style={{ height: '40px', objectFit: 'contain' }} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', color: '#fff' }}>Dashboard Penjual</h2>
                        <span style={{ color: '#c084fc', fontSize: '13px', fontWeight: 'bold' }}>{merchant.name}</span>
                    </div>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Keluar
                </button>
            </div>

            {message && (
                <div style={{ padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', background: message.includes('berhasil') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: message.includes('berhasil') ? '1px solid #10b981' : '1px solid #ef4444', color: message.includes('berhasil') ? '#6ee7b7' : '#fca5a5' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
                {/* Form Tambah Produk */}
                <div style={{ background: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', height: 'fit-content' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '18px' }}>+ Tambah Produk Baru</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 'bold' }}>SKU Produk:</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Contoh: PDH-TI-2026" required style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 'bold' }}>Nama Produk:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Kemeja PDH Resmi TI" required style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 'bold' }}>Harga (Rp):</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="150000" required style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 'bold' }}>Cakupan Target Akses:</label>
                            <select name="access_scope" value={formData.access_scope} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}>
                                <option value="STUDY_PROGRAM">Program Studi Spesifik</option>
                                <option value="FACULTY">Satu Fakultas</option>
                                <option value="ALL_STUDENT">Seluruh Mahasiswa Universitas</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 'bold' }}>Upload File Gambar Produk:</label>
                            <input key={fileInputKey} type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', color: '#94a3b8', fontSize: '12px' }} />
                        </div>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {loading ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                    </form>
                </div>

                {/* Daftar Produk Merchant */}
                <div>
                    <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '18px' }}>Katalog Produk Toko Anda ({products.length})</h3>
                    {products.length === 0 ? (
                        <div style={{ background: '#1e293b', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p style={{ color: '#94a3b8', margin: 0 }}>Belum ada produk yang di-upload oleh toko ini.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {products.map((p) => (
                                <div key={p.id} style={{ background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '140px', background: '#0f172a', overflow: 'hidden' }}>
                                        {p.image_url ? (
                                            <img 
                                                src={p.image_url.startsWith('http') ? p.image_url : `http://localhost:3000${p.image_url}`} 
                                                alt={p.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '12px' }}>Tanpa Gambar</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <small style={{ color: '#94a3b8', fontSize: '11px' }}>{p.sku}</small>
                                            <h4 style={{ margin: '4px 0 10px 0', fontSize: '14px', color: '#fff' }}>{p.name}</h4>
                                            <strong style={{ color: '#c084fc', fontSize: '15px', display: 'block', marginBottom: '15px' }}>
                                                Rp {Number(p.price).toLocaleString('id-ID')}
                                            </strong>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteProduct(p.id)}
                                            style={{ width: '100%', padding: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                        >
                                            🗑️ Hapus Produk
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}