import { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('neectify_token');
        if (token) {
            // Em um app real, você decodificaria o JWT aqui para pegar expiração/dados
            setUser({ token }); 
        }
        setLoading(false);
    }, []);

    const login = async (email, senha) => {
        const data = await AuthService.login(email, senha);
        // O backend retorna { "token": "...", "token-type": "Bearer" }
        const token = data.token;
        localStorage.setItem('neectify_token', token);
        setUser({ token });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('neectify_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);