import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Transaction } from '../types';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiService.getTransactions();
        if (response.code === 0) {
          setTransactions(response.data.transactions || []);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-2xl font-bold text-gray-800">交易历史</h1>
        <p className="text-gray-500 mt-1">查看所有买卖记录</p>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  股票
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  方向
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手续费
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  印花税
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(transactions || []).length > 0 ? (
                (transactions || []).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-800">
                        {formatDate(tx.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">{tx.stock_name}</div>
                      <div className="text-sm text-gray-500">{tx.stock_code}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          tx.direction === 'buy'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {tx.direction === 'buy' ? (
                          <ArrowUpRight size={12} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={12} className="mr-1" />
                        )}
                        {tx.direction === 'buy' ? '买入' : '卖出'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      ¥{tx.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      {tx.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-600">
                      {formatCurrency(tx.fee)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-600">
                      {formatCurrency(tx.tax)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.status === 'completed'
                          ? '已完成'
                          : tx.status === 'pending'
                          ? '处理中'
                          : '已取消'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">暂无交易记录</p>
                    <Link
                      to="/market"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      去行情页看看
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      {(transactions || []).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">总交易次数</p>
            <p className="text-2xl font-bold text-gray-800">{(transactions || []).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">买入次数</p>
            <p className="text-2xl font-bold text-red-600">
              {(transactions || []).filter((t) => t.direction === 'buy').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">卖出次数</p>
            <p className="text-2xl font-bold text-green-600">
              {(transactions || []).filter((t) => t.direction === 'sell').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
