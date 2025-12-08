import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Inbox, Clock, TrendingUp, ChevronRight, RefreshCw, Filter, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { SolicitacaoService, RelatorioService, ServicoService } from '../services/api';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SolicitacaoModal } from '../components/dashboard/SolicitacaoModal';

const StatCard = ({ label, value, subtext, icon: Icon, color = "text-primary" }) => (
    <Card className="hover:border-primary/30 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
        <div className="text-sm text-gray-500 font-mono">{label}</div>
        {subtext && <div className="text-xs text-gray-600 mt-2 border-t border-white/5 pt-2">{subtext}</div>}
    </Card>
);

const Dashboard = () => {
    const { logout } = useAuth();
    const [view, setView] = useState('dashboard');
    
    // Dados
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal
    const [selectedDetail, setSelectedDetail] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            // Carrega tudo em paralelo
            const [solicitacoesData, statsData] = await Promise.all([
                SolicitacaoService.listar(1, 10), // Apenas as recentes
                RelatorioService.getStats()
            ]);

            setSolicitacoes(solicitacoesData.solicitacoes || []);
            setStats(statsData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadServicos = async () => {
        setLoading(true);
        try {
            const data = await ServicoService.listar(1, 20);
            setServicos(data.servicos || []);
        } catch (error) {
            console.error("Erro ao carregar serviços", error);
        } finally {
            setLoading(false);
        }
    };

    // Efeito para carregar dados ao mudar de aba
    useEffect(() => {
        if (view === 'servicos') {
            loadServicos();
        } else {
            loadData();
        }
    }, [view]);

    const handleOpenDetail = async (id) => {
        try {
            const detail = await SolicitacaoService.ver(id);
            setSelectedDetail(detail);
            // Atualiza localmente 'visto'
            setSolicitacoes(prev => prev.map(s => s.id === id ? {...s, visto: true} : s));
        } catch (error) {
            alert("Erro ao carregar detalhes.");
        }
    };

    const renderContent = () => {
        if (view === 'dashboard') {
            return (
                <div className="space-y-6 animate-fade-in">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                            label="Solicitações (Mês)" 
                            value={stats?.mes_atual?.solicitacoes || 0} 
                            subtext={`Mês anterior: ${stats?.mes_anterior?.solicitacoes || 0}`}
                            icon={Inbox} 
                        />
                        <StatCard 
                            label="Serviços Fechados" 
                            value={stats?.mes_atual?.servicos_fechados || 0} 
                            subtext={`Mês anterior: ${stats?.mes_anterior?.servicos_fechados || 0}`}
                            icon={Briefcase} 
                            color="text-status-success"
                        />
                        <StatCard 
                            label="Pendentes de Leitura" 
                            value={stats?.pendentes || 0} 
                            subtext="Requer atenção imediata"
                            icon={AlertCircle} 
                            color="text-status-warning" 
                        />
                    </div>
                    
                    <Card className="p-0" noPadding>
                        <div className="p-5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Últimas Solicitações</h3>
                            <Button variant="ghost" className="text-xs" onClick={() => setView('solicitacoes')}>Ver tudo</Button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 font-mono">Carregando...</div>
                            ) : solicitacoes.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 font-mono">Sem dados recentes.</div>
                            ) : (
                                solicitacoes.map(s => (
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

        if (view === 'servicos') {
            return (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Serviços Ativos</h2>
                        <Button variant="primary" onClick={loadServicos}><RefreshCw size={16} /></Button>
                    </div>

                    <div className="grid gap-3">
                        {loading ? <div className="text-center text-gray-500">Carregando serviços...</div> : servicos.map(serv => (
                            <Card key={serv.id} className="p-4 flex items-center justify-between group hover:border-status-success/30">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-white">{serv.usuario}</span>
                                        <span className="text-[10px] bg-status-success/10 text-status-success px-1.5 py-0.5 rounded border border-status-success/20 uppercase">
                                            {serv.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">Valor: R$ {serv.valor}</div>
                                </div>
                                <div className="text-right">
                                    <Button variant="ghost" className="text-xs border border-white/10">Gerenciar</Button>
                                </div>
                            </Card>
                        ))}
                        {!loading && servicos.length === 0 && (
                            <div className="p-10 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                Nenhhum serviço encontrado. Feche contratos via "Solicitações".
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Fallback para views antigas
        if (view === 'solicitacoes') {
             return (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Todas Solicitações</h2>
                        <Button variant="primary" onClick={() => loadData()}><RefreshCw size={16} /></Button>
                    </div>
                    {/* Lista reutilizada simplificada para o exemplo */}
                    <div className="grid gap-3">
                        {solicitacoes.map(s => (
                            <Card key={s.id} className="p-4 cursor-pointer hover:bg-white/5" onClick={() => handleOpenDetail(s.id)}>
                                <div className="flex justify-between">
                                    <span className="text-white font-medium">{s.email}</span>
                                    <span className="text-gray-500 text-xs">{s.id.slice(0,8)}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )
        }
        
        return <div className="p-10 text-center text-gray-500">View: {view}</div>;
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
                        onUpdate={loadData} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;