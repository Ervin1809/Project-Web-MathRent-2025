import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-l from-red-300/0 to-red-800/50" />

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">

                {/* Header Navigation */}
                <header className="flex justify-between items-center pt-14 pb-8">
                    <div className="text-red-700/80 text-2xl font-bold font-['Poppins']">
                        MathRent
                    </div>

                    <nav className="hidden md:flex space-x-12">
                        <a href="#home" className="text-black text-xl font-normal font-['Poppins'] hover:text-red-700/80 transition-colors">
                            Home
                        </a>
                        <a href="#about" className="text-black text-xl font-normal font-['Poppins'] hover:text-red-700/80 transition-colors">
                            About
                        </a>
                        <a href="#contact" className="text-black text-xl font-normal font-['Poppins'] hover:text-red-700/80 transition-colors">
                            Contact
                        </a>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-140px)]">

                    {/* Left Content */}
                    <div className="lg:w-1/2 space-y-8 text-center lg:text-left">

                        {/* Welcome Text */}
                        <div className="text-red-700/80 text-xl font-semibold font-['Poppins']">
                            Halo, Selamat Datang!
                        </div>

                        {/* Main Heading */}
                        <div className="text-black text-3xl lg:text-4xl xl:text-5xl font-extrabold font-['Poppins'] leading-tight">
                            Solusi Mudah dan Cepat <br />
                            untuk Peminjaman Alat <br />
                            di Departemen Matematika Unhas
                        </div>

                        {/* Tagline */}
                        <div className="text-black text-lg lg:text-xl font-normal font-['Poppins']">
                            Efisien. Terstruktur. Terpercaya.
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

                            {/* Login Button */}
                            <button
                                onClick={handleLogin}
                                className="w-44 h-16 bg-red-700/80 rounded-2xl hover:bg-red-700 transition-colors group"
                            >
                                <span className="text-white text-2xl font-semibold font-['Poppins'] group-hover:scale-105 transition-transform">
                                    Masuk
                                </span>
                            </button>

                            {/* Register Button */}
                            <button
                                onClick={handleRegister}
                                className="w-44 h-16 bg-red-300/20 rounded-2xl border border-red-700/80 hover:bg-red-300/30 transition-colors group"
                            >
                                <span className="text-red-700/80 text-2xl font-semibold font-['Poppins'] group-hover:scale-105 transition-transform">
                                    Daftar
                                </span>
                            </button>

                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0">
                        <div className="w-80 h-80 lg:w-[500px] lg:h-[500px] xl:w-[606px] xl:h-[606px]">
                            <img
                                className="w-full h-full object-cover rounded-3xl shadow-2xl"
                                src="https://placehold.co/606x606"
                                alt="MathRent Illustration"
                            />
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default LandingPage;