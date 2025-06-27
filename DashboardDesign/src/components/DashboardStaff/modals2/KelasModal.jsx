import React, { useState } from 'react';
import { kelasAPI } from '../../../services/api';

const KelasModal = ({ 
    isOpen, 
    onClose, 
    mode, 
    item, 
    onSuccess 
}) => {
    const [formData, setFormData] = useState({
        nama_kelas: item?.nama_kelas || '',
        gedung: item?.gedung || '',
        lantai: item?.lantai || 0,
        kapasitas: item?.kapasitas || 0,
        fasilitas: item?.fasilitas || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError('');
            
            let response;
            if (mode === 'create') {
                response = await kelasAPI.create(formData);
            } else {
                response = await kelasAPI.update(item.id, formData);
            }
            
            console.log('✅ Kelas submit response:', response);
            onSuccess(`Kelas berhasil ${mode === 'create' ? 'ditambahkan' : 'diupdate'}`);
            onClose();
            
        } catch (error) {
            console.error(`❌ Error ${mode} kelas:`, error);
            setError(`Gagal ${mode === 'create' ? 'menambahkan' : 'mengupdate'} kelas: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {mode === 'create' ? 'Tambah Kelas' : 'Edit Kelas'}
                </h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Kelas <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama_kelas"
                            value={formData.nama_kelas}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: 204"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gedung <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="gedung"
                                value={formData.gedung}
                                onChange={handleInputChange}
                                required
                                placeholder="Contoh: Gedung A"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lantai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="lantai"
                                value={formData.lantai}
                                onChange={handleInputChange}
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kapasitas <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="kapasitas"
                            value={formData.kapasitas}
                            onChange={handleInputChange}
                            min="1"
                            required
                            placeholder="Jumlah mahasiswa maksimal"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fasilitas
                        </label>
                        <textarea
                            name="fasilitas"
                            value={formData.fasilitas}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Contoh: AC, Proyektor, Whiteboard"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {loading 
                                ? 'Menyimpan...' 
                                : (mode === 'create' ? 'Tambah' : 'Update')
                            }
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KelasModal;