import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Download, File as FileIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { SolicitacaoService } from '../../services/api';

export const SolicitacaoModal = ({ solicitacao, onClose, onUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    
    if (!solicitacao) return null;

    const handleUpload = async () => {
        if(files.length === 0) return;
        setUploading(true);
        try {
            await SolicitacaoService.upload(solicitacao.id, files);
            alert("Arquivos enviados com sucesso!");
            setFiles([]);
            if (onUpdate) onUpdate(); // Callback para recarregar dados se necessário
        } catch (error) {
            alert("Erro ao enviar arquivos.");
            console.error(error);
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
                            <FileText className="text-primary" size={20} />
                            Detalhes da Solicitação
                        </h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {solicitacao.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
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
                        <label className="text-xs text-gray-500 uppercase font-mono mb-2 block flex justify-between">
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
                            {(!solicitacao.arquivos || solicitacao.arquivos.length === 0) && (
                                <div className="text-xs text-gray-500 italic p-2">Nenhum arquivo anexado.</div>
                            )}
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Adicionar Documentos</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="file" 
                                multiple 
                                onChange={e => setFiles(Array.from(e.target.files))}
                                className="block w-full text-sm text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-primary/10 file:text-primary
                                    hover:file:bg-primary/20 cursor-pointer"
                            />
                            <Button onClick={handleUpload} disabled={uploading || files.length === 0} variant="primary">
                                {uploading ? "Enviando..." : "Enviar Arquivos"}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};