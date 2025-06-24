import React from 'react';
import { useNavigate } from 'react-router-dom';

const ItemCard = ({
    id,
    type = 'inventaris', // 'inventaris' atau 'ruangan'
    name,
    currentStock,
    maxStock,
    image,
    isAvailable,
    onCardClick
}) => {
    const navigate = useNavigate();
    const availability = currentStock < maxStock;

    const handleCardClick = () => {
        // Navigate to detail page
        navigate(`/mahasiswa/detail/${type}/${id}`);

        // Also call the parent's onClick if provided
        if (onCardClick) {
            onCardClick({ id, type, name, currentStock, maxStock });
        }
    };

    return (
        <div
            className="w-full max-w-60 mx-auto h-68 bg-white rounded-2xl border border-red-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleCardClick}
        >
            {/* Image Placeholder */}
            <div className="w-52 h-32 mx-auto mt-4 bg-red-300/20 rounded-2xl flex items-center justify-center">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover rounded-2xl"
                    />
                ) : (
                    <div className="text-gray-400 text-4xl">
                        {type === 'inventaris' ? '📦' : '🏢'}
                    </div>
                )}
            </div>

            {/* Status Badge */}
            {type === 'inventaris' ?
                <div className="flex justify-center mt-4">
                    <div className={`px-3 py-1 rounded-2xl text-white text-[10px] font-medium font-poppins ${availability ? 'bg-green-400' : 'bg-red-600'
                        }`}>
                        {availability ? 'Tersedia' : 'Belum Tersedia'}
                    </div>
                </div> :
                <div className="flex justify-center mt-4">
                </div>
            }


            {/* Item Name */}
            {type === 'inventaris' ?
                <div className="text-center mt-4 px-4">
                    <h3 className="text-black text-lg lg:text-xl font-semibold font-poppins truncate">
                        {name || `Nama ${type === 'inventaris' ? 'Inventaris' : 'Ruangan'}`}
                    </h3>
                </div> :
                <div className="text-center mt-4 px-4">
                    <h3 className="text-black text-lg lg:text-xl font-semibold font-poppins">
                        {name || `Nama ${type === 'inventaris' ? 'Inventaris' : 'Ruangan'}`}
                    </h3>
                </div>
            }

            {/* Stock Info */}
            {type === 'inventaris' ?
                <div className="text-center mt-2 px-4">
                    <p className="text-black text-sm lg:text-base font-semibold font-poppins">
                        Jumlah : {currentStock}/{maxStock}
                    </p>
                </div> :
                <div className="text-center mt-2 px-4">

                </div>
            }
        </div>
    );
};

export default ItemCard;