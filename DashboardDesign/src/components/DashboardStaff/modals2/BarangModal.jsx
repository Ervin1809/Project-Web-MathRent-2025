import React, { useState } from 'react';
import { barangAPI } from '../../../services/api';

const BarangModal = ({ 
    isOpen, 
    onClose, 
    mode, 
    item, 
    onSuccess 
}) => {
    const [formData, setFormData] = useState({
        nama: item?.nama || '',
        satuan: item?.satuan || '',
        stok: item?.stok || 0,
        lokasi: item?.lokasi || 'Departemen Matematika'
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
                response = await barangAPI.create(formData);
            } else {
                response = await barangAPI.update(item.id, formData);
            }
            
            console.log('✅ Barang submit response:', response);
            onSuccess(`Barang berhasil ${mode === 'create' ? 'ditambahkan' : 'diupdate'}`);
            onClose();
            
        } catch (error) {
            console.error(`❌ Error ${mode} barang:`, error);
            setError(`Gagal ${mode === 'create' ? 'menambahkan' : 'mengupdate'} barang: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {mode === 'create' ? 'Tambah Barang' : 'Edit Barang'}
                </h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Barang <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: Proyektor Epson"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Satuan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="satuan"
                                value={formData.satuan}
                                onChange={handleInputChange}
                                required
                                placeholder="unit, pcs, kg, dll"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stok <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stok"
                                value={formData.stok}
                                onChange={handleInputChange}
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lokasi
                        </label>
                        <input
                            type="text"
                            name="lokasi"
                            value={formData.lokasi}
                            onChange={handleInputChange}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lokasi otomatis diatur ke Departemen Matematika</p>
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

export default BarangModal;