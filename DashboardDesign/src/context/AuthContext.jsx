import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await authAPI.me();
                    setUser(response.data);
                } catch (error) {
                    // Token invalid, clear it
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { access_token, user: userData } = response.data;

            // Save to localStorage
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update state
            setToken(access_token);
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const register = async (userData) => {
        try {
            console.log('🔄 AuthContext: Attempting registration with:', userData);
            const response = await authAPI.register(userData);
            console.log('✅ AuthContext: Register response:', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ AuthContext: Registration error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isMahasiswa: user?.role === 'mahasiswa',
        isStaff: user?.role === 'staff'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};