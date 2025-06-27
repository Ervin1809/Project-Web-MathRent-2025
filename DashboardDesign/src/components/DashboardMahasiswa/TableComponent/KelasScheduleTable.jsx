import React, { useState, useEffect } from 'react';
import { peminjamanAPI } from '../../../services/api';

const KelasScheduleTable = ({ kelasId, onRequestKelas }) => {
    const [schedule, setSchedule] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Input states
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [hasConflict, setHasConflict] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');

    useEffect(() => {
        fetchKelasSchedule();
    }, [selectedDate, kelasId]);

    // Check for conflicts whenever times change
    useEffect(() => {
        if (startTime && endTime) {
            checkTimeConflict();
        } else {
            setHasConflict(false);
            setConflictMessage('');
        }
    }, [startTime, endTime, schedule]);

    const fetchKelasSchedule = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('🔄 Fetching kelas schedule for:', { kelasId, selectedDate });

            // Call real API
            const response = await peminjamanAPI.getKelasSchedule(kelasId, selectedDate);

            console.log('✅ Kelas schedule response:', response.data);

            // Transform data
            const jadwalData = response.data.jadwal || [];
            setSchedule(jadwalData);

        } catch (error) {
            console.error('❌ Error fetching kelas schedule:', error);
            setError('Gagal memuat jadwal. Menggunakan data kosong.');
            setSchedule([]); // Fallback to empty schedule
        } finally {
            setLoading(false);
        }
    };

    const checkTimeConflict = () => {
        if (!startTime || !endTime) return;

        // Validate time order
        if (startTime >= endTime) {
            setHasConflict(true);
            setConflictMessage('Waktu mulai harus lebih awal dari waktu selesai');
            return;
        }

        // Check for overlaps with existing bookings
        const conflicts = schedule.filter(booking => {
            const bookingStart = booking.waktu_mulai;
            const bookingEnd = booking.waktu_selesai;

            // Check if there's any overlap
            return (
                (startTime >= bookingStart && startTime < bookingEnd) ||
                (endTime > bookingStart && endTime <= bookingEnd) ||
                (startTime <= bookingStart && endTime >= bookingEnd)
            );
        });

        if (conflicts.length > 0) {
            setHasConflict(true);
            const conflictDetails = conflicts.map(c =>
                `${c.waktu_mulai}-${c.waktu_selesai} (${c.user_name})`
            ).join(', ');
            setConflictMessage(`Bentrok dengan jadwal: ${conflictDetails}`);
        } else {
            setHasConflict(false);
            setConflictMessage('');
        }
    };

    // Update handleSubmitBooking function
    const handleSubmitBooking = () => {
        if (!startTime || !endTime) {
            alert('Mohon isi waktu mulai dan waktu selesai');
            return;
        }

        if (hasConflict) {
            alert('Tidak dapat booking: ' + conflictMessage);
            return;
        }

        // Submit booking via parent
        onRequestKelas({
            kelasId,
            tanggal: selectedDate,
            waktu_mulai: startTime,
            waktu_selesai: endTime
        });

        // Clear form
        setStartTime('');
        setEndTime('');
    };

    const formatTimeDisplay = (time) => {
        return time || '--:--';
    };

    return (
        <div className="space-y-6">
            {/* Booking Form */}
            <div className="bg-white rounded-2xl border border-red-700 overflow-hidden">
                <div className="bg-red-700 text-white px-6 py-4">
                    <h3 className="text-xl font-bold tracking-wide font-['Josefin Sans']">Booking Jadwal Kelas</h3>
                </div>

                <div className="p-6 space-y-4">
                    {/* Date Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                            Pilih Tanggal:
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-poppins focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* Time Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                Jam Mulai:
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                min="07:00"
                                max="21:00"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-poppins focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                Jam Selesai:
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                min="07:00"
                                max="21:00"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-poppins focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {(startTime || endTime) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 font-poppins">Preview Booking:</h4>
                            <p className="text-base text-gray-700 tracking-wide font-['Josefin Sans']">
                                📅 {selectedDate} | ⏰ {formatTimeDisplay(startTime)} - {formatTimeDisplay(endTime)}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm font-poppins">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Conflict Warning */}
                    {hasConflict && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-red-500 text-lg">⚠️</span>
                                <div>
                                    <h4 className="text-red-800 font-semibold font-poppins">Konflik Jadwal!</h4>
                                    <p className="text-red-700 text-sm font-poppins mt-1">{conflictMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {startTime && endTime && !hasConflict && !error && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <span className="text-green-500 text-lg">✅</span>
                                <p className="text-green-800 font-poppins">
                                    Jadwal tersedia! Silakan submit booking.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitBooking}
                        disabled={!startTime || !endTime || hasConflict || loading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold font-poppins transition-colors ${(!startTime || !endTime || hasConflict || loading)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-700 text-white hover:bg-red-800'
                            }`}
                    >
                        {loading ? 'Memuat...' : 'Ajukan Peminjaman Kelas'}
                    </button>
                </div>
            </div>

            {/* Existing Bookings - NOW WITH REAL DATA */}
            <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
                <div className="bg-gray-100 px-6 py-4">
                    {/* Judul Section */}
                    <h3 className="text-xl font-bold font-['Josefin Sans'] text-gray-800 tracking-wide">
                        Jadwal yang Sudah Dibooking
                    </h3>

                    {/* Tanggal ditampilkan vertikal di bawah judul */}
                    <p className="text-sm text-green-500 font-semibold font-['Poppins'] mt-1">
                        {selectedDate}
                    </p>

                    {schedule.length > 0 && (
                        <p className="text-sm text-gray-600 font-['Poppins'] mt-1">
                            Total: {schedule.length} booking
                        </p>
                    )}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                            <p className="text-gray-600 font-poppins">Memuat jadwal...</p>
                        </div>
                    ) : schedule.length > 0 ? (
                        <div className="space-y-3">
                            {schedule.map((booking, index) => (
                                <div key={index} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-red-700 text-base font-bold font-['Josefin Sans']">
                                                    ⏰ {booking.waktu_mulai} - {booking.waktu_selesai}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-['Josefin Sans']">
                                                👤 {booking.user_name} ({booking.user_nim})
                                            </p>
                                            <p className="text-xs text-gray-500 font-['Poppins'] mt-1">
                                                ID Peminjaman: #{booking.peminjaman_id}
                                            </p>
                                        </div>
                                        <span className="bg-red-100 text-red-800 text-xs font-medium font-['Inter'] px-3 py-1 rounded-full shadow-sm">
                                            {booking.status === 'disetujui' ? 'Approved' : booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-2">📅</div>
                            <p className="text-gray-500 font-poppins">
                                Belum ada booking untuk tanggal ini
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-semibold font-poppins mb-2">💡 Cara Booking:</h4>
                <ul className="text-blue-700 text-sm font-poppins space-y-1">
                    <li>1. Pilih tanggal yang diinginkan</li>
                    <li>2. Input jam mulai dan jam selesai</li>
                    <li>3. System akan otomatis check konflik dengan booking lain</li>
                    <li>4. Jika tidak ada konflik, klik "Ajukan Peminjaman"</li>
                </ul>
            </div>
        </div>
    );
};

export default KelasScheduleTable;