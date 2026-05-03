/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/auth/me`, {
                    withCredentials: true,
                    validateStatus: (status) => status === 200 || status === 401 || status === 404,
                });

                if (res.status === 401 || res.status === 404) {
                    setUser(null);
                    localStorage.removeItem('user');
                } else {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
            } catch (err) {
                if (err.response?.status && err.response.status !== 401) {
                    console.error("Session verification failed:", err.message);
                }
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE}/api/auth/logout`, {}, {
                withCredentials: true
            });
        } catch (err) {
            console.error("Server-side logout failed:", err.message);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
