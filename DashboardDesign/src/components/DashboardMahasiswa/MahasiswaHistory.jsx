import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { peminjamanAPI } from '../../services/api';

const MahasiswaHistory = () => {
    const { user } = useAuth();
    const [riwayatPeminjaman, setRiwayatPeminjaman] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const perPage = 10;

    useEffect(() => {
        fetchAllRiwayat();
    }, [currentPage]);

    const fetchAllRiwayat = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await peminjamanAPI.getMy();
            console.log('🔄 Full Riwayat Response:', response.data);
            
            const riwayatData = Array.isArray(response.data) ? response.data : [];
            
            // Since API doesn't seem to support pagination, we'll do client-side pagination
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedData = riwayatData.slice(startIndex, endIndex);
            
            setRiwayatPeminjaman(paginatedData);
            setTotalItems(riwayatData.length);
            setTotalPages(Math.ceil(riwayatData.length / perPage));
            
        } catch (error) {
            console.error('❌ Error fetching full riwayat:', error);
            setError('Gagal memuat riwayat peminjaman');
            setRiwayatPeminjaman([]);
        } finally {
            setLoading(false);
        }
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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="w-full px-4 lg:px-8 pb-8 p-10">
            <div className="max-w-5xl mx-auto">
                
                <a href="/mahasiswa/settings" className='items-start flex text-red-600'>Back</a>
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-black font-['Poppins'] mb-2">
                        Riwayat Peminjaman
                    </h1>
                    <div className="w-full h-px bg-black mb-4"></div>
                    <p className="text-gray-600">
                        Semua riwayat peminjaman Anda - Total: {totalItems} peminjaman
                    </p>
                </div>

                {/* Error Message */}
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

                {/* History Content */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                            <span className="ml-3 text-gray-600">Memuat riwayat...</span>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {riwayatPeminjaman.length > 0 ? (
                                    riwayatPeminjaman.map((item, index) => {
                                        const statusInfo = getStatusInfo(item.status);
                                        const firstDetail = item.details[0];
                                        
                                        return (
                                            <div 
                                                key={item.id} 
                                                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
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
                                                                <h3 className="text-lg font-semibold text-black font-['Poppins']">
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
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    ID Peminjaman: {item.id}
                                                                </p>
                                                            </div>
                                                            
                                                            {/* Status Badge */}
                                                            <div className="flex items-center space-x-2 ml-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                                    {statusInfo.icon} {statusInfo.label}
                                                                </span>
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

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalItems)} dari {totalItems} peminjaman
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const startPage = Math.max(1, currentPage - 2);
                                            const pageNumber = startPage + i;
                                            if (pageNumber > totalPages) return null;
                                            
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-1 text-sm border rounded-md ${
                                                        currentPage === pageNumber
                                                            ? 'bg-red-600 text-white border-red-600'
                                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MahasiswaHistory;