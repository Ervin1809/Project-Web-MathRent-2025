import React, { useState, useEffect } from 'react';
import { barangAPI, kelasAPI, absenAPI } from '../../services/api';

// Import modal components
import BarangModal from './modals2/BarangModal';
import KelasModal from './modals2/KelasModal';
import AbsenModal from './modals2/AbsenModal';

const StaffDataBarang = ({ searchQuery = '' }) => {
    // State
    const [barangList, setBarangList] = useState([]);
    const [kelasList, setKelasList] = useState([]);
    const [absenList, setAbsenList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('barang');
    const [pagination, setPagination] = useState({
        barang: { currentPage: 1, totalPages: 1, totalItems: 0 },
        kelas: { currentPage: 1, totalPages: 1, totalItems: 0 },
        absen: { currentPage: 1, totalPages: 1, totalItems: 0 }
    });
    const [filters, setFilters] = useState({
        barang: { status: '', search: '' },
        kelas: {  search: '' },
        absen: { semester: '', jurusan: '', search: '' }
    });
    const perPage = 20;

    // State untuk modal
    const [modal, setModal] = useState({
        isOpen: false,
        mode: 'create',
        type: 'barang',
        item: null
    });

    // State untuk confirm delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Effects
    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchDataForActiveTab();
    }, [activeTab, pagination[activeTab].currentPage, filters[activeTab], searchQuery]);

    // Fetch functions
    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchBarangData(),
                fetchKelasData(),
                fetchAbsenData()
            ]);
        } catch (error) {
            console.error('❌ Error fetching all data:', error);
            setError('Gagal memuat data inventaris');
        } finally {
            setLoading(false);
        }
    };

    const fetchDataForActiveTab = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'barang':
                    await fetchBarangData();
                    break;
                case 'kelas':
                    await fetchKelasData();
                    break;
                case 'absen':
                    await fetchAbsenData();
                    break;
            }
        } catch (error) {
            console.error(`❌ Error fetching ${activeTab} data:`, error);
            setError(`Gagal memuat data ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchBarangData = async () => {
        try {
            const params = {
                page: pagination.barang.currentPage,
                per_page: perPage,
            };

            if (filters.barang.status) params.status = filters.barang.status;
            
            const searchTerm = searchQuery || filters.barang.search;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const response = await barangAPI.getAll(params);
            console.log('🔄 Barang Response:', response.data);

            const data = response.data.data || response.data;
            setBarangList(data.items || data || []);
            
            if (data.pagination) {
                setPagination(prev => ({
                    ...prev,
                    barang: {
                        currentPage: data.pagination.current_page,
                        totalPages: data.pagination.last_page,
                        totalItems: data.pagination.total
                    }
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching barang:', error);
            throw error;
        }
    };

    const fetchKelasData = async () => {
        try {
            const params = {
                page: pagination.kelas.currentPage,
                per_page: perPage,
            };

            if (filters.kelas.status) params.status = filters.kelas.status;
            
            const searchTerm = searchQuery || filters.kelas.search;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const response = await kelasAPI.getAll(params);
            console.log('🔄 Kelas Response:', response.data);

            const data = response.data.data || response.data;
            setKelasList(data.items || data || []);
            
            if (data.pagination) {
                setPagination(prev => ({
                    ...prev,
                    kelas: {
                        currentPage: data.pagination.current_page,
                        totalPages: data.pagination.last_page,
                        totalItems: data.pagination.total
                    }
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching kelas:', error);
            throw error;
        }
    };

    const fetchAbsenData = async () => {
        try {
            const currentPage = pagination.absen.currentPage;
            const semester = filters.absen.semester || null;
            const jurusan = filters.absen.jurusan || null;

            const response = await absenAPI.getAll(currentPage, perPage, semester, jurusan);
            console.log('🔄 Absen Response:', response.data);

            const data = response.data.data || response.data;
            let absenData = data.items || data || [];

            const searchTerm = searchQuery || filters.absen.search;
            if (searchTerm.trim()) {
                absenData = absenData.filter(item => 
                    item.nama_matakuliah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.dosen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.kelas?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setAbsenList(absenData);
            
            if (data.pagination) {
                setPagination(prev => ({
                    ...prev,
                    absen: {
                        currentPage: data.pagination.current_page,
                        totalPages: data.pagination.last_page,
                        totalItems: data.pagination.total
                    }
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching absen:', error);
            throw error;
        }
    };

    // Helper functions
    const getCurrentData = () => {
        switch (activeTab) {
            case 'barang':
                return barangList;
            case 'kelas':
                return kelasList;
            case 'absen':
                return absenList;
            default:
                return [];
        }
    };

    const getCurrentPagination = () => {
        return pagination[activeTab];
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [filterType]: value
            }
        }));
        
        setPagination(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                currentPage: 1
            }
        }));
    };

    const clearFilters = () => {
        setFilters(prev => ({
            ...prev,
            [activeTab]: activeTab === 'absen' 
                ? { semester: '', jurusan: '', search: '' }
                : { status: '', search: '' }
        }));
        
        setPagination(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                currentPage: 1
            }
        }));
    };

    const handlePageChange = (newPage) => {
        const currentPag = getCurrentPagination();
        if (newPage >= 1 && newPage <= currentPag.totalPages) {
            setPagination(prev => ({
                ...prev,
                [activeTab]: {
                    ...prev[activeTab],
                    currentPage: newPage
                }
            }));
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'tersedia': { bg: 'bg-green-100', text: 'text-green-800', label: 'Tersedia' },
            'dipinjam': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Dipinjam' },
            'rusak': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rusak' },
            'hilang': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Hilang' }
        };

        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Modal management
    const handleCreate = () => {
        setModal({
            isOpen: true,
            mode: 'create',
            type: activeTab,
            item: null
        });
    };

    const handleEdit = (item) => {
        setModal({
            isOpen: true,
            mode: 'edit',
            type: activeTab,
            item: item
        });
    };

    const handleModalClose = () => {
        setModal({
            isOpen: false,
            mode: 'create',
            type: 'barang',
            item: null
        });
    };

    const handleModalSuccess = (message) => {
        setSuccess(message);
        fetchDataForActiveTab();
        setTimeout(() => setSuccess(''), 3000);
    };

    // Delete functions
    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            
            switch (activeTab) {
                case 'barang':
                    await barangAPI.delete(itemToDelete.id);
                    break;
                case 'kelas':
                    await kelasAPI.delete(itemToDelete.id);
                    break;
                case 'absen':
                    await absenAPI.delete(itemToDelete.id);
                    break;
            }
            
            setSuccess(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} berhasil dihapus`);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            fetchDataForActiveTab();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error(`❌ Error deleting ${activeTab}:`, error);
            setError(`Gagal menghapus ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    // Render functions
    const renderModal = () => {
        if (!modal.isOpen) return null;

        const modalProps = {
            isOpen: modal.isOpen,
            onClose: handleModalClose,
            mode: modal.mode,
            item: modal.item,
            onSuccess: handleModalSuccess
        };

        switch (modal.type) {
            case 'barang':
                return <BarangModal {...modalProps} />;
            case 'kelas':
                return <KelasModal {...modalProps} />;
            case 'absen':
                return <AbsenModal {...modalProps} />;
            default:
                return null;
        }
    };

    const renderTableHeaders = () => {
        const commonHeaders = (
            <>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">No</th>
            </>
        );

        switch (activeTab) {
            case 'barang':
                return (
                    <>
                        {commonHeaders}
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nama Barang</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Stok</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Satuan</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Lokasi</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Aksi</th>
                    </>
                );
            case 'kelas':
                return (
                    <>
                        {commonHeaders}
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nama Kelas</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Gedung</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Lantai</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Kapasitas</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Aksi</th>
                    </>
                );
            case 'absen':
                return (
                    <>
                        {commonHeaders}
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Mata Kuliah</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Kelas</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Dosen</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Semester</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Jurusan</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Aksi</th>
                    </>
                );
            default:
                return commonHeaders;
        }
    };

    const renderTableRows = () => {
        const currentData = getCurrentData();
        const currentPag = getCurrentPagination();

        return currentData.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(currentPag.currentPage - 1) * perPage + index + 1}
                </td>
                {activeTab === 'barang' && (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {item.nama}
                                </div>
                                {item.keterangan && (
                                    <div className="text-sm text-gray-500">
                                        {item.keterangan}
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-bold ${item.stok <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                                {item.stok}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.satuan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.lokasi || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                        </td>
                    </>
                )}
                {activeTab === 'kelas' && (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap items-center">
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {item.nama_kelas}
                                </div>
                                {item.fasilitas && (
                                    <div className="text-sm text-gray-500">
                                        {item.fasilitas}
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 items-center">
                            {item.gedung || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.lantai || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.kapasitas || '-'}
                        </td>
                    </>
                )}
                {activeTab === 'absen' && (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                                {item.nama_matakuliah}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.kelas || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.dosen || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.semester || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.jurusan || '-'}
                        </td>
                    </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 bg-blue-100 rounded"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-100 rounded"
                        >
                            Hapus
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderFilters = () => {
        const currentFilters = filters[activeTab];

        return (
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Filter Data {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pencarian
                        </label>
                        <input
                            type="text"
                            value={currentFilters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder={`Cari ${activeTab}...`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {(activeTab === 'barang' || activeTab === 'kelas') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={currentFilters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="tersedia">Tersedia</option>
                                <option value="dipinjam">Dipinjam</option>
                                <option value="rusak">Rusak</option>
                                <option value="hilang">Hilang</option>
                            </select>
                        </div>
                    )}

                    {activeTab === 'absen' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Semester
                                </label>
                                <select
                                    value={currentFilters.semester}
                                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">Semua Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                    <option value="7">Semester 7</option>
                                    <option value="8">Semester 8</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jurusan
                                </label>
                                <input
                                    type="text"
                                    value={currentFilters.jurusan}
                                    onChange={(e) => handleFilterChange('jurusan', e.target.value)}
                                    placeholder="Nama jurusan..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </>
                    )}

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
        );
    };

    const currentPag = getCurrentPagination();
    const currentData = getCurrentData();

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h1 className="text-6xl font-bold text-white font-['Inter'] mb-4">
                    Data Inventaris
                </h1>
                <p className="text-white text-lg font-['Poppins']">
                    Kelola data barang, kelas, dan absen
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => handleTabChange('barang')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${
                        activeTab === 'barang'
                            ? 'bg-red-700 text-white'
                            : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                    }`}
                >
                    Barang 
                </button>
                <button
                    onClick={() => handleTabChange('kelas')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${
                        activeTab === 'kelas'
                            ? 'bg-red-700 text-white'
                            : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                    }`}
                >
                    Kelas 
                </button>
                <button
                    onClick={() => handleTabChange('absen')}
                    className={`px-6 py-3 rounded-2xl border border-red-700 font-bold text-base transition-colors font-['Poppins'] ${
                        activeTab === 'absen'
                            ? 'bg-red-700 text-white'
                            : 'bg-red-300/20 text-black/70 hover:bg-red-500 hover:text-white'
                    }`}
                >
                    Absen 
                </button>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handleCreate}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold"
                >
                    + Tambah {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
                
                <div className="text-white font-['Poppins']">
                    Total: {currentPag.totalItems} {activeTab}
                </div>
            </div>

            {/* Filter Section */}
            {renderFilters()}

            {/* Messages */}
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

            {success && (
                <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
                    {success}
                    <button
                        onClick={() => setSuccess('')}
                        className="float-right font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-red-600 text-white">
                                    <tr>
                                        {renderTableHeaders()}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {renderTableRows()}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {currentPag.totalPages > 1 && (
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {((currentPag.currentPage - 1) * perPage) + 1} - {Math.min(currentPag.currentPage * perPage, currentPag.totalItems)} dari {currentPag.totalItems} data
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPag.currentPage - 1)}
                                        disabled={currentPag.currentPage === 1}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: Math.min(5, currentPag.totalPages) }, (_, i) => {
                                        const startPage = Math.max(1, currentPag.currentPage - 2);
                                        const pageNumber = startPage + i;
                                        if (pageNumber > currentPag.totalPages) return null;
                                        
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`px-3 py-1 text-sm border rounded-md ${
                                                    currentPag.currentPage === pageNumber
                                                        ? 'bg-red-600 text-white border-red-600'
                                                        : 'bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPag.currentPage + 1)}
                                        disabled={currentPag.currentPage === currentPag.totalPages}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {currentData.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-4">
                                    Tidak ada data {activeTab}
                                </div>
                                <button
                                    onClick={fetchDataForActiveTab}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Refresh Data
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Render appropriate modal */}
            {renderModal()}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Konfirmasi Hapus</h2>
                        <p className="mb-6">
                            Apakah Anda yakin ingin menghapus <strong>{
                                itemToDelete?.nama ||
                                itemToDelete?.nama_kelas ||
                                itemToDelete?.nama_matakuliah
                            }</strong>?
                            <br />
                            <span className="text-red-500 text-sm">Aksi ini tidak dapat dibatalkan.</span>
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setItemToDelete(null);
                                }}
                                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDataBarang;