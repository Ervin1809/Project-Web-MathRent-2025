import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ItemCard from './ItemCard';
import SearchFilter from './SearchFilter';

// Import API functions (sesuaikan dengan structure api.js yang sudah ada)
import { barangAPI, kelasAPI, absenAPI } from '../../services/api';

const MahasiswaDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // State untuk search & filter
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('semua');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch data from API
    useEffect(() => {
        fetchAllItems();
    }, []);

    const fetchAllItems = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch data dari semua API endpoints
            const [barangResponse, kelasResponse, absenResponse] = await Promise.all([
                barangAPI.getAll(), // Get available barang
                kelasAPI.getAll(),  // Get available kelas
                absenAPI.getAll(1, 100)      // Get all absen
            ]);

            console.log('🔄 API Responses:', {
                barang: barangResponse.data,
                kelas: kelasResponse.data,
                absen: absenResponse.data
            });

            // Transform barang data
            const barangItems = (barangResponse.data.items || barangResponse.data).map(barang => ({
                id: barang.id,
                type: 'inventaris',
                name: barang.nama,
                currentStock: 0, // Akan dihitung berdasarkan peminjaman aktif
                maxStock: barang.stok,
                image: null,
                satuan: barang.satuan,
                lokasi: barang.lokasi,
                status: barang.status,
                description: `${barang.nama} - Lokasi: ${barang.lokasi}`
            }));

            // FIXED: Transform kelas data - REMOVE status reference
            const kelasItems = (kelasResponse.data.data || kelasResponse.data).map(kelas => ({
                id: kelas.id,
                type: 'ruangan',
                name: `${kelas.nama_kelas} - ${kelas.gedung}`,
                currentStock: 0, // Always 0 for time-based booking
                maxStock: 1,
                image: null,
                capacity: kelas.kapasitas,
                gedung: kelas.gedung,
                lantai: kelas.lantai,
                fasilitas: kelas.fasilitas,
                // REMOVED: status: kelas.status (field tidak ada lagi)
                location: `${kelas.gedung} Lantai ${kelas.lantai}`,
                isTimeBasedBooking: true // Mark as time-based booking
            }));

            // Transform absen data - Group by semester & jurusan
            const absenGrouped = groupAbsenBySemester(absenResponse.data);

            // Combine all items
            const allItems = [
                ...barangItems,
                ...kelasItems,
                ...absenGrouped
            ];

            console.log('✅ Combined Items:', allItems);
            setItems(allItems);

        } catch (error) {
            console.error('❌ Error fetching items:', error);
            setError('Gagal memuat data. Silakan refresh halaman.');
        } finally {
            setLoading(false);
        }
    };

    // Group absen by semester and jurusan
    const groupAbsenBySemester = (absenData) => {
        const grouped = absenData.reduce((acc, absen) => {
            const key = `${absen.jurusan}-semester-${absen.semester}`;
            
            if (!acc[key]) {
                acc[key] = {
                    id: `absen-${absen.jurusan.toLowerCase()}-${absen.semester}`,
                    type: 'absen-group',
                    name: `Absen ${absen.jurusan} Semester ${absen.semester}`,
                    jurusan: absen.jurusan,
                    semester: absen.semester,
                    courses: [],
                    currentStock: 0,
                    maxStock: 0
                };
            }

            acc[key].courses.push({
                id: absen.id,
                name: absen.nama_matakuliah,
                kelas: absen.kelas,
                dosen: absen.dosen,
                status: absen.status
            });

            acc[key].maxStock++;

            return acc;
        }, {});

        // Convert to array and calculate availability
        return Object.values(grouped).map(group => {
            const tersediaCount = group.courses.filter(c => c.status === 'tersedia').length;
            return {
                ...group,
                currentStock: group.maxStock - tersediaCount
            };
        });
    };

    // Filter items berdasarkan search dan filter
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'semua' || 
                            (activeFilter === 'inventaris' && item.type === 'inventaris') ||
                            (activeFilter === 'ruangan' && item.type === 'ruangan') ||
                            (activeFilter === 'absen-group' && item.type === 'absen-group');
        return matchesSearch && matchesFilter;
    });

    // Handle logout
    const handleLogout = () => {
        console.log('🔄 Logging out user:', user);
        logout();
        navigate('/');
    };

    // Handle card click
    const handleCardClick = (itemData) => {
        console.log('Card clicked:', itemData);
        navigate(`/mahasiswa/detail/${itemData.type}/${itemData.id}`);
    };

    // Handle navigation clicks
    const handleNavClick = (section) => {
        console.log('Navigation clicked:', section);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-['Poppins']">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-['Poppins'] mb-4">{error}</p>
                    <button 
                        onClick={fetchAllItems}
                        className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            
            {/* Header Navigation */}
            <header className="w-full py-6 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <h1 className="text-red-700 text-2xl font-bold font-['Poppins']">
                        MathRent
                    </h1>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-4 lg:gap-8">
                        <button 
                            onClick={() => handleNavClick('home')}
                            className="text-black text-lg lg:text-xl font-normal font-['Poppins'] underline hover:text-red-700 transition-colors"
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => handleNavClick('about')}
                            className="text-black text-lg lg:text-xl font-normal font-['Poppins'] hover:text-red-700 transition-colors"
                        >
                            About
                        </button>
                        <button 
                            onClick={() => handleNavClick('contact')}
                            className="text-black text-lg lg:text-xl font-normal font-['Poppins'] hover:text-red-700 transition-colors"
                        >
                            Contact
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="text-red-600 text-lg lg:text-xl font-normal font-['Poppins'] hover:text-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Section Title */}
                    <h2 className="text-left text-black text-2xl lg:text-3xl font-extrabold font-['Poppins'] mb-2">
                        Peminjaman Tersedia
                    </h2>

                    {/* Divider Line */}
                    <div className="w-full h-px bg-black mb-6"></div>

                    {/* Search & Filter */}
                    <SearchFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                        {filteredItems.map((item) => (
                            <ItemCard
                                key={`${item.type}-${item.id}`}
                                id={item.id}
                                type={item.type}
                                name={item.name}
                                currentStock={item.currentStock}
                                maxStock={item.maxStock}
                                image={item.image}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredItems.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-xl font-['Poppins']">
                                {searchQuery ? 'Tidak ada item yang ditemukan' : 'Tidak ada data tersedia'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MahasiswaDashboard;