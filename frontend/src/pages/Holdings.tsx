import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Holding, HoldingsResponse } from '../types';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Holdings: React.FC = () => {
  const [data, setData] = useState<HoldingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const response = await apiService.getHoldings();
        if (response.code === 0) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch holdings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">我的持仓</h1>
        <p className="text-gray-500 mt-1">查看当前持有的股票</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">总资产</span>
            <Wallet className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data?.total_assets || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">可用资金</span>
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data?.available_balance || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">持仓市值</span>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data?.total_market_value || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">持仓盈亏</span>
            {(data?.total_profit || 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-600" />
            )}
          </div>
          <p
            className={`text-2xl font-bold ${
              (data?.total_profit || 0) >= 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(data?.total_profit || 0)}
          </p>
        </div>
      </div>

      {/* Holdings List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  持仓市值
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  盈亏金额
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  盈亏比例
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.holdings && data.holdings.length > 0 ? (
                data.holdings.map((holding) => (
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
                    <td className="px-4 py-4 text-right text-gray-800">
                      ¥{holding.market_value.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-medium ${
                        holding.profit >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(holding.profit)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded ${
                          holding.profit_rate >= 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {holding.profit_rate >= 0 ? (
                          <ArrowUpRight size={12} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={12} className="mr-1" />
                        )}
                        {formatPercent(holding.profit_rate)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link
                        to={`/stock/${holding.stock_code}`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        交易
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-gray-500 mb-4">暂无持仓</p>
                    <Link
                      to="/market"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      去行情页看看
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
