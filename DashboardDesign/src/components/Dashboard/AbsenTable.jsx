import React from 'react';

const AbsenTable = ({ courses, onRequestAbsen }) => {
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
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 font-poppins">
                                Status
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 font-poppins">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses.map((course, index) => (
                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                {/* No */}
                                <td className="px-6 py-4 text-sm text-gray-900 font-poppins">
                                    {index + 1}
                                </td>
                                
                                {/* Nama Mata Kuliah */}
                                <td className="px-6 py-4 text-sm text-gray-900 font-poppins">
                                    {course.name}
                                </td>
                                
                                {/* Status Badge */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium font-poppins ${
                                        course.status === 'tersedia' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {course.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                                    </span>
                                </td>
                                
                                {/* Action Button */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onRequestAbsen(course)}
                                        disabled={course.status !== 'tersedia'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium font-poppins transition-all duration-200 ${
                                            course.status === 'tersedia'
                                                ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer shadow-sm hover:shadow-md'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                        }`}
                                    >
                                        {course.status === 'tersedia' ? 'Ajukan' : 'Tidak Tersedia'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer - Summary Statistics */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm font-poppins">
                    <span className="text-gray-600">
                        Total Mata Kuliah: <span className="font-semibold">{courses.length}</span>
                    </span>
                    <div className="flex gap-6">
                        <span className="text-green-600">
                            Tersedia: <span className="font-semibold">{courses.filter(c => c.status === 'tersedia').length}</span>
                        </span>
                        <span className="text-red-600">
                            Tidak Tersedia: <span className="font-semibold">{courses.filter(c => c.status !== 'tersedia').length}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-4xl mb-4">📚</div>
                    <p className="text-gray-500 font-poppins">
                        Tidak ada mata kuliah tersedia
                    </p>
                </div>
            )}
        </div>
    );
};

export default AbsenTable;