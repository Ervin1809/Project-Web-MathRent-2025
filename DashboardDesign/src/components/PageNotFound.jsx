import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const PageNotFound = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-red-100 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            <div className="absolute w-64 h-64 bg-red-200 opacity-30 rounded-full blur-3xl animate-ping -z-10"></div>
            <h1 className="relative text-[120px] font-extrabold text-red-600 drop-shadow-lg mb-2 overflow-hidden">
                <span className="relative inline-block w-full h-full">
                    404
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 transform -skew-x-12 animate-shine pointer-events-none" style={{mixBlendMode: 'screen'}}></div>
                </span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-red-700 mb-4">
                Halaman Tidak Ditemukan!
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-md">
                Maaf, halaman yang kamu cari tidak tersedia.
            </p>
            <button
                onClick={handleBack}
                className="mt-6 inline-block px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            >
                Kembali ke Beranda
            </button>
        </div>
    );
};

export default PageNotFound;