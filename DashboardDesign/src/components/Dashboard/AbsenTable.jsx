import React, { useState } from 'react';

const AbsenTable = ({ courses, onRequestAbsen }) => {
    const [loadingCourse, setLoadingCourse] = useState(null);

    const handleRequestAbsen = async (course) => {
        console.log('🔍 AbsenTable - handleRequestAbsen called with:', course);
        
        if (typeof onRequestAbsen === 'function') {
            setLoadingCourse(course.id);
            try {
                await onRequestAbsen(course);
            } catch (error) {
                console.error('❌ Error requesting absen:', error);
            } finally {
                setTimeout(() => setLoadingCourse(null), 1000);
            }
        } else {
            console.error('❌ onRequestAbsen is not a function');
            alert('Error: onRequestAbsen function not found');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-red-700 overflow-hidden">
            {/* Table Header */}
            <div className="bg-red-700 text-white px-6 py-4">
                <h3 className="text-xl font-semibold font-poppins">Daftar Mata Kuliah</h3>
            </div>
            
            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-poppins">
                                No
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-poppins">
                                Nama Mata Kuliah
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-poppins">
                                Kelas
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-poppins">
                                Dosen
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 font-poppins">
                                Status
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 font-poppins">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses && courses.length > 0 ? (
                            courses.map((course, index) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    {/* No */}
                                    <td className="px-6 py-4 text-sm text-gray-900 font-poppins">
                                        {index + 1}
                                    </td>
                                    
                                    {/* Nama Mata Kuliah */}
                                    <td className="px-6 py-4 text-sm text-gray-900 font-poppins">
                                        <div className="font-medium">{course.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {course.jurusan} • Semester {course.semester}
                                        </div>
                                    </td>

                                    {/* Kelas */}
                                    <td className="px-6 py-4 text-sm text-gray-900 font-poppins">
                                        {course.kelas}
                                    </td>

                                    {/* Dosen */}
                                    <td className="px-6 py-4 text-sm text-gray-900 font-poppins">
                                        {course.dosen}
                                    </td>
                                    
                                    {/* Status Badge */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium font-poppins ${
                                            course.status === 'tersedia' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {course.status === 'tersedia' ? 'Tersedia' : 'Dipinjam'}
                                        </span>
                                    </td>
                                    
                                    {/* Action Button */}
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleRequestAbsen(course)}
                                            disabled={course.status !== 'tersedia' || loadingCourse === course.id}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium font-poppins transition-all duration-200 ${
                                                course.status === 'tersedia' && loadingCourse !== course.id
                                                    ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer shadow-sm hover:shadow-md'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                            }`}
                                        >
                                            {loadingCourse === course.id 
                                                ? 'Loading...' 
                                                : course.status === 'tersedia' 
                                                    ? 'Ajukan' 
                                                    : 'Tidak Tersedia'
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="text-gray-400 text-4xl mb-4">📚</div>
                                    <p className="text-gray-500 font-poppins">
                                        Tidak ada mata kuliah tersedia
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer - Summary Statistics */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm font-poppins">
                    <span className="text-gray-600">
                        Total Mata Kuliah: <span className="font-semibold">{courses?.length || 0}</span>
                    </span>
                    <div className="flex gap-6">
                        <span className="text-green-600">
                            Tersedia: <span className="font-semibold">
                                {courses?.filter(c => c.status === 'tersedia').length || 0}
                            </span>
                        </span>
                        <span className="text-red-600">
                            Dipinjam: <span className="font-semibold">
                                {courses?.filter(c => c.status !== 'tersedia').length || 0}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AbsenTable;