import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, pass);
            // Redirecionamento é automático pois o App observa o estado 'user'
        } catch (err) {
            console.error(err);
            setError("Falha no login. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg">
            {/* Efeitos de Fundo */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center shadow-neon">
                        <span className="text-2xl font-bold text-black">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Neectify Gestão</h1>
                    <p className="text-gray-500 text-sm mt-2">Acesso restrito administrativo</p>
                </div>

                <Card className="backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            label="Email" 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@neectify.com"
                            required
                        />
                        <Input 
                            label="Senha" 
                            type="password" 
                            value={pass} 
                            onChange={e => setPass(e.target.value)} 
                            placeholder="••••••••"
                            required
                        />
                        {error && <div className="text-status-error text-xs bg-status-error/10 p-2 rounded border border-status-error/20">{error}</div>}
                        <Button type="submit" loading={loading} className="w-full mt-4">
                            Entrar no Sistema
                        </Button>
                    </form>
                </Card>
                
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 font-mono">
                        Ambiente Seguro • Criptografia End-to-End
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;