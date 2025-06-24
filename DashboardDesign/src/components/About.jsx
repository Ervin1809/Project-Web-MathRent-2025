import React from 'react';
import { Link } from 'react-router-dom';
import mathRentImage from '../assets/MathRent.png';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-white to-red-300 relative overflow-hidden flex flex-col">
        {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-300/20 rounded-full blur-3xl translate-y-48 -translate-x-48 pointer-events-none"></div>

      {/* Navbar */}
      <header className="w-full relative z-10 flex justify-between items-center px-6 md:px-12 lg:px-20 py-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100/50">
        <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          MathRent
        </div>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-gray-600 hover:text-red-700 relative group">
            Home
            <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/about" className="text-gray-800 font-medium relative group">
            About
            <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full"></span>
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-red-700 relative group">
            Contact
            <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>
        <button className="md:hidden p-2 rounded-lg hover:bg-red-50">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section with Image */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-red/20 rounded-3xl blur-xl"></div>
            <img 
              src={mathRentImage} 
              alt="MathRent" 
              className="relative w-72 h-48 object-cover rounded-3xl shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h1 className="mt-8 text-5xl font-bold bg-gradient-to-r from-red-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Tentang MathRent
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Solusi Digital untuk Peminjaman Alat Departemen Matematika
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          {/* Latar Belakang Card */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
                  Latar Belakang
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Peminjaman alat di <span className="font-semibold text-red-600">Departemen Matematika Unhas</span> selama ini masih dilakukan secara manual, yang menyebabkan berbagai kendala:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Kurangnya keteraturan dalam pencatatan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Keterlambatan proses verifikasi</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Sulitnya pelacakan status barang</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-50 rounded-2xl border-l-4 border-red-400">
                  <p className="font-medium text-red-800">
                    MatRent hadir sebagai solusi digital untuk mempermudah pengelolaan peminjaman alat secara online dan terstruktur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tujuan Card */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
                  Tujuan
                </h2>
              </div>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  MatRent bertujuan untuk memberikan layanan peminjaman barang yang:
                </p>
                <div className="grid gap-4">
                  <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-red-800">Efisien & Cepat</span>
                  </div>
                  <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-red-800">Terdokumentasi dengan Baik</span>
                  </div>
                  <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-red-800">Mendukung Digitalisasi</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-2xl border-l-4 border-red-400">
                  <p className="font-medium text-red-800">
                    Mendukung digitalisasi layanan internal Departemen Matematika Unhas menuju era teknologi modern.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;