import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, peminjamanAPI } from '../../services/api';
import { getProdiFromNIM, getAngkatanFromNIM } from '../../utils/nimMapping';

const MahasiswaSettings = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    // State untuk password change
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // State untuk UI
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [riwayatPeminjaman, setRiwayatPeminjaman] = useState([]);
    const [riwayatLoading, setRiwayatLoading] = useState(true);

    // Get prodi info from NIM
    const prodiInfo = getProdiFromNIM(user?.nim);
    const angkatan = getAngkatanFromNIM(user?.nim);

    useEffect(() => {
        fetchRiwayatPeminjaman();
    }, []);

    const fetchRiwayatPeminjaman = async () => {
        try {
            setRiwayatLoading(true);

            const response = await peminjamanAPI.getMy();
            console.log('🔄 Riwayat Response:', response.data);

            const riwayatData = Array.isArray(response.data) ? response.data : [];
            const limitedData = riwayatData.slice(0, 5);
            setRiwayatPeminjaman(limitedData);

        } catch (error) {
            console.error('❌ Error fetching riwayat:', error);
            setRiwayatPeminjaman([]);
        } finally {
            setRiwayatLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Password baru dan konfirmasi password tidak sama');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password baru minimal 6 karakter');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await userAPI.changePassword({
                new_password: passwordData.newPassword
            });

            setSuccess('Password berhasil diubah!');
            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('❌ Error changing password:', error);
            setError('Gagal mengubah password: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };



    // NEW: Handle view all history
    const handleViewAllHistory = () => {
        console.log('🔄 Navigating to full history page');
        navigate('/mahasiswa/history');
    };

    const formatDateTime = (tanggalPeminjaman, waktuMulai, waktuSelesai) => {
        if (!tanggalPeminjaman) return '27/06/2025 • 10.00 - 12.00';

        try {
            const date = new Date(tanggalPeminjaman);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const startTime = waktuMulai || '10.00';
            const endTime = waktuSelesai || '12.00';

            return `${formattedDate} • ${startTime} - ${endTime}`;
        } catch (error) {
            return '27/06/2025 • 10.00 - 12.00';
        }
    };

    const getItemName = (peminjaman) => {
        if (!peminjaman.details || peminjaman.details.length === 0) {
            return 'Item Peminjaman';
        }

        const detail = peminjaman.details[0];
        const referenceType = detail.reference_type;
        const referenceId = detail.reference_id;

        switch (referenceType) {
            case 'barang':
                return `Barang ID: ${referenceId}`;
            case 'kelas':
                return `Kelas ID: ${referenceId}`;
            case 'absen':
                return `Absen ID: ${referenceId}`;
            default:
                return 'Item Peminjaman';
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    label: 'Menunggu',
                    icon: '⏳'
                };
            case 'disetujui':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    label: 'Disetujui',
                    icon: '✅'
                };
            case 'dipinjam':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    label: 'Dipinjam',
                    icon: '📦'
                };
            case 'dikembalikan':
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    label: 'Selesai',
                    icon: '✔️'
                };
            case 'ditolak':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    label: 'Ditolak',
                    icon: '❌'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    label: status,
                    icon: '📋'
                };
        }
    };

    const getItemIcon = (peminjaman) => {
        if (!peminjaman.details || peminjaman.details.length === 0) {
            return '📦';
        }

        const referenceType = peminjaman.details[0].reference_type;
        switch (referenceType) {
            case 'barang':
                return '📦';
            case 'kelas':
                return '🏢';
            case 'absen':
                return '📚';
            default:
                return '📦';
        }
    };

    return (
        <div className="w-full px-4 lg:px-8 pb-8">
            <div className="max-w-7xl mx-auto">

                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-black font-['Poppins'] mb-2">
                            Settings
                        </h1>
                        <div className="w-full h-px bg-black"></div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="float-right font-bold ml-4 hover:text-red-900"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                        <button
                            onClick={() => setSuccess('')}
                            className="float-right font-bold ml-4 hover:text-green-900"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-red-700 p-6 h-fit">
                            {/* Profile Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-32 h-32 bg-red-300/20 rounded-full flex items-center justify-center mb-4">
                                    <div className="text-4xl text-gray-400">👤</div>
                                </div>

                                {/* User Info */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-semibold text-black font-['Poppins']">
                                        {user?.name || 'Zainab Muchsinin'}
                                    </h2>
                                    <p className="text-lg font-medium text-gray-700">
                                        {user?.nim || 'H071231026'}
                                    </p>
                                    <p className="text-base text-gray-600">
                                        {prodiInfo.nama}
                                    </p>
                                    {prodiInfo.error && (
                                        <p className="text-red-500 text-sm">
                                            {prodiInfo.error}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Angkatan {angkatan}
                                    </p>
                                </div>
                            </div>

                            {/* Change Password Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-black font-['Poppins'] mb-4">
                                    Ganti Kata Sandi
                                </h3>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Kata Sandi Baru..."
                                            className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            required
                                            minLength="6"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Konfirmasi Kata Sandi..."
                                            className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            required
                                            minLength="6"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Peminjaman */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-2xl font-semibold text-black font-['Poppins'] mb-6 pb-4 border-b border-gray-200">
                                Riwayat Peminjaman
                            </h2>

                            {riwayatLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                                    <span className="ml-3 text-gray-600">Memuat riwayat...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {riwayatPeminjaman.length > 0 ? (
                                        riwayatPeminjaman.map((item, index) => {
                                            const statusInfo = getStatusInfo(item.status);
                                            const firstDetail = item.details[0];

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                                                // REMOVED: onClick handler
                                                // REMOVED: cursor-pointer and border-hover classes
                                                >
                                                    <div className="flex items-start space-x-4">
                                                        {/* Item Icon */}
                                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xl">
                                                                {getItemIcon(item)}
                                                            </span>
                                                        </div>

                                                        {/* Item Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h3 className="text-lg font-semibold text-black font-['Poppins'] truncate">
                                                                        {getItemName(item)}
                                                                    </h3>
                                                                    <p className="text-red-700 font-medium mt-1">
                                                                        {formatDateTime(
                                                                            item.tanggal_peminjaman,
                                                                            firstDetail?.waktu_mulai,
                                                                            firstDetail?.waktu_selesai
                                                                        )}
                                                                    </p>
                                                                    {item.notes && (
                                                                        <p className="text-sm text-gray-600 mt-2 italic">
                                                                            "{item.notes}"
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Status Badge */}
                                                                <div className="flex items-center space-x-2 ml-4">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                                        {statusInfo.icon} {statusInfo.label}
                                                                    </span>
                                                                    {/* REMOVED: Click indicator arrow */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl text-gray-300 mb-4">📋</div>
                                            <h3 className="text-xl font-medium text-gray-500 mb-2">
                                                Belum ada riwayat peminjaman
                                            </h3>
                                            <p className="text-gray-400">
                                                Riwayat peminjaman akan muncul di sini
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* View All Button */}
                            {riwayatPeminjaman.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                                    <button
                                        onClick={handleViewAllHistory}
                                        className="text-red-700 font-medium hover:text-red-800 transition-colors hover:underline"
                                    >
                                        Lihat Semua Riwayat →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MahasiswaSettings;