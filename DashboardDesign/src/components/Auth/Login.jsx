import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        nim: '',
        kode_akses: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('🔄 LOGIN DEBUG: Starting login process');
        console.log('📝 LOGIN DEBUG: Form data:', formData);
        console.log('🌐 LOGIN DEBUG: API Base URL:', '/api');
        console.log('🎯 LOGIN DEBUG: Login endpoint:', '/auth/login-simple');

        try {
            console.log('📡 LOGIN DEBUG: Calling login from AuthContext...');
            const result = await login(formData);

            console.log('📨 LOGIN DEBUG: Login result:', result);

            if (result.success) {
                console.log('✅ LOGIN DEBUG: Login successful!');
                console.log('👤 LOGIN DEBUG: User data:', result.user);
                console.log('🎭 LOGIN DEBUG: User role:', result.user.role);

                if (result.user.role === 'staff') {
                    console.log('🏢 LOGIN DEBUG: Redirecting to staff dashboard');
                    navigate('/staff/dashboard');
                } else {
                    console.log('🎓 LOGIN DEBUG: Redirecting to mahasiswa dashboard');
                    navigate('/mahasiswa/dashboard');
                }
            } else {
                console.error('❌ LOGIN DEBUG: Login failed');
                console.error('🚨 LOGIN DEBUG: Error message:', result.error);
                setError(result.error);
            }
        } catch (error) {
            console.error('💥 LOGIN DEBUG: Exception caught:', error);
            console.error('💥 LOGIN DEBUG: Error details:', error.message);
            setError('Terjadi kesalahan sistem');
        }

        setLoading(false);
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-32">
            {/* Container for the entire login section */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-x-40 w-full max-w-6xl">

               {/* Left Side: Logo & Brand */}
                <div className="flex flex-col items-center w-full max-w-[600px] px-2">
                    {/* Logo */}
                    <img
                        src="src/assets/unhas-logo.png"
                        alt="UNHAS Logo"
                        className="w-52 h-52 lg:w-72 lg:h-72 object-contain mb-6"
                    />

                    {/* Brand Title (tengah) */}
                    <h1 className="text-5xl lg:text-7xl font-serif italic text-red-800 mb-2 text-center">
                        MathRent
                    </h1>

                    {/* HR dan Deskripsi (kiri) */}
                    <div className="w-full text-left">
                        <hr className="w-full border-t-[1.5px] border-red-700 my-4" />
                        <p className="text-lg lg:text-xl font-light font-['Poppins'] text-gray-800">
                        Official Equipment Lending Platform <br />
                        of the <span className="text-red-600">Department of Mathematics</span>
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="bg-rose-50 border border-rose-200 p-8 lg:p-12 rounded-2xl shadow-md w-full max-w-md mt-12 lg:mt-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-black text-lg font-semibold font-['Poppins'] mb-2 text-left">NIM</label>
                        <input
                        type="text"
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-rose-200 placeholder-gray-600 focus:bg-rose-300 outline-none font-light font-['Poppins']"
                        placeholder="Masukkan NIM"
                        />
                    </div>

                    <div>
                        <label className="block text-black text-lg font-semibold font-['Poppins'] mb-2 text-left">Kode Akses</label>
                        <input
                        type="password"
                        name="kode_akses"
                        value={formData.kode_akses}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-rose-200 placeholder-gray-600 focus:bg-rose-300 outline-none font-light font-['Poppins']"
                        placeholder="Masukkan kode akses"
                        />
                    </div>

                    <div className="text-right">
                        <button
                        type="button"
                        className="text-blue-600 text-sm hover:underline font-light font-['Poppins']"
                        >
                        Lupa Kata Sandi?
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                        {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-xl text-lg font-bold font-['Poppins'] transition"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>

                    <div className="text-center text-sm mt-4 font-light font-['Poppins']">
                        Belum punya akun?{' '}
                        <button
                        type="button"
                        onClick={handleRegisterClick}
                        className="text-red-700 underline hover:text-red-900"
                        >
                        Daftar
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;