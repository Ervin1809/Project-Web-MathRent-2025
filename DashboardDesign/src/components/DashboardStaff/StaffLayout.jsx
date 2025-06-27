import React, { useState,useEffect  } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../../assets/MathRent.png';
import gifloading from "../../assets/gifloading.gif";

const StaffLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        console.log('🔄 Logging out staff:', user);
        logout();
        navigate('/');
    };

    const handleNavClick = (section) => {
        console.log('Navigation clicked:', section);
        switch (section) {
            case 'peminjaman':
                navigate('/staff');
                break;
            case 'riwayat':
                navigate('/staff/riwayat');
                break;
            case 'barang':
                navigate('/staff/databarang');
                break;
            default:
                break;
        }
    };

    // Determine active menu
    const getActiveMenu = () => {
        if (location.pathname === '/staff' || location.pathname === '/staff/peminjaman') {
            return 'peminjaman';
        } else if (location.pathname === '/staff/riwayat') {
            return 'riwayat';
        } else if (location.pathname === '/staff/databarang') {
            return 'barang';
        }
        return 'peminjaman';
    };

    const activeMenu = getActiveMenu();
    const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        const timer = setTimeout(() => {
          setLoading(false);
        }, 2000);
    
        return () => clearTimeout(timer);
      }, []);
    
      if (loading) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <img src={gifloading} alt="Loading..." className="w-24 h-24 mb-4" />
            <p className="text-red-700 font-semibold animate-pulse">Memuat konten...</p>
          </div>
        );
      }
    return (
        <div className="min-h-screen bg-red-300/70">
            {/* Header - Fixed */}
            <header className="w-full h-18 bg-white/95 shadow-sm fixed top-0 left-0 right-0 z-40">
                <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center">
                        <img
                            src={logoImage}
                            alt="Logo MathRent"
                            className="w-14 h-14 mr-2" 
                        />
                        <h1 className="text-red-700 text-2xl font-bold font-['Poppins']">
                            MathRent
                        </h1>
                    </div>


                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-14 h-14 bg-zinc-300 rounded-xl flex items-center justify-center">
                                <div className="text-2xl">👤</div>
                            </div>
                            <div className="text-center">
                                <div className="text-neutral-500 text-xl font-normal font-['Inter']">
                                    {user?.role === 'staff' ? 'Staff' : 'Admin'}
                                </div>
                                <div className="w-16 h-0.5 bg-stone-500"></div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-red-600 text-lg font-normal font-['Poppins'] hover:text-red-700 transition-colors ml-4"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex pt-18"> {/* Add padding top for fixed header */}
                {/* Sidebar - Fixed */}
                <aside className="w-60 h-screen bg-red-700/95 text-white pt-8 fixed left-0 z-30">
                    <nav className="space-y-8 px-4">
                        <div className="text-center">
                            <button
                                onClick={() => handleNavClick('peminjaman')}
                                className={`text-2xl font-bold cursor-pointer hover:text-red-200 transition-colors font-['Inter'] ${
                                    activeMenu === 'peminjaman' ? 'underline' : ''
                                }`}
                            >
                                Daftar Peminjaman
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={() => handleNavClick('riwayat')}
                                className={`text-2xl font-bold cursor-pointer hover:text-red-200 transition-colors font-['Inter'] ${
                                    activeMenu === 'riwayat' ? 'underline' : ''
                                }`}
                            >
                                Riwayat
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={() => handleNavClick('barang')}
                                className={`text-2xl font-bold cursor-pointer hover:text-red-200 transition-colors font-['Inter'] ${
                                    activeMenu === 'barang' ? 'underline' : ''
                                }`}
                            >
                                Data Barang
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 ml-59"> {/* Add margin left for fixed sidebar */}
                    {/* Pass searchQuery sebagai prop ke children jika diperlukan */}
                    {React.cloneElement(children, { searchQuery })}
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;