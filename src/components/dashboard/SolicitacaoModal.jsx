import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, File as FileIcon, DollarSign, CheckCircle, User, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SolicitacaoService, ServicoService } from '../../services/api';

export const SolicitacaoModal = ({ solicitacao, onClose, onUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    
    // Estados para criação de serviço
    const [isClosing, setIsClosing] = useState(false);
    const [serviceData, setServiceData] = useState({
        valor_fechado: '',
        forma_pagamento: 'PIX',
        usuario_acompanhamento: '',
        senha: ''
    });
    
    if (!solicitacao) return null;

    const handleUpload = async () => {
        if(files.length === 0) return;
        setUploading(true);
        try {
            await SolicitacaoService.upload(solicitacao.id, files);
            alert("Arquivos enviados com sucesso!");
            setFiles([]);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert("Erro ao enviar arquivos.");
        } finally {
            setUploading(false);
        }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await ServicoService.criar({
                solicitacao_id: solicitacao.id,
                valor_fechado: parseFloat(serviceData.valor_fechado),
                forma_pagamento: serviceData.forma_pagamento,
                usuario_acompanhamento: serviceData.usuario_acompanhamento,
                senha: serviceData.senha
            });
            alert("Contrato fechado e serviço criado com sucesso!");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao criar serviço. Verifique os dados.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-bg-paper border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-bg-subtle">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {isClosing ? <DollarSign className="text-status-success" size={20} /> : <FileText className="text-primary" size={20} />}
                            {isClosing ? "Fechar Contrato & Criar Serviço" : "Detalhes da Solicitação"}
                        </h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {solicitacao.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 relative">
                    <AnimatePresence mode="wait">
                        {!isClosing ? (
                            <motion.div 
                                key="details"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-bg border border-white/5">
                                        <label className="text-xs text-gray-500 uppercase font-mono">Email</label>
                                        <div className="text-sm text-white truncate" title={solicitacao.email}>{solicitacao.email}</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-bg border border-white/5">
                                        <label className="text-xs text-gray-500 uppercase font-mono">Telefone</label>
                                        <div className="text-sm text-white">{solicitacao.telefone || '-'}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-mono mb-2 block">Mensagem</label>
                                    <div className="p-4 rounded-lg bg-bg border border-white/5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {solicitacao.texto || "Sem conteúdo de texto."}
                                    </div>
                                </div>

                                <div>
                                    {/* CORREÇÃO AQUI: Removido 'block', mantido apenas 'flex' */}
                                    <label className="text-xs text-gray-500 uppercase font-mono mb-2 flex justify-between">
                                        <span>Anexos Existentes</span>
                                        <span className="text-primary">{solicitacao.arquivos?.length || 0} arquivos</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {solicitacao.arquivos?.map((f, i) => (
                                            <a key={f.id || i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-primary/5 border border-white/5 hover:border-primary/30 transition-colors group">
                                                <div className="p-2 rounded bg-bg text-primary"><FileIcon size={16} /></div>
                                                <span className="text-xs text-gray-300 truncate flex-1">{f.name || `Arquivo ${i+1}`}</span>
                                                <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex gap-2 flex-1">
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={e => setFiles(Array.from(e.target.files))}
                                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                        />
                                        <Button onClick={handleUpload} disabled={uploading || files.length === 0} variant="ghost" className="border border-white/10">
                                            {uploading ? "..." : "Upload"}
                                        </Button>
                                    </div>
                                    
                                    <Button onClick={() => setIsClosing(true)} className="bg-status-success hover:bg-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        <DollarSign size={16} className="mr-2" /> Fechar Contrato
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
                                    <p className="text-sm text-primary-glow">
                                        Ao criar o serviço, um login será gerado para o cliente acompanhar o progresso.
                                    </p>
                                </div>

                                <form id="service-form" onSubmit={handleCreateService} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="Valor Fechado (R$)"
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 5000.00"
                                            required
                                            value={serviceData.valor_fechado}
                                            onChange={e => setServiceData({...serviceData, valor_fechado: e.target.value})}
                                        />
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Forma de Pagamento</label>
                                            <select 
                                                className="w-full bg-bg-paper border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary"
                                                value={serviceData.forma_pagamento}
                                                onChange={e => setServiceData({...serviceData, forma_pagamento: e.target.value})}
                                            >
                                                <option value="PIX">PIX</option>
                                                <option value="CREDITO">Cartão de Crédito</option>
                                                <option value="DEBITO">Débito</option>
                                                <option value="BOLETO">Boleto</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 my-4 pt-4">
                                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <User size={16} /> Credenciais do Cliente
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input 
                                                label="Usuário de Acesso (Login)"
                                                placeholder="ex: cliente.empresa"
                                                required
                                                value={serviceData.usuario_acompanhamento}
                                                onChange={e => setServiceData({...serviceData, usuario_acompanhamento: e.target.value})}
                                            />
                                            <Input 
                                                label="Senha Inicial"
                                                type="password"
                                                placeholder="••••••••"
                                                required
                                                value={serviceData.senha}
                                                onChange={e => setServiceData({...serviceData, senha: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </form>

                                <div className="border-t border-white/10 pt-4 flex justify-between">
                                    <Button variant="ghost" onClick={() => setIsClosing(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" form="service-form" variant="primary" loading={uploading}>
                                        <CheckCircle size={16} className="mr-2" /> Confirmar Serviço
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};