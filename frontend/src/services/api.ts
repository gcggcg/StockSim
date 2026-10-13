import axios, {AxiosInstance, AxiosError, AxiosResponse} from 'axios';
import {
    ApiResponse,
    AuthResponse,
    Stock,
    HoldingsResponse,
    Transaction,
    TradeRequest,
    TradeResponse,
    AccountBalance,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 请求拦截器，添加token
        this.client.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 响应拦截器 - 返回response.data
        this.client.interceptors.response.use(
            (response: AxiosResponse) => response.data,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    this.clearToken();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        // 初始化时从localStorage恢复token
        this.token = localStorage.getItem('token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getToken(): string | null {
        return this.token;
    }

    // 认证相关
    async register(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
        const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/register', {
            username,
            password,
        });
        const data = response as unknown as ApiResponse<AuthResponse>;
        if (data.code === 0 && data.data.token) {
            this.setToken(data.data.token);
        }
        return data;
    }

    async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
        const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/login', {
            username,
            password,
        });
        const data = response as unknown as ApiResponse<AuthResponse>;
        if (data.code === 0 && data.data.token) {
            this.setToken(data.data.token);
        }
        return data;
    }

    async getUserInfo(): Promise<ApiResponse<any>> {
        return this.client.get('/api/auth/userinfo') as Promise<ApiResponse<any>>;
    }

    // 股票相关
    async getStocks(params?: {
        keyword?: string;
        market?: string;
        page?: number;
        page_size?: number;
        sort_by?: 'prev_close' | 'current_price' | 'change_percent';
        order?: 'asc' | 'desc';
    }): Promise<ApiResponse<{
        stocks: Stock[];
        total: number;
        page: number;
        page_size: number;
        total_page: number;
    }>> {
        const searchParams = new URLSearchParams();
        if (params?.keyword) searchParams.append('keyword', params.keyword);
        if (params?.market) searchParams.append('market', params.market);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
        if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params?.order) searchParams.append('order', params.order);

        const queryString = searchParams.toString();
        const url = queryString ? `/api/stocks?${queryString}` : '/api/stocks';
        return this.client.get(url) as Promise<ApiResponse<{
            stocks: Stock[];
            total: number;
            page: number;
            page_size: number;
            total_page: number;
        }>>;
    }

    async getStockDetail(code: string): Promise<ApiResponse<Stock>> {
        return this.client.get(`/api/stocks/${code}`) as Promise<ApiResponse<Stock>>;
    }

    async getStockRanking(type?: 'gainers' | 'losers'): Promise<ApiResponse<any>> {
        const params = type ? `?type=${type}` : '';
        return this.client.get(`/api/stocks/ranking/list${params}`) as Promise<ApiResponse<any>>;
    }

    // 账户相关
    async getBalance(): Promise<ApiResponse<AccountBalance>> {
        return this.client.get('/api/account/balance') as Promise<ApiResponse<AccountBalance>>;
    }

    // 交易相关
    async buyStock(data: TradeRequest): Promise<ApiResponse<TradeResponse>> {
        return this.client.post('/api/trade/buy', data) as Promise<ApiResponse<TradeResponse>>;
    }

    async sellStock(data: TradeRequest): Promise<ApiResponse<TradeResponse>> {
        return this.client.post('/api/trade/sell', data) as Promise<ApiResponse<TradeResponse>>;
    }

    // 持仓相关
    async getHoldings(): Promise<ApiResponse<HoldingsResponse>> {
        return this.client.get('/api/holdings') as Promise<ApiResponse<HoldingsResponse>>;
    }

    async getHoldingDetail(code: string): Promise<ApiResponse<any>> {
        return this.client.get(`/api/holdings/${code}`) as Promise<ApiResponse<any>>;
    }

    // 交易历史
    async getTransactions(): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> {
        return this.client.get('/api/transactions') as Promise<ApiResponse<{
            transactions: Transaction[];
            total: number
        }>>;
    }
}

export const apiService = new ApiService();
export default apiService;
