import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Stock, Holding, AccountBalance } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
} from 'lucide-react';

const StockDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stock, setStock] = useState<Stock | null>(null);
  const [holding, setHolding] = useState<Holding | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trade form state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(100);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!code) return;

      try {
        // 先获取股票信息（不需要登录）
        const stockRes = await apiService.getStockDetail(code);
        
        if (stockRes.code === 0) {
          setStock(stockRes.data);
        } else {
          setError('股票不存在');
          setLoading(false);
          return;
        }

        // 尝试获取账户信息（需要登录）
        try {
          const balanceRes = await apiService.getBalance();
          if (balanceRes.code === 0) {
            setBalance(balanceRes.data);
          }
        } catch (e) {
          console.warn('Failed to fetch balance, user may not be logged in:', e);
        }

        // Try to get holding info
        try {
          const holdingRes = await apiService.getHoldingDetail(code);
          if (holdingRes.code === 0 && holdingRes.data.holding) {
            setHolding(holdingRes.data.holding);
          }
        } catch (e) {
          // User doesn't have this stock or not logged in
          console.warn('Failed to fetch holding:', e);
        }
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  const handleTrade = async () => {
    if (!stock || quantity <= 0 || quantity % 100 !== 0) {
      setTradeMessage({ type: 'error', text: '请输入正确的数量（100的整数倍）' });
      return;
    }

    setTradeLoading(true);
    setTradeMessage(null);

    try {
      const response =
        tradeType === 'buy'
          ? await apiService.buyStock({ stock_code: stock.code, quantity })
          : await apiService.sellStock({ stock_code: stock.code, quantity });

      if (response.code === 0) {
        const action = tradeType === 'buy' ? '买入' : '卖出';
        setTradeMessage({
          type: 'success',
          text: `${action}成功！${action}了 ${response.data.quantity} 股 ${response.data.stock_name}，${tradeType === 'buy' ? '花费' : '收入'} ¥${tradeType === 'buy' ? response.data.total_cost?.toFixed(2) : response.data.net_amount?.toFixed(2)}`,
        });

        // Refresh data
        const [balanceRes, holdingRes] = await Promise.all([
          apiService.getBalance(),
          apiService.getHoldingDetail(stock.code),
        ]);

        if (balanceRes.code === 0) setBalance(balanceRes.data);
        if (holdingRes.code === 0 && holdingRes.data.holding) {
          setHolding(holdingRes.data.holding);
        } else {
          setHolding(null);
        }
      } else {
        setTradeMessage({ type: 'error', text: response.message || '交易失败' });
      }
    } catch (error: any) {
      setTradeMessage({
        type: 'error',
        text: error.response?.data?.message || '交易失败，请重试',
      });
    } finally {
      setTradeLoading(false);
    }
  };

  const calculateMaxBuy = () => {
    if (!stock || !balance) return 0;
    // 手续费按0.03%计算，最低5元
    const feeRate = 0.0003;
    const minFee = 5;
    const available = balance.available_balance;
    // 最大买入数量 = 可用资金 / (价格 + 价格 * 手续费率)
    // 但手续费最低5元，所以需要考虑这个
    const maxByAmount = available / (stock.current_price * (1 + feeRate));
    return Math.floor(maxByAmount / 100) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getTradeAmount = () => {
    if (!stock) return 0;
    const amount = stock.current_price * quantity;
    if (tradeType === 'buy') {
      const fee = Math.max(amount * 0.0003, 5);
      return amount + fee;
    } else {
      const fee = Math.max(amount * 0.0003, 5);
      const tax = amount * 0.001;
      return amount - fee - tax;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || '股票不存在'}</h2>
        <button
          onClick={() => navigate('/market')}
          className="text-indigo-600 hover:underline"
        >
          返回行情页
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回
        </button>
      </div>

      {/* Stock Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{stock.name}</h1>
            <p className="text-gray-500 mt-1">{stock.code} · {stock.industry}</p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              stock.market === 'SH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {stock.market === 'SH' ? '上海' : '深圳'}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-gray-800">
              ¥{stock.current_price.toFixed(2)}
            </p>
            <div
              className={`flex items-center mt-2 ${
                stock.change_percent >= 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {stock.change_percent >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-1" />
              )}
              <span className="text-xl font-semibold">
                {stock.change_percent >= 0 ? '+' : ''}
                {stock.change_percent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">昨收价</p>
            <p className="text-lg font-medium text-gray-800">
              ¥{stock.prev_close.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Trade Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-indigo-600" />
            账户信息
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">可用资金</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(balance?.available_balance || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">持仓市值</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(balance?.market_value || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">总资产</span>
              <span className="font-semibold text-gray-800 text-lg">
                {formatCurrency(balance?.total_assets || 0)}
              </span>
            </div>
            <hr className="my-4" />
            {holding ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">持仓数量</span>
                  <span className="font-medium text-gray-800">{holding.quantity} 股</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">持仓成本</span>
                  <span className="font-medium text-gray-800">
                    ¥{holding.avg_cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">持仓盈亏</span>
                  <span
                    className={`font-medium ${
                      holding.profit >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formatCurrency(holding.profit)} ({formatPercent(holding.profit_rate)})
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无持仓</p>
            )}
          </div>
        </div>

        {/* Trade Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">交易操作</h2>

          {tradeMessage && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                tradeMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {tradeMessage.text}
            </div>
          )}

          {/* Trade Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                tradeType === 'buy'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              买入
            </button>
            <button
              onClick={() => setTradeType('sell')}
              disabled={!holding}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                tradeType === 'sell'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${!holding ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              卖出
            </button>
          </div>

          {/* Stock Price Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">当前价格</span>
              <span className="font-medium text-gray-800">
                ¥{stock.current_price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">交易数量</span>
              <span className="font-medium text-gray-800">{quantity} 股</span>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              买入数量（必须是100的整数倍）
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setQuantity(Math.max(100, quantity - 100))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                -100
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Math.floor(parseInt(e.target.value) / 100) * 100))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 100)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                +100
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setQuantity(100)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                1手
              </button>
              <button
                onClick={() => setQuantity(500)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                5手
              </button>
              <button
                onClick={() => setQuantity(1000)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                10手
              </button>
              <button
                onClick={() => setQuantity(calculateMaxBuy())}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                最大
              </button>
            </div>
          </div>

          {/* Trade Summary */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">交易金额</span>
              <span className="font-medium text-gray-800">
                ¥{(stock.current_price * quantity).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                手续费 {tradeType === 'sell' ? '+ 印花税' : ''}
              </span>
              <span className="font-medium text-gray-800">
                ¥
                {tradeType === 'buy'
                  ? Math.max(stock.current_price * quantity * 0.0003, 5).toFixed(2)
                  : (
                      Math.max(stock.current_price * quantity * 0.0003, 5) +
                      stock.current_price * quantity * 0.001
                    ).toFixed(2)}
              </span>
            </div>
            <hr className="my-2 border-indigo-200" />
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">
                {tradeType === 'buy' ? '总需支付' : '预计收入'}
              </span>
              <span className="font-bold text-lg text-indigo-600">
                {formatCurrency(getTradeAmount())}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          {!balance ? (
            <div className="w-full py-4 rounded-lg bg-gray-100 text-gray-500 text-center">
              请先登录后再进行交易
            </div>
          ) : (
            <button
              onClick={handleTrade}
              disabled={tradeLoading || quantity <= 0}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
                tradeType === 'buy'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {tradeLoading
                ? '交易中...'
                : tradeType === 'buy'
                ? `买入 ${stock.name}`
                : `卖出 ${stock.name}`}
            </button>
          )}

          {/* Warnings */}
          <div className="mt-4 text-xs text-gray-500">
            <p>* 买入数量必须是100的整数倍（1手=100股）</p>
            <p>* 手续费：买入0.03%，卖出0.03%+0.1%印花税</p>
            <p>* 手续费最低5元</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
