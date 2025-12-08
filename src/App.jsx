import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';



// Componente de Loading com Estética Neon
const LoadingScreen = () => (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center relative overflow-hidden">
        {/* Efeito de Fundo (Glow) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Spinner Central */}
        <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Anéis giratórios */}
                <div className="absolute inset-0 border-2 border-primary/30 border-t-primary rounded-full animate-spin shadow-neon" />
                <div className="absolute inset-2 border-2 border-purple-500/30 border-b-purple-500 rounded-full animate-spin [animation-duration:1.5s]" />
                
                {/* Logo Central Pulsante */}
                <div className="w-8 h-8 bg-primary rounded shadow-[0_0_15px_rgba(139,92,246,0.5)] flex items-center justify-center text-black font-bold text-lg animate-pulse">
                    N
                </div>
            </div>
            <span className="text-gray-500 font-mono text-xs tracking-[0.2em] animate-pulse">INICIALIZANDO...</span>
        </div>
    </div>
);

// Componente Guarda de Rota Protegida
// Verifica se o usuário existe; se não, redireciona para /login
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <LoadingScreen />;

    if (!user) {
        // Redireciona para login, mas salva a localização que tentou acessar
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Guarda de Rota Pública (para Login)
// Se já estiver logado, não deve acessar /login, manda para /dashboard
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingScreen />;
    
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rota Pública: Login */}
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />

                {/* Rota Protegida: Dashboard */}
                {/* O asterisco * permite que o Dashboard gerencie sub-rotas se necessário no futuro */}
                <Route 
                    path="/dashboard/*" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Redirecionamentos Padrão */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;