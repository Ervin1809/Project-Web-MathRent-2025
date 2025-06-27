import React from 'react';

const PeminjamanCard = ({
    peminjaman,
    onApprove,
    onReject,
    onReturn,
    getStatusColor,
    getStatusText
}) => {
    const getItemName = (detail) => {
        if (detail.reference_type === 'barang') {
            return detail.barang?.nama || 'Nama Inventaris';
        } else if (detail.reference_type === 'kelas') {
            return `Ruangan ${detail.kelas?.nama_kelas || 'Unknown'}`;
        } else if (detail.reference_type === 'absen') {
            return detail.absen?.nama_matakuliah || 'Absen';
        }
        return 'Unknown Item';
    };

    const getItemIcon = (referenceType) => {
        switch (referenceType) {
            case 'barang': return '📦';
            case 'kelas': return '🏫';
            case 'absen': return '📋';
            default: return '❓';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper function untuk menentukan apakah notes adalah alasan penolakan
    const isRejectionReason = () => {
        return peminjaman.status === 'ditolak' && peminjaman.notes;
    };

    const renderActionButtons = () => {
        if (peminjaman.status === 'pending') {
            return (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onApprove(peminjaman.id)}
                        className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors"
                    >
                        Setujui
                    </button>
                    <button
                        onClick={() => onReject(peminjaman)} // Pass peminjaman object
                        className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl hover:bg-red-800 transition-colors"
                    >
                        Tolak
                    </button>
                </div>
            );
        } else if (peminjaman.status === 'disetujui') {
            return (
                <div className="flex flex-col gap-2">
                    <div className={`px-3 py-2 text-xs font-bold rounded-xl text-center ${getStatusColor(peminjaman.status)}`}>
                        {getStatusText(peminjaman.status)}
                    </div>
                    <button
                        onClick={() => onReturn(peminjaman.id)}
                        className="px-4 py-2 bg-gray-700 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Dikembalikan
                    </button>
                </div>
            );
        } else {
            return (
                <div className={`px-3 py-2 text-xs font-bold rounded-xl text-center ${getStatusColor(peminjaman.status)}`}>
                    {getStatusText(peminjaman.status)}
                </div>
            );
        }
    };

    const primaryDetail = peminjaman.details?.[0];

    return (
        <div className="bg-white rounded-2xl border border-red-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Header dengan status */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-3 border-b border-red-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">
                            {getItemIcon(primaryDetail?.reference_type)}
                        </div>
                        <div className="text-sm font-medium text-red-800">
                            ID: #{peminjaman.id}
                        </div>
                    </div>
                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(peminjaman.status)}`}>
                        {getStatusText(peminjaman.status)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="space-y-4">
                    {/* Items List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Item yang Dipinjam
                        </h4>
                        {peminjaman.details?.map((detail, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-red-400">
                                <h3 className="text-lg font-semibold text-black mb-1">
                                    {getItemName(detail)}
                                </h3>
                                
                                {/* Item Details */}
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                    {/* Quantity for barang */}
                                    {detail.reference_type === 'barang' && detail.jumlah && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            📦 {detail.jumlah} {detail.barang?.satuan || 'unit'}
                                        </span>
                                    )}
                                    
                                    {/* Time for kelas */}
                                    {detail.reference_type === 'kelas' && detail.waktu_mulai && detail.waktu_selesai && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                            🕐 {formatTime(detail.waktu_mulai)} - {formatTime(detail.waktu_selesai)}
                                        </span>
                                    )}
                                    
                                    {/* Location for kelas */}
                                    {detail.reference_type === 'kelas' && detail.kelas?.gedung && (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                            📍 {detail.kelas.gedung} {detail.kelas.lantai ? `Lt.${detail.kelas.lantai}` : ''}
                                        </span>
                                    )}
                                    
                                    {/* Info for absen */}
                                    {detail.reference_type === 'absen' && detail.absen?.jurusan && (
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                            🎓 {detail.absen.jurusan}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* User and Date Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        {/* User Info */}
                        <div className="space-y-1">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Peminjam
                            </h5>
                            <p className="text-sm font-medium text-black">
                                {peminjaman.user_name}
                            </p>
                            <p className="text-xs text-gray-600">
                                {peminjaman.user_nim}
                            </p>
                        </div>

                        {/* Date Info */}
                        <div className="space-y-1">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Tanggal Peminjaman
                            </h5>
                            <p className="text-sm font-medium text-black">
                                {formatDate(peminjaman.tanggal_peminjaman)}
                            </p>
                        </div>
                    </div>

                    {/* Notes / Rejection Reason */}
                    {peminjaman.notes && (
                        <div className="pt-3 border-t border-gray-200">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                {isRejectionReason() ? '❌ Alasan Penolakan' : '📝 Catatan'}
                            </h5>
                            <div className={`text-sm p-3 rounded-lg border ${
                                isRejectionReason() 
                                    ? 'bg-red-50 text-red-800 border-red-200' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                                {isRejectionReason() && (
                                    <div className="flex items-start gap-2 mb-1">
                                        <span className="text-red-600 font-bold">⚠️</span>
                                        <span className="font-medium">Peminjaman Ditolak:</span>
                                    </div>
                                )}
                                <div className={isRejectionReason() ? 'ml-6' : ''}>
                                    {peminjaman.notes}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    {/* Status Info */}
                    <div className="flex-1">
                        {peminjaman.status === 'disetujui' && peminjaman.approver && (
                            <p className="text-xs text-gray-500">
                                Disetujui oleh: <span className="font-medium">{peminjaman.approver.name}</span>
                            </p>
                        )}
                        {peminjaman.status === 'ditolak' && (
                            <p className="text-xs text-red-600 font-medium">
                                ❌ Peminjaman ditolak
                            </p>
                        )}
                        {peminjaman.status === 'dikembalikan' && (
                            <p className="text-xs text-gray-500 font-medium">
                                ✅ Barang telah dikembalikan
                            </p>
                        )}
                        {peminjaman.status === 'pending' && (
                            <p className="text-xs text-blue-600 font-medium">
                                ⏳ Menunggu persetujuan
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 ml-4">
                        {renderActionButtons()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PeminjamanCard;