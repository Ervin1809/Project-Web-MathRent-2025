import React, { useState, useEffect } from 'react';
import PeminjamanCard from './ItemComponent/PeminjamanCard';
import RejectModal from './modals2/RejectModal';
import { peminjamanAPI } from '../../services/api';

const StaffDashboard = ({ searchQuery = '' }) => {
    // State untuk filter dan data
    const [activeTab, setActiveTab] = useState('semua');
    const [peminjamanList, setPeminjamanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State untuk reject modal
    const [rejectModal, setRejectModal] = useState({
        isOpen: false,
        peminjaman: null,
        loading: false
    });

    useEffect(() => {
        fetchTodayData();
    }, [activeTab]);

    const fetchTodayData = async () => {
        setLoading(true);
        try {
            setError('');
            await new Promise(resolve => setTimeout(resolve, 300));
            const response = await peminjamanAPI.getTodayPeminjaman(activeTab);
            console.log('🔄 Today Peminjaman Response:', response.data);

            const peminjamanData = response.data || [];
            setPeminjamanList(Array.isArray(peminjamanData) ? peminjamanData : []);

            console.log('✅ Today peminjaman loaded:', peminjamanData);

        } catch (error) {
            console.error('❌ Error fetching today data:', error);
            setError('Gagal memuat data peminjaman hari ini. Silakan refresh halaman.');
        } finally {
            setLoading(false);
        }
    };

    const checkItemAvailability = (peminjaman) => {
        const conflicts = [];

        if (peminjaman.details) {
            peminjaman.details.forEach(detail => {
                const conflictingPeminjaman = peminjamanList.filter(p =>
                    p.id !== peminjaman.id &&
                    p.status === 'disetujui' &&
                    p.details?.some(pd =>
                        pd.reference_type === detail.reference_type &&
                        pd.reference_id === detail.reference_id
                    )
                );

                if (conflictingPeminjaman.length > 0) {
                    if (detail.reference_type === 'barang') {
                        const totalUsedStock = conflictingPeminjaman.reduce((total, cp) => {
                            const usedDetail = cp.details.find(cpd =>
                                cpd.reference_type === detail.reference_type &&
                                cpd.reference_id === detail.reference_id
                            );
                            return total + (usedDetail?.jumlah || 0);
                        }, 0);

                        const requestedStock = detail.jumlah || 0;
                        const maxStock = detail.barang?.stok || 0;

                        if (totalUsedStock + requestedStock > maxStock) {
                            conflicts.push({
                                type: 'barang',
                                name: detail.barang?.nama || 'Unknown',
                                available: maxStock - totalUsedStock,
                                requested: requestedStock
                            });
                        }
                    } else if (detail.reference_type === 'kelas') {
                        const hasTimeConflict = conflictingPeminjaman.some(cp => {
                            const usedDetail = cp.details.find(cpd =>
                                cpd.reference_type === detail.reference_type &&
                                cpd.reference_id === detail.reference_id
                            );

                            if (usedDetail && usedDetail.waktu_mulai && usedDetail.waktu_selesai) {
                                const existingStart = new Date(usedDetail.waktu_mulai);
                                const existingEnd = new Date(usedDetail.waktu_selesai);
                                const newStart = new Date(detail.waktu_mulai);
                                const newEnd = new Date(detail.waktu_selesai);

                                return (newStart < existingEnd && newEnd > existingStart);
                            }
                            return false;
                        });

                        if (hasTimeConflict) {
                            conflicts.push({
                                type: 'kelas',
                                name: detail.kelas?.nama_kelas || 'Unknown',
                                message: 'Waktu bentrok dengan peminjaman lain'
                            });
                        }
                    } else if (detail.reference_type === 'absen') {
                        conflicts.push({
                            type: 'absen',
                            name: detail.absen?.nama_matakuliah || 'Unknown',
                            message: 'Sudah dipinjam oleh orang lain'
                        });
                    }
                }
            });
        }

        return conflicts;
    };

    const handleApprove = async (peminjamanId) => {
        try {
            const peminjaman = peminjamanList.find(p => p.id === peminjamanId);
            if (!peminjaman) {
                setError('Peminjaman tidak ditemukan');
                return;
            }

            const conflicts = checkItemAvailability(peminjaman);
            if (conflicts.length > 0) {
                const conflictMessages = conflicts.map(c => {
                    if (c.type === 'barang') {
                        return `${c.name}: Stok tidak mencukupi (tersedia: ${c.available}, diminta: ${c.requested})`;
                    } else {
                        return `${c.name}: ${c.message}`;
                    }
                });

                setError(`Tidak dapat disetujui:\n${conflictMessages.join('\n')}`);
                return;
            }

            await peminjamanAPI.approve(peminjamanId, { status: 'disetujui' });

            console.log('✅ Peminjaman approved:', peminjamanId);
            setSuccess('Peminjaman berhasil disetujui');

            fetchTodayData();
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('❌ Error approving peminjaman:', error);
            setError('Gagal menyetujui peminjaman');
        }
    };

    const handleRejectClick = (peminjaman) => {
        setRejectModal({
            isOpen: true,
            peminjaman: peminjaman,
            loading: false
        });
    };

    const handleRejectWithReason = async (peminjamanId, reason) => {
        try {
            setRejectModal(prev => ({ ...prev, loading: true }));

            const requestData = {
                status: 'ditolak',
                notes: reason
            };

            console.log('🔄 Sending reject data:', requestData);

            const response = await peminjamanAPI.approve(peminjamanId, requestData);

            console.log('✅ Reject response:', response);

            setSuccess(`Peminjaman berhasil ditolak. Alasan: ${reason}`);

            setRejectModal({ isOpen: false, peminjaman: null, loading: false });
            fetchTodayData();
            setTimeout(() => setSuccess(''), 5000);

        } catch (error) {
            console.error('❌ Error rejecting peminjaman:', error);
            console.error('❌ Error details:', error.response?.data);
            setError(`Gagal menolak peminjaman: ${error.response?.data?.message || error.message}`);
            setRejectModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleCloseRejectModal = () => {
        if (!rejectModal.loading) {
            setRejectModal({ isOpen: false, peminjaman: null, loading: false });
        }
    };

    const handleReturn = async (peminjamanId) => {
        try {
            await peminjamanAPI.approve(peminjamanId, { status: 'dikembalikan' });

            console.log('✅ Peminjaman returned:', peminjamanId);
            setSuccess('Barang berhasil dikembalikan');

            fetchTodayData();
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('❌ Error returning peminjaman:', error);
            setError('Gagal mengembalikan barang');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-700 text-white';
            case 'disetujui':
                return 'bg-lime-700 text-white';
            case 'ditolak':
                return 'bg-red-700 text-white';
            case 'dikembalikan':
                return 'bg-gray-700 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'disetujui':
                return 'Disetujui';
            case 'ditolak':
                return 'Ditolak';
            case 'dikembalikan':
                return 'Dikembalikan';
            default:
                return status;
        }
    };

    // Filter peminjaman berdasarkan search dan tab
    const filteredPeminjaman = peminjamanList.filter(item => {
        const matchesSearch = item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user_nim?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'semua') return matchesSearch;
        if (activeTab === 'inventaris') {
            return matchesSearch && item.details?.some(detail => detail.reference_type === 'barang');
        }
        if (activeTab === 'ruangan') {
            return matchesSearch && item.details?.some(detail => detail.reference_type === 'kelas');
        }
        if (activeTab === 'absen') {
            return matchesSearch && item.details?.some(detail => detail.reference_type === 'absen');
        }
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="text-white font-['Poppins'] text-xl">Memuat daftar peminjaman...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-bold text-white font-['Inter']">
                    Daftar Peminjaman Hari Ini
                </h1>
                <p className="text-white text-xl font-['Poppins'] mt-4">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('semua')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${activeTab === 'semua'
                        ? 'bg-red-700 text-white'
                        : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                        }`}
                >
                    Semua 
                </button>
                <button
                    onClick={() => setActiveTab('inventaris')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${activeTab === 'inventaris'
                        ? 'bg-red-700 text-white'
                        : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                        }`}
                >
                    Inventaris ({peminjamanList.filter(item => item.details?.some(detail => detail.reference_type === 'barang')).length})
                </button>
                <button
                    onClick={() => setActiveTab('ruangan')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${activeTab === 'ruangan'
                        ? 'bg-red-700 text-white'
                        : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                        }`}
                >
                    Ruangan ({peminjamanList.filter(item => item.details?.some(detail => detail.reference_type === 'kelas')).length})
                </button>
                <button
                    onClick={() => setActiveTab('absen')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${activeTab === 'absen'
                        ? 'bg-red-700 text-white'
                        : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                        }`}
                >
                    Absen ({peminjamanList.filter(item => item.details?.some(detail => detail.reference_type === 'absen')).length})
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4 font-['Poppins']">
                    <pre className="whitespace-pre-wrap">{error}</pre>
                    <button
                        onClick={() => setError('')}
                        className="float-right font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-500 text-white p-4 rounded-lg mb-4 font-['Poppins']">
                    {success}
                    <button
                        onClick={() => setSuccess('')}
                        className="float-right font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPeminjaman.map((peminjaman) => (
                    <PeminjamanCard
                        key={peminjaman.id}
                        peminjaman={peminjaman}
                        onApprove={handleApprove}
                        onReject={handleRejectClick}
                        onReturn={handleReturn}
                        getStatusColor={getStatusColor}
                        getStatusText={getStatusText}
                    />
                ))}
            </div>

            {/* No Results */}
            {filteredPeminjaman.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-2xl text-white font-['Poppins'] mb-4">
                        {searchQuery 
                            ? 'Tidak ada hasil pencarian' 
                            : 'Tidak ada peminjaman hari ini'
                        }
                    </div>
                    <button
                        onClick={fetchTodayData}
                        className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors font-['Poppins']"
                    >
                        Refresh Data
                    </button>
                </div>
            )}

            {/* Reject Modal */}
            <RejectModal
                isOpen={rejectModal.isOpen}
                onClose={handleCloseRejectModal}
                onSubmit={handleRejectWithReason}
                peminjaman={rejectModal.peminjaman}
                loading={rejectModal.loading}
            />
        </div>
    );
};

export default StaffDashboard;