import React from 'react';
import { Link } from 'react-router-dom';
import mathRentImage from '../assets/MathRent.png';
import instagramIcon from '../assets/instagram.png';
import phoneIcon from '../assets/phone-call.png';
import websiteIcon from '../assets/world-wide-web.png';
import youtubeIcon from '../assets/youtube.png';


const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-white to-red-300 relative overflow-hidden flex flex-col">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-300/20 rounded-full blur-3xl translate-y-48 -translate-x-48 pointer-events-none"></div>

      {/* Navbar */}
      <header className="w-full relative z-20 flex justify-between items-center px-6 md:px-12 lg:px-20 py-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100/50">
        <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          MathRent
        </div>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-gray-600 hover:text-red-700 relative group">
            Home
            <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-red-700 relative group">
            About
            <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/contact" className="text-gray-800 font-medium relative group">
            Contact
            <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-red-800 rounded-full"></span>
          </Link>
        </nav>
        <button className="md:hidden p-2 rounded-lg hover:bg-red-50">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 md:p-12 relative z-10">
        {/* Contact Information Section */}
        <div className="bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-lg border border-red-100/50 max-w-lg w-full md:w-1/2 mb-8 md:mb-0 md:mr-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8 text-center md:text-left">Get in Touch</h2>

          <div className="space-y-6">
            <div className="flex items-center">
              <img
                className="w-10 h-10 mr-4 flex-shrink-0"
                src={youtubeIcon} 
                alt="Youtube Icon"
              />
              <div>
                <p className="text-red-700 text-lg font-semibold">Departemen Matematika Unhas</p>
              </div>
            </div>

            <div className="flex items-center">
              <img
                className="w-10 h-10 mr-4 flex-shrink-0"
                src={instagramIcon}
                alt="Instagram Icon"
              />
              <p className="text-red-700 text-lg font-semibold">@depmath_unhas</p>
            </div>

            <div className="flex items-center">
              <img
                className="w-10 h-10 mr-4 flex-shrink-0"
                src={phoneIcon}
                alt="Phone Icon"
              />
              <p className="text-red-700 text-lg font-semibold">+62 821 3456 7890</p>
            </div>

            <div className="flex items-center">
              <img
                className="w-10 h-10 mr-4 flex-shrink-0"
                src={websiteIcon}
                alt="Website Icon"
              />
              <a href="https://sci.unhas.ac.id/d-matematika/" target="_blank" rel="noopener noreferrer" className="text-red-700 text-lg font-semibold hover:underline">
                https://sci.unhas.ac.id/d-matematika/
              </a>
            </div>
          </div>

        </div>

        {/* Illustration Section */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <img
            className="max-w-full h-auto rounded-xl shadow-lg"
            src={mathRentImage} 
            alt="Contact Illustration"
          />
        </div>
      </main>
    </div>
  );
};

export default Contact;