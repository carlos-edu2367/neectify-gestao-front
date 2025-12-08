import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Inbox, Clock, TrendingUp, ChevronRight, RefreshCw, Filter } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { SolicitacaoService } from '../services/api';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SolicitacaoModal } from '../components/dashboard/SolicitacaoModal';

// Sub-componente simples para estatísticas
const StatCard = ({ label, value, trend, icon: Icon, color = "text-primary" }) => (
    <Card className="hover:border-primary/30 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-status-success/10 text-status-success border border-status-success/20">
                    {trend}
                </span>
            )}
        </div>
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
        <div className="text-sm text-gray-500 font-mono">{label}</div>
    </Card>
);

const Dashboard = () => {
    const { logout } = useAuth();
    const [view, setView] = useState('dashboard');
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Carregar dados
    const loadData = async () => {
        setLoading(true);
        try {
            // Paginação hardcoded para exemplo, idealmente seria dinâmica
            const data = await SolicitacaoService.listar(1, 50);
            setSolicitacoes(data.solicitacoes || []);
        } catch (error) {
            console.error("Erro ao carregar solicitações:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenDetail = async (id) => {
        try {
            const detail = await SolicitacaoService.ver(id);
            setSelectedDetail(detail);
            // Atualiza localmente o status de 'visto' na lista
            setSolicitacoes(prev => prev.map(s => s.id === id ? {...s, visto: true} : s));
        } catch (error) {
            console.error("Erro ao abrir detalhe:", error);
            alert("Não foi possível carregar os detalhes.");
        }
    };

    const renderContent = () => {
        if (view === 'dashboard') {
            const pendentes = solicitacoes.filter(s => !s.visto).length;
            
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total Recebido" value={solicitacoes.length} trend="+12%" icon={Inbox} />
                        <StatCard label="Pendentes" value={pendentes} trend={pendentes > 0 ? "Atenção" : "Em dia"} icon={Clock} color="text-status-warning" />
                        <StatCard label="Conversão" value="8.4%" trend="+2.1%" icon={TrendingUp} color="text-status-info" />
                    </div>
                    
                    <Card className="p-0" noPadding>
                        <div className="p-5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Últimas Solicitações</h3>
                            <Button variant="ghost" className="text-xs" onClick={() => setView('solicitacoes')}>Ver tudo</Button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 font-mono">Carregando dados...</div>
                            ) : solicitacoes.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 font-mono">Nenhuma solicitação encontrada.</div>
                            ) : (
                                solicitacoes.slice(0, 5).map(s => (
                                    <div key={s.id} onClick={() => handleOpenDetail(s.id)} className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${s.visto ? "bg-gray-700" : "bg-primary shadow-[0_0_8px_#8b5cf6]"}`} />
                                            <div>
                                                <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{s.email}</div>
                                                <div className="text-xs text-gray-500 font-mono">ID: {s.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            );
        }

        if (view === 'solicitacoes') {
            return (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-white">Caixa de Entrada</h2>
                        <div className="flex gap-2">
                            <Button variant="ghost"><Filter size={16} /> Filtros</Button>
                            <Button variant="primary" onClick={loadData}><RefreshCw size={16} /></Button>
                        </div>
                    </div>
                    
                    <div className="grid gap-3">
                        {solicitacoes.map(s => (
                            <Card key={s.id} className="group cursor-pointer hover:border-primary/40 transition-all p-0" noPadding>
                                <div onClick={() => handleOpenDetail(s.id)} className="p-4 flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-bg-subtle font-bold ${!s.visto ? "text-primary bg-primary/10" : "text-gray-500"}`}>
                                            {s.email.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-white truncate">{s.email}</span>
                                            {!s.visto && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">NOVO</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate font-mono">{s.id}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }
        
        return <div className="p-10 text-center text-gray-500">Módulo em construção: {view}</div>;
    };

    return (
        <div className="min-h-screen pl-20 lg:pl-64 pt-6 pr-6 pb-6 bg-black relative">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>

            <Sidebar active={view} onNavigate={setView} onLogout={logout} />

            <AnimatePresence>
                {selectedDetail && (
                    <SolicitacaoModal 
                        solicitacao={selectedDetail} 
                        onClose={() => setSelectedDetail(null)}
                        onUpdate={loadData} // Recarrega lista se houver upload
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;