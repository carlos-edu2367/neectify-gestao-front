import { LayoutDashboard, Inbox, Settings, LogOut, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = ({ active, onNavigate, onLogout }) => {
    const menu = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
        { id: 'solicitacoes', icon: Inbox, label: 'Solicitações' },
        { id: 'servicos', icon: Briefcase, label: 'Serviços' }, // Novo item
        { id: 'config', icon: Settings, label: 'Configurações' },
    ];

    return (
        <aside className="w-20 lg:w-64 h-screen fixed left-0 top-0 glass-sidebar flex flex-col z-50 transition-all">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                <div className="w-8 h-8 rounded bg-primary shadow-neon flex items-center justify-center text-black font-bold">N</div>
                <span className="hidden lg:block ml-3 font-bold tracking-tight text-white">Neectify<span className="text-primary">.ai</span></span>
            </div>

            <nav className="flex-1 py-6 space-y-2 px-2 lg:px-4">
                {menu.map(item => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                                ${isActive ? "text-white bg-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"}
                            `}
                        >
                            <Icon size={20} className={isActive ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : ""} />
                            <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full shadow-neon" />
                            )}
                        </button>
                    )
                })}
            </nav>

            <div className="p-2 lg:p-4 border-t border-white/5">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-status-error hover:bg-status-error/5 rounded-lg transition-colors">
                    <LogOut size={20} />
                    <span className="hidden lg:block text-sm">Sair</span>
                </button>
            </div>
        </aside>
    );
};