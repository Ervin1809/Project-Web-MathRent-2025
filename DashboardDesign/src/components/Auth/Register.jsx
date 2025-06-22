import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        nim: '',
        name: '',
        kode_akses: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
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
        setSuccess('');

        console.log('🔄 REGISTER DEBUG: Starting registration process');
        console.log('📝 REGISTER DEBUG: Form data:', formData);

        // Validation
        if (formData.kode_akses.length < 6) {
            setError('Kode akses minimal 6 karakter');
            setLoading(false);
            return;
        }

        try {
            console.log('📡 REGISTER DEBUG: Calling register from AuthContext...');
            const result = await register(formData);
            
            console.log('📨 REGISTER DEBUG: Register result:', result);

            if (result.success) {
                console.log('✅ REGISTER DEBUG: Registration successful!');
                setSuccess('Registrasi berhasil! Silakan login dengan akun baru Anda.');
                
                // Clear form
                setFormData({
                    nim: '',
                    name: '',
                    kode_akses: ''
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                console.error('❌ REGISTER DEBUG: Registration failed');
                console.error('🚨 REGISTER DEBUG: Error message:', result.error);
                setError(result.error);
            }
        } catch (error) {
            console.error('💥 REGISTER DEBUG: Exception caught:', error);
            console.error('💥 REGISTER DEBUG: Error details:', error.message);
            setError('Terjadi kesalahan sistem');
        }
        
        setLoading(false);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <div className="">

                {/* Left Side - Branding */}
                <div className="absolute left-4 lg:left-[153px] top-8 lg:top-[146px] z-10">
                    {/* Logo/Image Placeholder */}
                    <img
                        className="w-40 h-48 lg:w-60 lg:h-72 object-cover rounded-lg shadow-lg"
                        src="https://placehold.co/236x283"
                        alt="MathRent Logo"
                    />

                    {/* Brand Title */}
                    <div className="mt-8 lg:mt-[137px]">
                        <h1 className="text-4xl lg:text-8xl font-normal font-italiana text-red-800 leading-tight">
                            MathRent
                        </h1>

                        {/* Underline */}
                        <div className="w-full max-w-96 h-0 mt-4 border-t-[1.23px] border-red-700"></div>

                        {/* Subtitle */}
                        <div className="mt-6 max-w-[486px]">
                            <span className="text-black text-lg lg:text-2xl font-normal font-josefin">
                                Official Equipment Lending Platform <br />of the{' '}
                            </span>
                            <span className="text-red-600 text-lg lg:text-2xl font-normal font-josefin">
                                Department of Mathematics
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="ml-auto w-full max-w-md lg:max-w-none lg:w-[597px] lg:absolute lg:right-[104px] lg:top-[187px]">
                    <div className="bg-rose-200/20 rounded-[20px] p-8 lg:p-12 border-4 border-rose-200/30 min-h-96">

                        {/* Header with Back Button */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={handleBackToHome}
                                className="text-neutral-50 text-base font-bold font-inter bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                ← Kembali
                            </button>
                            <div className="text-neutral-50 text-base font-bold font-inter bg-gray-600 px-4 py-2 rounded-lg">
                                Daftar
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* NIM Field */}
                            <div>
                                <label className="block text-black text-xl lg:text-2xl font-normal font-josefin mb-4">
                                    NIM
                                </label>
                                <input
                                    type="text"
                                    name="nim"
                                    value={formData.nim}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 bg-rose-200 rounded-2xl px-4 text-black placeholder-gray-600 border-none outline-none focus:bg-rose-300/50 transition-colors font-poppins"
                                    placeholder="Masukkan NIM (contoh: H071231050)"
                                />
                            </div>

                            {/* Nama Field */}
                            <div>
                                <label className="block text-black text-xl lg:text-2xl font-normal font-josefin mb-4">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 bg-rose-200 rounded-2xl px-4 text-black placeholder-gray-600 border-none outline-none focus:bg-rose-300/50 transition-colors font-poppins"
                                    placeholder="Masukkan nama lengkap (contoh: M.ERVIN)"
                                />
                            </div>

                            {/* Kode Akses Field */}
                            <div>
                                <label className="block text-black text-xl lg:text-2xl font-normal font-josefin mb-4">
                                    Kode Akses
                                </label>
                                <input
                                    type="password"
                                    name="kode_akses"
                                    value={formData.kode_akses}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 bg-rose-200 rounded-2xl px-4 text-black placeholder-gray-600 border-none outline-none focus:bg-rose-300/50 transition-colors font-poppins"
                                    placeholder="Masukkan kode akses (minimal 6 karakter)"
                                />
                            </div>

                            {/* Success Message */}
                            {success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg font-poppins">
                                    {success}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg font-poppins">
                                    {error}
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-red-700 rounded-2xl hover:bg-red-800 focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <span className="text-neutral-50 text-xl font-bold font-inter">
                                    {loading ? 'Mendaftar...' : 'Daftar'}
                                </span>
                            </button>

                            {/* Login Link */}
                            <div className="text-center mt-6">
                                <span className="text-black text-lg font-normal font-poppins">
                                    Sudah punya akun?{' '}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLoginClick}
                                    className="text-black text-lg font-normal font-poppins underline hover:text-red-700 transition-colors"
                                >
                                    Masuk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;