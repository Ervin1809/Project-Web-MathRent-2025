const PRODI_MAP = {
    'H011': {
        'nama': 'Matematika',
        'jenjang': 'Sarjana',
        'fakultas': 'MIPA',
        'range_nomor': /10[0-9][0-9]/ // 1000-1099
    },
    'H081': {
        'nama': 'Aktuaria', 
        'jenjang': 'Sarjana',
        'fakultas': 'MIPA',
        'range_nomor': /10[0-9][0-9]/ // 1000-1099
    },
    'H012': {
        'nama': 'Matematika',
        'jenjang': 'Magister', 
        'fakultas': 'MIPA',
        'range_nomor': /10[0-9][0-9]/ // 1000-1099
    },
    'H013': {
        'nama': 'Matematika',
        'jenjang': 'Doktor',
        'fakultas': 'MIPA', 
        'range_nomor': /10[0-9][0-9]/ // 1000-1099
    },
    'H071': {
        'nama': 'Sistem Informasi',
        'jenjang': 'Sarjana',
        'fakultas': 'MIPA',
        'range_nomor': /(10[0-9][0-9]|109[0-2])/ // 1000-1092
    }
};

export const getProdiFromNIM = (nim) => {
    if (!nim || nim.length < 4) {
        return {
            nama: 'Tidak Diketahui',
            jenjang: '',
            fakultas: '',
            error: 'NIM tidak valid'
        };
    }

    // Extract the first 4 characters for program code
    const prodiCode = nim.substring(0, 4);
    
    // Find matching prodi
    const prodi = PRODI_MAP[prodiCode];
    
    if (!prodi) {
        return {
            nama: 'Tidak Diketahui',
            jenjang: '',
            fakultas: '',
            error: 'Kode prodi tidak ditemukan'
        };
    }

    // Extract nomor mahasiswa part (after prodi code and before year)
    const nomorPart = nim.substring(6, 10); // Assuming format: H071 23 1026
    
    // Validate nomor against range
    if (!prodi.range_nomor.test(nomorPart)) {
        return {
            nama: 'Tidak Diketahui',
            jenjang: '',
            fakultas: '',
            error: 'Nomor mahasiswa tidak sesuai dengan range prodi'
        };
    }

    return {
        nama: prodi.nama,
        jenjang: prodi.jenjang,
        fakultas: prodi.fakultas,
        fullName: `${prodi.nama} (${prodi.jenjang})`
    };
};

export const getAngkatanFromNIM = (nim) => {
    if (!nim || nim.length < 6) {
        return 'Tidak Diketahui';
    }
    
    // Extract year part (characters 4-6)
    const yearPart = nim.substring(4, 6);
    return `20${yearPart}`;
};