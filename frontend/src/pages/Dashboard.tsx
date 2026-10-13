import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { AccountBalance, Stock, Holding } from '../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, rankingRes, holdingsRes] = await Promise.all([
          apiService.getBalance(),
          apiService.getStockRanking(),
          apiService.getHoldings(),
        ]);

        if (balanceRes.code === 0) {
          setBalance(balanceRes.data);
        }
        if (rankingRes.code === 0) {
          setGainers(rankingRes.data.gainers?.slice(0, 5) || []);
          setLosers(rankingRes.data.losers?.slice(0, 5) || []);
        }
        if (holdingsRes.code === 0) {
          setHoldings(holdingsRes.data.holdings?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，{user?.username}！</h1>
        <p className="opacity-90">今天是模拟交易的好日子</p>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">总资产</span>
            <Wallet className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(balance?.total_assets || user?.balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">账户资金 + 市值</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">可用资金</span>
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(balance?.available_balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">可用于买入股票</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">持仓市值</span>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(balance?.market_value || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {(holdings || []).length} 只股票
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">持仓盈亏</span>
            {(balance?.total_profit || 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-600" />
            )}
          </div>
          <p
            className={`text-2xl font-bold ${
              (balance?.total_profit || 0) >= 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(balance?.total_profit || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">实时盈亏</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">涨幅榜</h2>
            <Link to="/market" className="text-indigo-600 text-sm hover:underline">
              查看更多
            </Link>
          </div>
          <div className="divide-y">
            {(gainers || []).map((stock) => (
              <Link
                key={stock.code}
                to={`/stock/${stock.code}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{stock.name}</p>
                  <p className="text-sm text-gray-500">{stock.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">
                    ¥{stock.current_price.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-600 flex items-center justify-end">
                    <ArrowUpRight size={14} className="mr-1" />
                    {formatPercent(stock.change_percent)}
                  </p>
                </div>
              </Link>
            ))}
            {(gainers || []).length === 0 && (
              <div className="p-8 text-center text-gray-500">暂无数据</div>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">跌幅榜</h2>
            <Link to="/market" className="text-indigo-600 text-sm hover:underline">
              查看更多
            </Link>
          </div>
          <div className="divide-y">
            {(losers || []).map((stock) => (
              <Link
                key={stock.code}
                to={`/stock/${stock.code}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{stock.name}</p>
                  <p className="text-sm text-gray-500">{stock.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">
                    ¥{stock.current_price.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 flex items-center justify-end">
                    <ArrowDownRight size={14} className="mr-1" />
                    {formatPercent(stock.change_percent)}
                  </p>
                </div>
              </Link>
            ))}
            {(losers || []).length === 0 && (
              <div className="p-8 text-center text-gray-500">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      {/* My Holdings Preview */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">我的持仓</h2>
          <Link to="/holdings" className="text-indigo-600 text-sm hover:underline">
            查看全部
          </Link>
        </div>
        {(holdings || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    股票
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    持仓数量
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成本价
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    当前价
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    盈亏
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(holdings || []).map((holding) => (
                  <tr key={holding.stock_code} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">{holding.stock_name}</div>
                      <div className="text-sm text-gray-500">{holding.stock_code}</div>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      {holding.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      ¥{holding.avg_cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      ¥{holding.current_price.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-medium ${
                        holding.profit >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      <div>{formatCurrency(holding.profit)}</div>
                      <div className="text-sm">
                        {formatPercent(holding.profit_rate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">暂无持仓</p>
            <Link
              to="/market"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              去行情页看看
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/market"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">行情</span>
        </Link>
        <Link
          to="/holdings"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <span className="font-medium text-gray-800">持仓</span>
        </Link>
        <Link
          to="/history"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <span className="font-medium text-gray-800">历史</span>
        </Link>
        <Link
          to="/account"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Wallet className="h-5 w-5 text-orange-600" />
          </div>
          <span className="font-medium text-gray-800">账户</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
