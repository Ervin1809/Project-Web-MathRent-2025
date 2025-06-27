import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MahasiswaLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        console.log('🔄 Logging out mahasiswa:', user);
        logout();
        navigate('/');
    };

    const handleNavClick = (section) => {
        console.log('Navigation clicked:', section);
        switch (section) {
            case 'home':
                navigate('/mahasiswa/dashboard');
                break;
            case 'about':
                navigate('/mahasiswa/about');
                break;
            case 'contact':
                navigate('/mahasiswa/contact');
                break;
            case 'settings':
                navigate('/mahasiswa/settings');
                break;
            default:
                break;
        }
    };

    // Determine active menu
    const getActiveMenu = () => {
        if (location.pathname === '/mahasiswa/dashboard') {
            return 'home';
        } else if (location.pathname === '/mahasiswa/settings') {
            return 'settings';
        } else if (location.pathname === '/mahasiswa/about') {
            return 'about';
        } else if (location.pathname === '/mahasiswa/contact') {
            return 'contact';
        }
        return 'home';
    };

    const activeMenu = getActiveMenu();

    return (
        <div className="min-h-screen bg-white">
            
            {/* Header Navigation - Fixed */}
            <header className="w-full py-6 px-4 lg:px-8 bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <h1 className="text-red-700 text-2xl font-bold font-['Poppins']">
                        MathRent
                    </h1>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-4 lg:gap-8">
                        <button 
                            onClick={() => handleNavClick('home')}
                            className={`text-lg lg:text-xl font-normal font-['Poppins'] transition-colors ${
                                activeMenu === 'home' 
                                    ? 'text-red-700 underline' 
                                    : 'text-black hover:text-red-700'
                            }`}
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => handleNavClick('settings')}
                            className={`text-lg lg:text-xl font-normal font-['Poppins'] transition-colors ${
                                activeMenu === 'settings' 
                                    ? 'text-red-700 underline' 
                                    : 'text-black hover:text-red-700'
                            }`}
                        >
                            Settings
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

            {/* Main Content Area */}
            <main className="pt-24"> {/* Add padding top for fixed header */}
                {children}
            </main>
        </div>
    );
};

export default MahasiswaLayout;