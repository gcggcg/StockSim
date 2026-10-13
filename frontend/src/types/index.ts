// 用户相关类型
export interface User {
  id: number;
  username: string;
  balance: number;
  frozen_balance: number;
}

export interface AuthResponse {
  user_id: number;
  username: string;
  token: string;
  balance: number;
  frozen_balance?: number;
}

// 股票相关类型
export interface Stock {
  id: number;
  code: string;
  name: string;
  current_price: number;
  prev_close: number;
  change_percent: number;
  market: string;
  industry: string;
}

// 持仓相关类型
export interface Holding {
  id: number;
  stock_code: string;
  stock_name: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  profit: number;
  profit_rate: number;
}

export interface HoldingsResponse {
  holdings: Holding[];
  total_profit: number;
  total_market_value: number;
  total_assets: number;
  balance: number;
  frozen_balance: number;
  available_balance: number;
}

// 交易相关类型
export interface Transaction {
  id: number;
  stock_code: string;
  stock_name: string;
  direction: 'buy' | 'sell';
  price: number;
  quantity: number;
  amount: number;
  fee: number;
  tax: number;
  status: string;
  created_at: string;
}

export interface TradeRequest {
  stock_code: string;
  quantity: number;
}

export interface TradeResponse {
  stock_code: string;
  stock_name: string;
  price: number;
  quantity: number;
  amount: number;
  fee: number;
  tax?: number;
  total_cost?: number;
  net_amount?: number;
  profit?: number;
  balance: number;
}

// 账户相关类型
export interface AccountBalance {
  balance: number;
  frozen_balance: number;
  available_balance: number;
  market_value: number;
  total_assets: number;
  today_buy_total: number;
  today_sell_total: number;
  today_profit: number;
  total_profit?: number;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
