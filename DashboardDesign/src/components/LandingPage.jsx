import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mathRentImage from '../assets/MathRent.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-white to-red-300 relative overflow-hidden flex flex-col">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-300/20 rounded-full blur-3xl translate-y-48 -translate-x-48 pointer-events-none"></div>

      {/* Navbar */}
      <header className="relative z-10 flex justify-between items-center px-6 md:px-12 lg:px-20 py-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100/50">
        <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          MathRent
        </div>

        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-gray-800 font-medium relative group">
            Home
            <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full"></span>
          </Link>

          <Link to="/about" className="text-gray-600 hover:text-red-700 relative group">
            About
            <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link to="/contact" className="text-gray-600 hover:text-red-700 relative group">
            Contact
            <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* Mobile menu icon */}
        <button className="md:hidden p-2 rounded-lg hover:bg-red-50">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 h-[calc(100vh-64px)] max-w-screen-xl mx-auto">
        {/* Text Section */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <p className="text-lg font-semibold text-gray-900">Halo, Selamat Datang!</p>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
            Solusi{' '}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Mudah</span>{' '}
            dan{' '}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Cepat</span>
            <br />
            untuk Peminjaman Alat
            <br />
            <span className="text-gray-700">di Departemen Matematika Unhas</span>
          </h1>

          <p className="text-md text-gray-600 font-medium">
            <span className="text-red-600">Efisien</span> •{' '}
            <span className="text-red-600">Terstruktur</span> •{' '}
            <span className="text-red-600">Terpercaya</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-md transition-transform hover:-translate-y-0.5"
            >
              Masuk
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 text-sm font-semibold text-red-700 bg-white border border-red-600 rounded-md shadow-md hover:bg-red-50 transition-transform hover:-translate-y-0.5"
            >
              Daftar
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <div className="w-64 md:w-80 lg:w-96">
            <img
              src={mathRentImage}
              alt="MathRent"
              className="w-full h-auto object-contain rounded-xl shadow-xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;