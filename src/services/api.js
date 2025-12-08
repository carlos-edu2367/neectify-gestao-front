import axios from 'axios';

// Ajuste para a URL do seu backend FastAPI
const API_URL = "https://neectify-backend-production.up.railway.app";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para injetar o token em todas as requisições
api.interceptors.request.use(config => {
    const token = localStorage.getItem('neectify_token');
    if (token) {
        // Seu backend espera o header 'token', não 'Authorization'
        config.headers['token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para tratar expiração de token (401/403)
api.interceptors.response.use(response => response, error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Opcional: Redirecionar para login ou limpar storage
        // localStorage.removeItem('neectify_token');
        // window.location.href = '/login';
    }
    return Promise.reject(error);
});

export const AuthService = {
    // Endpoint: /auth/gestao/login
    login: async (email, senha) => {
        const { data } = await api.post('/auth/gestao/login', { 
            email, 
            senha, 
            cpf: null // Schema pede cpf opcional, enviamos null
        });
        return data;
    }
};

export const SolicitacaoService = {
    // Endpoint: /solicitacoes/listar_solicitacoes/{page}/{limit}
    listar: async (page = 1, limit = 10) => {
        const { data } = await api.get(`/solicitacoes/listar_solicitacoes/${page}/${limit}`);
        return data;
    },

    // Endpoint: /solicitacoes/ver_solicitacao/{id}
    ver: async (id) => {
        const { data } = await api.get(`/solicitacoes/ver_solicitacao/${id}`);
        return data;
    },

    // Endpoint: /solicitacoes/add_doc/{id}
    upload: async (id, files) => {
        const formData = new FormData();
        // O backend espera 'files: list[UploadFile]'
        files.forEach(file => {
            formData.append('files', file);
        });

        const { data } = await api.post(`/solicitacoes/add_doc/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    }
};

export default api;