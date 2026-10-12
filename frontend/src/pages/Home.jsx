import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const [student, setStudent] = useState({
        name: 'Mahasiswa Amikom',
        nim: '-',
        study_program_name: 'Teknologi Informasi',
        faculty_name: 'Fakultas Ilmu Komputer'
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('studentToken');
        const studentData = localStorage.getItem('studentData');

        if (!token) {
            navigate('/login');
            return;
        }

        if (studentData) {
            try {
                const parsedStudent = JSON.parse(studentData);
                setStudent((prev) => ({
                    ...prev,
                    ...parsedStudent
                }));
            } catch (e) {
                console.error("Gagal parsing student data:", e);
            }
        }

        fetchProducts(token);
    }, [navigate]);

    const fetchProducts = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setProducts(result.products || []);
            } else {
                setMessage('Gagal memuat katalog produk.');
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            setMessage('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentData');
        navigate('/login');
    };

    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem('studentToken');
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });
            const result = await response.json();
            if (result.success) {
                alert('Produk berhasil ditambahkan ke keranjang!');
            } else {
                alert(`Gagal: ${result.message}`);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            alert('Kesalahan koneksi saat menambahkan ke keranjang.');
        }
    };

    // Helper URL Gambar
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // Helper Badge Scope Akses (Menggunakan warna tema ungu yang seragam)
    const renderScopeBadge = (scope) => {
        const themeStyle = {
            bg: 'rgba(192, 132, 252, 0.15)',
            color: '#c084fc',
            border: '1px solid rgba(192, 132, 252, 0.3)'
        };

        switch (scope) {
            case 'STUDY_PROGRAM':
                return { label: '🎓 Khusus Prodi', ...themeStyle };
            case 'FACULTY':
                return { label: '🏛️ Tingkat Fakultas', ...themeStyle };
            case 'ALL_STUDENT':
            default:
                return { label: '🌐 Universitas', ...themeStyle };
        }
    };

    // Filter Produk Berdasarkan Tingkatan
    const prodiProducts = products.filter(p => p.access_scope === 'STUDY_PROGRAM');
    const facultyProducts = products.filter(p => p.access_scope === 'FACULTY');
    const univProducts = products.filter(p => p.access_scope === 'ALL_STUDENT');

    // Reusable Component Kartu Produk
    const ProductCard = ({ item }) => {
        const fullImageUrl = getImageUrl(item.image_url);
        const badge = renderScopeBadge(item.access_scope);

        return (
            <div style={{ 
                background: '#1e293b', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
                <div style={{ height: '200px', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
                    {fullImageUrl ? (
                        <img 
                            src={fullImageUrl} 
                            alt={item.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    <div style={{ 
                        display: fullImageUrl ? 'none' : 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%', 
                        color: '#64748b', 
                        fontSize: '13px' 
                    }}>
                        Tidak ada gambar
                    </div>
                    <span style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px', 
                        background: badge.bg, 
                        backdropFilter: 'blur(4px)',
                        color: badge.color, 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        border: badge.border
                    }}>
                        {badge.label}
                    </span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>SKU: {item.sku}</span>
                        <h4 style={{ margin: '6px 0 10px 0', fontSize: '16px', fontWeight: '700', color: '#fff', lineHeight: '1.4' }}>{item.name}</h4>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#c084fc' }}>
                            Rp {Number(item.price).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <button 
                        onClick={() => handleAddToCart(item.id)}
                        style={{ 
                            marginTop: '20px', 
                            width: '100%', 
                            padding: '10px', 
                            background: '#7c3aed', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer'
                        }}
                    >
                        + Tambah ke Keranjang
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
            
            {/* --- NAVBAR UTAMA --- */}
            <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '18px 40px', 
                background: 'rgba(15, 23, 42, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img 
                        src="http://localhost:3000/logo/logoamikom.png" 
                        alt="Logo Amikom" 
                        style={{ height: '42px', objectFit: 'contain' }} 
                    />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', color: '#fff' }}>AMIKOM MART</h1>
                        <span style={{ fontSize: '10px', color: '#c084fc', fontWeight: 'bold', letterSpacing: '1px' }}>OFFICIAL MERCHANDISE</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', fontSize: '14px', fontWeight: '500' }}>
                    <button 
                        onClick={() => navigate('/home')} 
                        style={{ background: 'transparent', border: 'none', color: '#c084fc', cursor: 'pointer', fontSize: '14px' }}
                    >
                        Beranda
                    </button>
                    <a href="#katalog" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Katalog</a>
                    <button 
                        onClick={() => navigate('/cart')} 
                        style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '14px' }}
                    >
                        🛒 Keranjang
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{student.name}</span>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            padding: '8px 16px', 
                            background: 'transparent', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            color: '#f8fafc', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Keluar
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header style={{ 
                padding: '60px 40px', 
                background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ maxWidth: '650px' }}>
                    <span style={{ 
                        display: 'inline-block', 
                        padding: '6px 14px', 
                        background: 'rgba(192, 132, 252, 0.15)', 
                        color: '#c084fc', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        marginBottom: '15px',
                        border: '1px solid rgba(192, 132, 252, 0.3)'
                    }}>
                        UNIVERSITAS AMIKOM PURWOKERTO
                    </span>
                    <h2 style={{ fontSize: '42px', fontWeight: '900', lineHeight: '1.15', margin: '0 0 15px 0', color: '#ffffff' }}>
                        Wear Your <span style={{ color: '#c084fc' }}>Amikom Pride.</span>
                    </h2>
                    <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '25px' }}>
                        Katalog disesuaikan otomatis dengan Program Studi dan Fakultas Anda.
                    </p>
                    <a href="#katalog" style={{ 
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: '#7c3aed',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)'
                    }}>
                        Jelajahi Produk &rarr;
                    </a>
                </div>
            </header>

            {/* --- KARTU PROFIL MAHASISWA --- */}
            <div style={{ padding: '0 40px', transform: 'translateY(-30px)', zIndex: 10, position: 'relative' }}>
                <div style={{ 
                    background: '#1e293b', 
                    borderRadius: '16px', 
                    padding: '20px 30px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>Mahasiswa Aktif</span>
                        <h3 style={{ margin: '4px 0', fontSize: '18px', color: '#fff', fontWeight: '700' }}>{student.name}</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>{student.nim} &bull; <strong style={{ color: '#c084fc' }}>{student.study_program_name || student.study_program || 'Teknologi Informasi'}</strong></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#c084fc' }}>{student.faculty_name || student.faculty || 'Fakultas Ilmu Komputer'}</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Akses merchandise khusus untuk tingkat Anda</p>
                    </div>
                </div>
            </div>

            {/* --- KATALOG PRODUK BERDASARKAN TINGKATAN --- */}
            <main id="katalog" style={{ padding: '10px 40px 60px 40px' }}>
                
                {message && (
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', marginBottom: '20px' }}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Memuat produk...</p>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Belum ada produk yang tersedia untuk tingkat akses akademik Anda saat ini.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '45px' }}>
                        
                        {/* SECTION 1: PROGRAM STUDI */}
                        {prodiProducts.length > 0 && (
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#c084fc' }}>
                                        🎓 Merchandise Program Studi ({student.study_program_name || 'Prodi'})
                                    </h3>
                                    <span style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {prodiProducts.length} Produk
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
                                    {prodiProducts.map(item => <ProductCard key={item.id} item={item} />)}
                                </div>
                            </section>
                        )}

                        {/* SECTION 2: FAKULTAS */}
                        {facultyProducts.length > 0 && (
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#c084fc' }}>
                                        🏛️ Merchandise {student.faculty_name || 'Fakultas'}
                                    </h3>
                                    <span style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {facultyProducts.length} Produk
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
                                    {facultyProducts.map(item => <ProductCard key={item.id} item={item} />)}
                                </div>
                            </section>
                        )}

                        {/* SECTION 3: UNIVERSITAS / ALL STUDENT */}
                        {univProducts.length > 0 && (
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#c084fc' }}>
                                        🌐 Merchandise Universitas Amikom Purwokerto
                                    </h3>
                                    <span style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {univProducts.length} Produk
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
                                    {univProducts.map(item => <ProductCard key={item.id} item={item} />)}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
}