import React from 'react';

const SearchFilter = ({ 
    searchQuery, 
    onSearchChange, 
    activeFilter, 
    onFilterChange 
}) => {
    const filters = [
        { key: 'semua', label: 'Semua' },
        { key: 'inventaris', label: 'Inventaris' },
        { key: 'ruangan', label: 'Ruangan' },
        { key: 'absen-group', label: 'Absen' }
    ];

    return (
        <div className="mb-8">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari Peminjaman..."
                        className="w-full h-12 bg-red-300/20 rounded-2xl border border-red-700 px-4 text-black/70 text-base font-normal font-poppins placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            {/* Filter Buttons - Responsive */}
            <div className="flex flex-wrap gap-2 lg:gap-4">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={`h-12 px-4 lg:px-6 rounded-2xl border border-red-700 text-sm lg:text-base font-bold font-poppins transition-colors ${
                            activeFilter === filter.key
                                ? 'bg-red-700 text-white'
                                : 'bg-red-300/20 text-black/70 hover:bg-red-300/40'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchFilter;