import axios from 'axios';

const API_URL = "https://neectify-backend-production.up.railway.app/";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('neectify_token');
    if (token) config.headers['token'] = token;
    return config;
}, error => Promise.reject(error));

// Serviços Existentes
export const AuthService = {
    login: async (email, senha) => {
        const { data } = await api.post('/auth/gestao/login', { email, senha, cpf: null });
        return data;
    }
};

export const SolicitacaoService = {
    listar: async (page = 1, limit = 10) => {
        const { data } = await api.get(`/solicitacoes/listar_solicitacoes/${page}/${limit}`);
        return data;
    },
    ver: async (id) => {
        const { data } = await api.get(`/solicitacoes/ver_solicitacao/${id}`);
        return data;
    },
    upload: async (id, files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const { data } = await api.post(`/solicitacoes/add_doc/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }
};

// --- NOVOS SERVIÇOS (ESSENCIAIS PARA O DASHBOARD NÃO TRAVAR) ---

export const RelatorioService = {
    getStats: async () => {
        const { data } = await api.get('/relatorios/dashboard_stats');
        return data;
    }
};

export const ServicoService = {
    listar: async (page = 1, limit = 10) => {
        // Backend definiu rota como /listar_servicos/{limit}/{page}
        const { data } = await api.get(`/servicos/listar_servicos/${limit}/${page}`);
        return data;
    },
    criar: async (payload) => {
        const { data } = await api.post('/servicos/criar_servico', payload);
        return data;
    }
};

export default api;