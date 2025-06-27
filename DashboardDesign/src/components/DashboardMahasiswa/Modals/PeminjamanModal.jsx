import React, { useState } from 'react';
import { peminjamanService } from '../../../services/peminjamanService';

const PeminjamanModal = ({ isOpen, onClose, item, bookingData = null, absenCourse = null }) => {
    const [formData, setFormData] = useState({
        tanggalPeminjaman: new Date().toISOString().split('T')[0],
        tanggalPengembalian: '', // Keep for UI, but won't send to backend
        jumlah: 1,
        keperluan: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-set tanggal peminjaman untuk kelas
    React.useEffect(() => {
        if (item?.type === 'ruangan' && bookingData?.tanggal) {
            setFormData(prev => ({
                ...prev,
                tanggalPeminjaman: bookingData.tanggal
            }));
        }
    }, [item, bookingData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.keperluan.trim()) {
            setError('Keperluan harus diisi');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let response;
            
            if (item.type === 'inventaris') {
                // Peminjaman barang - removed tanggal_pengembalian
                response = await peminjamanService.createBarangPeminjaman(
                    item.id,
                    formData.jumlah,
                    formData.tanggalPeminjaman,
                    formData.keperluan
                );
            } else if (item.type === 'ruangan') {
                // Peminjaman kelas
                response = await peminjamanService.createKelasPeminjaman(
                    item.id,
                    bookingData.tanggal,
                    bookingData.waktu_mulai,
                    bookingData.waktu_selesai,
                    formData.keperluan
                );
            } else if (item.type === 'absen-group' && absenCourse) {
                // Peminjaman absen - removed tanggal_pengembalian
                response = await peminjamanService.createAbsenPeminjaman(
                    absenCourse.id,
                    formData.tanggalPeminjaman,
                    formData.keperluan
                );
            }

            console.log('✅ Peminjaman created:', response.data);
            
            alert('Peminjaman berhasil diajukan! Silakan tunggu persetujuan admin.');
            onClose();
            
        } catch (error) {
            console.error('❌ Error creating peminjaman:', error);
            console.error('❌ Error response:', error.response?.data);
            setError(
                error.response?.data?.detail || 
                error.response?.data?.message ||
                'Gagal mengajukan peminjaman. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isKelas = item?.type === 'ruangan';
    const isBarang = item?.type === 'inventaris';
    const isAbsen = item?.type === 'absen-group';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-red-700 text-white px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold font-poppins">
                            Ajukan Peminjaman
                        </h2>
                        <button 
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Item Info */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-800 font-poppins mb-2">
                            {isKelas ? 'Detail Booking Kelas:' : 
                             isAbsen ? 'Detail Absen:' : 'Detail Item:'}
                        </h3>
                        
                        {isAbsen && absenCourse ? (
                            <div className="text-sm text-gray-600 font-poppins">
                                <p><strong>Mata Kuliah:</strong> {absenCourse.name}</p>
                                <p><strong>Kelas:</strong> {absenCourse.kelas}</p>
                                <p><strong>Dosen:</strong> {absenCourse.dosen}</p>
                                <p><strong>Semester:</strong> {absenCourse.semester}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 font-poppins">{item?.name}</p>
                        )}
                        
                        {isKelas && bookingData && (
                            <div className="mt-2 text-sm text-gray-600 font-poppins">
                                <p>📅 Tanggal: {bookingData.tanggal}</p>
                                <p>⏰ Waktu: {bookingData.waktu_mulai} - {bookingData.waktu_selesai}</p>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Tanggal Peminjaman */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                Tanggal Peminjaman:
                            </label>
                            <input
                                type="date"
                                name="tanggalPeminjaman"
                                value={formData.tanggalPeminjaman}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={isKelas} // Disabled for kelas because it's auto-set
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-poppins focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                                required
                            />
                        </div>

                        {/* Jumlah - Only for barang */}
                        {isBarang && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                    Jumlah:
                                </label>
                                <input
                                    type="number"
                                    name="jumlah"
                                    value={formData.jumlah}
                                    onChange={handleInputChange}
                                    min="1"
                                    max={item?.maxStock || 1}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-poppins focus:ring-2 focus:ring-red-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1 font-poppins">
                                    Maksimal: {item?.maxStock || 1}
                                </p>
                            </div>
                        )}

                        {/* Keperluan/Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                Keperluan: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="keperluan"
                                value={formData.keperluan}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder={`Jelaskan keperluan peminjaman ${isAbsen ? 'absen' : isKelas ? 'kelas' : 'barang'}...`}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-poppins focus:ring-2 focus:ring-red-500 resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm font-poppins">
                            💡 <strong>Info:</strong> Peminjaman akan masuk ke status "Menunggu Persetujuan" dan perlu disetujui oleh admin terlebih dahulu.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm font-poppins">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold font-poppins hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-red-700 text-white rounded-lg font-semibold font-poppins hover:bg-red-800 disabled:opacity-50"
                        >
                            {loading ? 'Mengirim...' : 'Ajukan Peminjaman'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PeminjamanModal;