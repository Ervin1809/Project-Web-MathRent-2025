import React, { useState } from 'react';

const RejectModal = ({ isOpen, onClose, onSubmit, peminjaman, loading }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [selectedReason, setSelectedReason] = useState('');

    const predefinedReasons = [
        'Stok barang tidak mencukupi',
        'Barang sedang dalam perbaikan',
        'Ruangan sudah dibooking orang lain',
        'Lainnya'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalReason = selectedReason === 'Lainnya' ? rejectReason : selectedReason;
        
        if (!finalReason.trim()) {
            alert('Mohon berikan alasan penolakan');
            return;
        }

        onSubmit(peminjaman.id, finalReason);
        
        // Reset form
        setRejectReason('');
        setSelectedReason('');
    };

    const handleClose = () => {
        setRejectReason('');
        setSelectedReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-red-600 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Tolak Peminjaman</h3>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-white hover:bg-red-700 rounded-full p-1 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Peminjaman Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Detail Peminjaman</h4>
                        <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">ID:</span> #{peminjaman.id}</p>
                            <p className="text-sm"><span className="font-medium">Peminjam:</span> {peminjaman.user_name}</p>
                            <p className="text-sm"><span className="font-medium">Items:</span></p>
                            <ul className="ml-4 text-sm text-gray-600">
                                {peminjaman.details?.map((detail, index) => (
                                    <li key={index} className="list-disc">
                                        {detail.reference_type === 'barang' && detail.barang?.nama}
                                        {detail.reference_type === 'kelas' && `Ruangan ${detail.kelas?.nama_kelas}`}
                                        {detail.reference_type === 'absen' && detail.absen?.nama_matakuliah}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Predefined Reasons */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Pilih alasan penolakan:
                            </label>
                            <div className="space-y-2">
                                {predefinedReasons.map((reason, index) => (
                                    <label key={index} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="rejectReason"
                                            value={reason}
                                            checked={selectedReason === reason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="mr-3 text-red-600 focus:ring-red-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm text-gray-700">{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Custom Reason Input */}
                        {selectedReason === 'Lainnya' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan lainnya:
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Tuliskan alasan penolakan..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                    rows="3"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedReason}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menolak...
                                    </>
                                ) : (
                                    'Tolak Peminjaman'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;