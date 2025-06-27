import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { barangAPI, kelasAPI, absenAPI } from '../../../services/api';
import AbsenTable from '../TableComponent/AbsenTable';
import KelasScheduleTable from '../TableComponent/KelasScheduleTable';
import PeminjamanModal from '../Modals/PeminjamanModal';

const ProductDetail = () => {
    const navigate = useNavigate();
    const { type, id } = useParams();

    // State management
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [pendingBookingData, setPendingBookingData] = useState(null);
    const [selectedAbsenCourse, setSelectedAbsenCourse] = useState(null); // ADD: State for absen

    console.log('🔍 ProductDetail Debug:', { type, id });

    // Fetch item data based on type and id
    useEffect(() => {
        fetchItemDetail();
    }, [type, id]);

    const fetchItemDetail = async () => {
        try {
            setLoading(true);
            setError('');

            let itemData = null;

            if (type === 'inventaris') {
                console.log('📞 Fetching barang detail for ID:', id);
                const response = await barangAPI.getDetail(id);
                itemData = {
                    ...response.data,
                    type: 'inventaris',
                    name: response.data.nama,
                    currentStock: 0, // TODO: Calculate from active loans
                    maxStock: response.data.stok,
                    description: `${response.data.nama} - Lokasi: ${response.data.lokasi}`
                };

            } else if (type === 'ruangan') {
                console.log('📞 Fetching kelas detail for ID:', id);
                const response = await kelasAPI.getDetail(id);
                itemData = {
                    ...response.data,
                    type: 'ruangan',
                    name: `${response.data.nama_kelas} - ${response.data.gedung}`,
                    // REMOVED: Any reference to status
                    currentStock: 0,
                    maxStock: 1,
                    capacity: response.data.kapasitas,
                    location: `${response.data.gedung} Lantai ${response.data.lantai}`,
                    fasilitas: response.data.fasilitas,
                    isTimeBasedBooking: true
                };

            } else if (type === 'absen-group') {
                // Handle absen group - need to parse the ID to get semester and jurusan
                console.log('📞 Fetching absen group for ID:', id);

                // Parse absen group ID (format: "absen-jurusan-semester")
                const idParts = id.split('-');
                if (idParts.length >= 3) {
                    const jurusan = idParts[1]; // e.g., "matematika"
                    const semester = parseInt(idParts[2]); // e.g., 1

                    console.log('🔍 Parsed absen group:', { jurusan, semester });

                    // Fetch absen data filtered by jurusan and semester
                    const response = await absenAPI.getAll(1, 100, semester, jurusan);
                    const absenData = response.data;

                    // Transform to group format
                    itemData = {
                        id: id,
                        type: 'absen-group',
                        name: `Absen ${jurusan.charAt(0).toUpperCase() + jurusan.slice(1)} Semester ${semester}`,
                        prodi: jurusan.charAt(0).toUpperCase() + jurusan.slice(1),
                        semester: semester,
                        courses: absenData.map(absen => ({
                            id: absen.id,
                            name: absen.nama_matakuliah,
                            kelas: absen.kelas,
                            dosen: absen.dosen,
                            semester: absen.semester,
                            jurusan: absen.jurusan,
                            status: absen.status
                        }))
                    };
                } else {
                    throw new Error('Invalid absen group ID format');
                }
            }

            console.log('✅ Fetched item data:', itemData);
            setItem(itemData);

        } catch (error) {
            console.error('❌ Error fetching item detail:', error);
            setError('Gagal memuat detail item. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Type checks
    const isRuangan = type === 'ruangan';
    const isAbsenGroup = type === 'absen-group';
    const isInventaris = type === 'inventaris';

    // For inventaris only - ruangan uses time-based availability
    const isAvailable = isInventaris && item ? item.currentStock < item.maxStock : false;

    const handleBackToDashboard = () => {
        navigate('/mahasiswa/dashboard');
    };

    const handleSubmitRequest = () => {
        if (!isAvailable) return;
        console.log('Opening modal for:', item);
        setShowModal(true);
    };

    // UPDATED: Handler for absen - open modal instead of alert
    const handleRequestAbsen = (course) => {
        console.log('🔍 ProductDetail - handleRequestAbsen called with:', course);
        console.log('🔍 ProductDetail - Current item:', item);

        setSelectedAbsenCourse(course);
        setShowModal(true);

        console.log('🔍 ProductDetail - Modal should be opening...');
    };

    // Handler for kelas booking
    const handleRequestKelas = (bookingData) => {
        console.log('Opening modal for kelas booking:', bookingData);
        setPendingBookingData(bookingData);
        setShowModal(true);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-poppins">Memuat detail...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !item) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">
                        {error || 'Item tidak ditemukan'}
                    </h2>
                    <p className="text-gray-500 mb-4">Type: {type}, ID: {id}</p>
                    <div className="space-x-4">
                        <button
                            onClick={fetchItemDetail}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Coba Lagi
                        </button>
                        <button
                            onClick={() => navigate('/mahasiswa/dashboard')}
                            className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Absen Group Detail
    if (isAbsenGroup) {
        return (
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="w-full py-6 px-4 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <button
                            onClick={handleBackToDashboard}
                            className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                            <span className="text-xl">←</span>
                        </button>

                        <h1 className="text-red-700 text-2xl font-bold font-['Poppins']">MathRent</h1>

                        <div className="ml-auto">
                            <h2 className="text-black text-2xl lg:text-3xl font-extrabold font-['Poppins']">
                                Detail Absen
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Divider */}
                <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="w-full h-px bg-black mb-8"></div>
                </div>

                {/* Main Content */}
                <main className="w-full px-4 lg:px-8 pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header Info */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900  font-['Inter'] mb-2">
                                {item.name}
                            </h3>
                            <div className="flex gap-4 text-sm text-gray-600 font-['Inter']">
                                <span>Program Studi: {item.prodi}</span>
                                <span>•</span>
                                <span>Semester: {item.semester}</span>
                            </div>
                        </div>

                        {/* Absen Table */}
                        <AbsenTable
                            courses={item.courses}
                            onRequestAbsen={handleRequestAbsen}
                        />
                    </div>
                </main>

                {/* ABSEN MODAL */}
                <PeminjamanModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedAbsenCourse(null);
                    }}
                    item={item}
                    absenCourse={selectedAbsenCourse}
                />
            </div>
        );
    }

    // Render Regular Item (Inventaris/Ruangan)
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="w-full py-6 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button
                        onClick={handleBackToDashboard}
                        className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                        <span className="text-xl">←</span>
                    </button>

                    <h1 className="text-red-700 text-2xl font-bold font-['Poppins']">MathRent</h1>

                    <div className="ml-auto">
                        <h2 className="text-black text-2xl lg:text-3xl font-extrabold font-['Poppins']">
                            Detail {isRuangan ? 'Ruangan' : 'Inventaris'}
                        </h2>
                    </div>
                </div>
            </header>

            {/* Divider */}
            <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
                <div className="w-full h-px bg-black mb-8"></div>
            </div>

            {/* Main Content */}
            <main className="w-full px-4 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl border border-red-700 p-8 lg:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                            {/* Left Side - Image */}
                            <div className="flex justify-center">
                                <div className="w-full max-w-80 h-96 bg-red-300/20 rounded-2xl flex items-center justify-center">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-8xl">
                                            {isRuangan ? '🏢' : '📦'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="space-y-6">
                                <h3 className="text-black text-2xl lg:text-3xl font-semibold font-poppins">
                                    {item.name}
                                </h3>

                                {/* Status badge - different for each type */}
                                {isInventaris && (
                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-2 rounded-2xl text-white text-base font-medium font-poppins ${isAvailable ? 'bg-green-400' : 'bg-red-600'
                                            }`}>
                                            {isAvailable ? 'Tersedia' : 'Belum Tersedia'}
                                        </div>
                                    </div>
                                )}

                                {isRuangan && (
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 rounded-2xl text-white text-base font-medium font-poppins bg-blue-400">
                                            📅 Booking Tersedia
                                        </div>
                                        <div className="text-sm text-gray-600 font-poppins">
                                            Pilih tanggal dan waktu di bawah
                                        </div>
                                    </div>
                                )}

                                {/* Stock info - only for inventaris */}
                                {isInventaris && (
                                    <div className="text-black text-base font-semibold font-poppins">
                                        Jumlah : {item.currentStock}/{item.maxStock}
                                    </div>
                                )}

                                {/* Ruangan specific info */}
                                {isRuangan && (
                                    <div className="space-y-3">
                                        <div className="bg-red-300/20 rounded-lg p-3 inline-block">
                                            <span className="text-black text-xs font-medium font-poppins">
                                                Kapasitas : {item.capacity}
                                            </span>
                                        </div>
                                        <div className="bg-red-300/20 rounded-lg p-3 inline-block">
                                            <span className="text-black text-xs font-medium font-poppins">
                                                Lokasi : {item.location}
                                            </span>
                                        </div>
                                        {item.fasilitas && (
                                            <div className="bg-red-300/20 rounded-lg p-3">
                                                <h4 className="text-black text-sm font-semibold font-poppins mb-2">Fasilitas:</h4>
                                                <p className="text-black text-sm font-normal font-poppins">
                                                    {item.fasilitas}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Inventaris specific info */}
                                {isInventaris && item.description && (
                                    <div className="bg-red-300/20 rounded-lg p-4">
                                        <h4 className="text-black text-sm font-semibold font-poppins mb-2">Deskripsi:</h4>
                                        <p className="text-black text-sm font-normal font-poppins">
                                            {item.description}
                                        </p>
                                        {item.satuan && (
                                            <p className="text-black text-xs font-normal font-poppins mt-2">
                                                Satuan: {item.satuan}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons/components */}
                                <div className="pt-4">
                                    {isRuangan ? (
                                        // Use schedule component for kelas/ruangan
                                        <KelasScheduleTable
                                            kelasId={item.id}
                                            onRequestKelas={handleRequestKelas}
                                        />
                                    ) : (
                                        // Simple button for inventaris
                                        <>
                                            <button
                                                onClick={handleSubmitRequest}
                                                disabled={!isAvailable}
                                                className={`w-full lg:w-80 h-12 rounded-[10px] text-base font-semibold font-poppins transition-all duration-200 ${isAvailable
                                                    ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer'
                                                    : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                                                    }`}
                                            >
                                                {isAvailable ? 'Ajukan Peminjaman' : 'Tidak Tersedia'}
                                            </button>

                                            {!isAvailable && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                                    <p className="text-yellow-800 text-sm font-poppins">
                                                        ⚠️ Item sedang tidak tersedia. Silakan coba lagi nanti atau pilih item lain.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* INVENTARIS & RUANGAN MODAL */}
            <PeminjamanModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setPendingBookingData(null);
                }}
                item={item}
                bookingData={pendingBookingData}
            />
        </div>
    );
};

export default ProductDetail;