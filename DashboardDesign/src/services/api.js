import axios from 'axios';

// Base URL FastAPI backend
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API functions
export const authAPI = {
    login: (credentials) => api.post('/auth/login-simple', credentials),
    register: (userData) => api.post('/auth/register', userData),
    createStaff: (staffData) => api.post('/auth/create-staff', staffData),
    me: () => api.get('/auth/me'),
};

export const peminjamanAPI = {
    // Mahasiswa endpoints
    create: (data) => api.post('/peminjaman/', data),
    getMy: (params) => api.get('/peminjaman/my', { params }),
    updateMy: (id, data) => api.put(`/peminjaman/my/${id}`, data),
    deleteMy: (id) => api.delete(`/peminjaman/my/${id}`),

    // Staff endpoints
    getAll: (params) => api.get('/peminjaman/', { params }),
    getPending: (params) => api.get('/peminjaman/pending', { params }),
    getDetail: (id) => api.get(`/peminjaman/${id}`),
    approve: (id, data) => api.put(`/peminjaman/${id}/approve`, data),
    delete: (id) => api.delete(`/peminjaman/${id}`),

    // Available items
    getAvailableItems: () => api.get('/peminjaman/available-items'),
};

export const barangAPI = {
    getAll: (params) => api.get('/barang/', { params }),
    getTersedia: () => api.get('/barang/tersedia'),
    create: (data) => api.post('/barang/', data),
    update: (id, data) => api.put(`/barang/${id}`, data),
    updateStatus: (id, data) => api.patch(`/barang/${id}/status`, data),
    delete: (id) => api.delete(`/barang/${id}`),
};

export const kelasAPI = {
    getAll: (params) => api.get('/kelas/', { params }),
    getTersedia: () => api.get('/kelas/tersedia'),
    getDetail: (id) => api.get(`/kelas/${id}`),
    create: (data) => api.post('/kelas/', data),
    update: (id, data) => api.put(`/kelas/${id}`, data),
    updateStatus: (id, data) => api.patch(`/kelas/${id}/status`, data),
    delete: (id) => api.delete(`/kelas/${id}`),
};

export const absenAPI = {
    getAll: (params) => api.get('/absen/', { params }),
    getDetail: (id) => api.get(`/absen/${id}`),
    searchByMatakuliah: (params) => api.get('/absen/search/matakuliah', { params }),
    getByDosen: (name, params) => api.get(`/absen/dosen/${name}`, { params }),
    create: (data) => api.post('/absen/', data),
    update: (id, data) => api.put(`/absen/${id}`, data),
    delete: (id) => api.delete(`/absen/${id}`),
};

export default api;