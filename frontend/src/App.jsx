import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import MerchantLogin from './pages/MerchantLogin';
import MerchantDashboard from './pages/MerchantDashboard';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Payment from './pages/Payment'; // <-- 1. IMPORT HALAMAN PAYMENT

function ProtectedRoute({ children }) {
    // Memeriksa token sesi mahasiswa di localStorage
    const token = localStorage.getItem('studentToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Halaman Root dialihkan otomatis ke /login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Halaman Login Mahasiswa */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Halaman Login Penjual / Merchant */}
                <Route
                    path="/merchant/login"
                    element={<MerchantLogin />}
                />

                {/* Halaman Dashboard Penjual / Merchant */}
                <Route
                    path="/merchant/dashboard"
                    element={<MerchantDashboard />}
                />

                {/* Halaman Utama Beranda Pembeli / Mahasiswa */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                {/* Halaman Keranjang Belanja Mahasiswa */}
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                {/* <-- 2. TAMBAHKAN RUTE PAYMENT DI SINI --> */}
                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute>
                            <Payment />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;