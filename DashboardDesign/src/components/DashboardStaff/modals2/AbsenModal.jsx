import React, { useState } from 'react';
import { absenAPI } from '../../../services/api';

const AbsenModal = ({ 
    isOpen, 
    onClose, 
    mode, 
    item, 
    onSuccess 
}) => {
    const [formData, setFormData] = useState({
        nama_matakuliah: item?.nama_matakuliah || '',
        kelas: item?.kelas || '',
        semester: item?.semester || 1,
        dosen: item?.dosen || '',
        jurusan: item?.jurusan || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 1 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError('');
            
            let response;
            if (mode === 'create') {
                response = await absenAPI.create(formData);
            } else {
                response = await absenAPI.update(item.id, formData);
            }
            
            console.log('✅ Absen submit response:', response);
            onSuccess(`Absen berhasil ${mode === 'create' ? 'ditambahkan' : 'diupdate'}`);
            onClose();
            
        } catch (error) {
            console.error(`❌ Error ${mode} absen:`, error);
            setError(`Gagal ${mode === 'create' ? 'menambahkan' : 'mengupdate'} absen: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {mode === 'create' ? 'Tambah Absen' : 'Edit Absen'}
                </h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Mata Kuliah <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama_matakuliah"
                            value={formData.nama_matakuliah}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: Kalkulus II"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kelas <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="kelas"
                                value={formData.kelas}
                                onChange={handleInputChange}
                                required
                                placeholder="A, B, C, dll"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Semester <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {[1,2,3,4,5,6,7,8].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosen <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="dosen"
                            value={formData.dosen}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: Dr. Ahmad Suryana, M.Si"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jurusan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="jurusan"
                            value={formData.jurusan}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: Matematika"
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

export default AbsenModal;