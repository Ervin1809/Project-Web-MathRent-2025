import { peminjamanAPI } from './api';

export const peminjamanService = {
    // Create peminjaman untuk barang/inventaris
    createBarangPeminjaman: async (barangId, jumlah, tanggalPeminjaman, keperluan) => {
        const data = {
            tanggal_peminjaman: tanggalPeminjaman,
            notes: keperluan, // Changed from keperluan to notes
            details: [
                {
                    reference_type: "barang",
                    reference_id: barangId,
                    jumlah: jumlah
                }
            ]
        };
        
        console.log('📤 Sending barang peminjaman data:', data);
        return await peminjamanAPI.createPeminjaman(data);
    },

    // Create peminjaman untuk kelas - FIXED FORMAT
    createKelasPeminjaman: async (kelasId, tanggalPeminjaman, waktuMulai, waktuSelesai, keperluan) => {
        // Convert time strings to proper datetime format
        const waktuMulaiDateTime = `${tanggalPeminjaman}T${waktuMulai}:00`;
        const waktuSelesaiDateTime = `${tanggalPeminjaman}T${waktuSelesai}:00`;
        
        const data = {
            tanggal_peminjaman: tanggalPeminjaman,
            notes: keperluan, // Changed from keperluan to notes
            details: [
                {
                    reference_type: "kelas",
                    reference_id: kelasId,
                    waktu_mulai: waktuMulaiDateTime,
                    waktu_selesai: waktuSelesaiDateTime
                }
            ]
        };
        
        console.log('📤 Sending kelas peminjaman data:', data);
        return await peminjamanAPI.createPeminjaman(data);
    },

    // Create peminjaman untuk absen
    createAbsenPeminjaman: async (absenId, tanggalPeminjaman, keperluan) => {
        const data = {
            tanggal_peminjaman: tanggalPeminjaman,
            notes: keperluan, // Changed from keperluan to notes
            details: [
                {
                    reference_type: "absen",
                    reference_id: absenId
                    // Remove jumlah for absen
                }
            ]
        };
        
        console.log('📤 Sending absen peminjaman data:', data);
        return await peminjamanAPI.createPeminjaman(data);
    },

    // NEW: Create combined peminjaman (multiple items in one request)
    createCombinedPeminjaman: async (tanggalPeminjaman, keperluan, details) => {
        const data = {
            tanggal_peminjaman: tanggalPeminjaman,
            notes: keperluan,
            details: details
        };
        
        console.log('📤 Sending combined peminjaman data:', data);
        return await peminjamanAPI.createPeminjaman(data);
    }
};