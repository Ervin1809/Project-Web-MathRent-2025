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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 lg:px-32 py-12">
        <div className="flex flex-col lg:flex-row items-start gap-x-24 w-full max-w-7xl">

            {/* Left Side - Branding */}
            <div className="flex flex-col items-center lg:items-start mt-18 w-full max-w-sm px-4 lg:px-0">
                <img
                    src="src/assets/unhas-logo.png"
                    alt="UNHAS Logo"
                    className="w-48 h-48 lg:w-64 lg:h-64 object-contain mb-6"
                />

                <h1 className="text-5xl lg:text-7xl font-serif italic text-red-800 mb-2 text-center lg:text-left">
                    MathRent
                </h1>

                <div className="w-full">
                    <hr className="w-full border-t-[1.5px] border-red-700 my-4" />
                    <p className="text-lg lg:text-xl font-light font-['Poppins'] text-gray-800 text-left">
                    Official Equipment Lending Platform <br />
                    of the <span className="text-red-600">Department of Mathematics</span>
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full max-w-xl">
                <div className="bg-rose-50 rounded-2xl p-6 lg:p-10 border border-rose-200 shadow-md">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 mt-0">
                        <button
                            onClick={handleBackToHome}
                            className="text-white text-sm font-light font-['Poppins'] bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            ← Kembali
                        </button>
                        
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Nama Lengkap */}
                    <div>
                        <label className="block text-black text-base font-medium font-['Poppins'] mb-1 text-left">
                        Nama Lengkap
                        </label>
                        <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-rose-200 rounded-xl px-4 text-black placeholder-gray-600 outline-none focus:bg-rose-300/50 font-['Poppins']"
                        placeholder="Masukkan nama lengkap"
                        />
                    </div>

                    {/* NIM */}
                    <div>
                        <label className="block text-black text-base font-medium font-['Poppins'] mb-1 text-left">
                        NIM
                        </label>
                        <input
                        type="text"
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-rose-200 rounded-xl px-4 text-black placeholder-gray-600 outline-none focus:bg-rose-300/50 font-['Poppins']"
                        placeholder="Masukkan NIM"
                        />
                    </div>

                    {/* Kode Akses */}
                    <div>
                        <label className="block text-black text-base font-medium font-['Poppins'] mb-1 text-left">
                        Kode Akses
                        </label>
                        <input
                        type="password"
                        name="kode_akses"
                        value={formData.kode_akses}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-rose-200 rounded-xl px-4 text-black placeholder-gray-600 outline-none focus:bg-rose-300/50 font-['Poppins']"
                        placeholder="Masukkan kode akses (min: 6 karakter)"
                        />
                    </div>

                    {/* Program Studi */}
                    <div>
                        <label className="block text-black text-base font-medium font-['Poppins'] mb-1 text-left">
                        Program Studi
                        </label>
                        <select
                        name="prodi"
                        className="w-full h-12 bg-rose-200 rounded-xl px-4 text-black outline-none focus:bg-rose-300/50 font-['Poppins']"
                        >
                        <option value="">Pilih Program Studi</option>
                        <option value="Sistem Informasi">Sistem Informasi</option>
                        <option value="Matematika">Matematika</option>
                        </select>
                    </div>

                    {/* Angkatan */}
                    <div>
                        <label className="block text-black text-base font-medium font-['Poppins'] mb-1 text-left">
                        Angkatan
                        </label>
                        <select
                        name="angkatan"
                        className="w-full h-12 bg-rose-200 rounded-xl px-4 text-black outline-none focus:bg-rose-300/50 font-['Poppins']"
                        >
                        <option value="">Pilih Angkatan</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        </select>
                    </div>

                    {/* Success/Error */}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg font-['Poppins']">
                        {success}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg font-['Poppins']">
                        {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-red-700 rounded-xl hover:bg-red-800 focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <span className="text-white text-lg font-bold font-['Poppins']">
                        {loading ? 'Mendaftar...' : 'Daftar'}
                        </span>
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                        <span className="text-black text-sm font-normal font-['Poppins']">
                        Sudah punya akun?{' '}
                        </span>
                        <button
                        type="button"
                        onClick={handleLoginClick}
                        className="text-black text-sm font-normal font-['Poppins'] underline hover:text-red-700 transition-colors"
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