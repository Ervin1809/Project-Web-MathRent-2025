import React, { useState,useEffect  } from 'react';
import { peminjamanAPI } from '../../services/api';

const StaffRiwayat = ({ searchQuery = '' }) => {
    // State untuk data dan filter
    const [riwayatList, setRiwayatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const perPage = 20;

    // State untuk filter
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    useEffect(() => {
        fetchRiwayatData();
    }, [currentPage, statusFilter, dateFromFilter, dateToFilter, searchQuery]);

    const fetchRiwayatData = async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // delay 1 detik
        try {
            setLoading(true);
            setError('');

            const params = {
                page: currentPage,
                per_page: perPage,
            };

            // Add filters if they exist
            if (statusFilter) params.status = statusFilter;
            if (dateFromFilter) params.tanggal_mulai = dateFromFilter;
            if (dateToFilter) params.tanggal_akhir = dateToFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const response = await peminjamanAPI.getHistoryPeminjaman(params);
            
            console.log('🔄 History Response:', response.data);

            const data = response.data.data;
            setRiwayatList(data.items || []);
            
            // Set pagination info
            const pagination = data.pagination;
            setTotalPages(pagination.last_page);
            setTotalItems(pagination.total);
            setCurrentPage(pagination.current_page);

        } catch (error) {
            console.error('❌ Error fetching riwayat:', error);
            setError('Gagal memuat riwayat peminjaman. Silakan refresh halaman.');
        } finally {
            setLoading(false);
        }
    };

    // Format tanggal untuk tampilan
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get items summary untuk setiap peminjaman
    const getItemsSummary = (details) => {
        if (!details || details.length === 0) return 'Tidak ada item';
        
        return details.map(detail => {
            if (detail.reference_type === 'barang') {
                const nama = detail.barang?.nama || 'Barang Unknown';
                const jumlah = detail.jumlah || 0;
                return `${nama} (${jumlah})`;
            } else if (detail.reference_type === 'kelas') {
                return `Ruangan ${detail.kelas?.nama_kelas || 'Unknown'}`;
            } else if (detail.reference_type === 'absen') {
                return detail.absen?.nama_matakuliah || 'Absen Unknown';
            }
            return 'Unknown Item';
        }).join(', ');
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending' },
            'disetujui': { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
            'ditolak': { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
            'dikembalikan': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dikembalikan' }
        };

        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setStatusFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setCurrentPage(1);
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="text-white font-['Poppins'] text-xl">Memuat Riwayat Aktivitas...</p>
                </div>
            </div>
        );
    }   

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h1 className="text-6xl font-bold text-white font-['Inter'] mb-4">
                    Riwayat Aktivitas
                </h1>
                <p className="text-white text-lg font-['Poppins']">
                    Total: {totalItems} Riwayat Peminjaman
                </p>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Filter Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="ditolak">Ditolak</option>
                            <option value="dikembalikan">Dikembalikan</option>
                        </select>
                    </div>

                    {/* Date From Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            value={dateFromFilter}
                            onChange={(e) => setDateFromFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Date To Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            value={dateToFilter}
                            onChange={(e) => setDateToFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Clear Button */}
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Clear Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                    {error}
                    <button
                        onClick={() => setError('')}
                        className="float-right font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-red-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Peminjam
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Barang/Item Pinjaman
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Tanggal Peminjaman
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {riwayatList.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {(currentPage - 1) * perPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.user_name || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.user_nim || 'No NIM'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate" title={getItemsSummary(item.details)}>
                                                    {getItemsSummary(item.details)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(item.tanggal_peminjaman)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalItems)} dari {totalItems} data
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    
                                    {/* Page Numbers */}
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

                        {/* Empty State */}
                        {riwayatList.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-4">
                                    Tidak ada data riwayat peminjaman
                                </div>
                                <button
                                    onClick={fetchRiwayatData}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Refresh Data
                                </button>
                            </div>
                        )}
                    </>
            </div>
        </div>
    );
};

export default StaffRiwayat;