import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MahasiswaDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('🔄 Logging out user:', user);
        logout();
        navigate('/');
        console.log('✅ User logged out and redirected to home');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header with User Info and Logout */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Left side - Brand */}
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-red-800 font-italiana">
                                MathRent
                            </h1>
                            <span className="ml-4 text-gray-600 font-josefin">
                                Dashboard Mahasiswa
                            </span>
                        </div>

                        {/* Right side - User info and logout */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 font-poppins">
                                    {user?.nama || user?.name || 'User'}
                                </p>
                                <p className="text-sm text-gray-500 font-poppins">
                                    {user?.nim}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors font-inter"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">

                    {/* Welcome Section */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900 font-josefin mb-2">
                                Selamat Datang, {user?.nama || user?.name}! 👋
                            </h2>
                            <p className="text-sm text-gray-600 font-poppins">
                                Ini adalah dashboard untuk mengelola peminjaman alat dan ruangan di Departemen Matematika.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

                        {/* Peminjaman Barang */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">📦</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 font-josefin">
                                            Peminjaman Barang
                                        </h3>
                                        <p className="text-sm text-gray-600 font-poppins">
                                            Pinjam alat dan perangkat
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors font-inter">
                                        Buat Peminjaman
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Peminjaman Ruangan */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">🏢</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 font-josefin">
                                            Peminjaman Ruangan
                                        </h3>
                                        <p className="text-sm text-gray-600 font-poppins">
                                            Reservasi ruang kelas
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors font-inter">
                                        Reservasi Ruangan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">📋</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 font-josefin">
                                            Riwayat Peminjaman
                                        </h3>
                                        <p className="text-sm text-gray-600 font-poppins">
                                            Lihat peminjaman saya
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors font-inter">
                                        Lihat Riwayat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats atau Info tambahan */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 font-josefin mb-4">
                                Status Peminjaman Aktif
                            </h3>
                            <div className="text-sm text-gray-600 font-poppins">
                                <p>Anda belum memiliki peminjaman aktif saat ini.</p>
                                <p className="mt-2">Mulai buat peminjaman baru untuk menggunakan fasilitas departemen.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MahasiswaDashboard;