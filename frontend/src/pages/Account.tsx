import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AccountBalance } from '../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const Account: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await apiService.getBalance();
        if (response.code === 0) {
          setBalance(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    refreshUser();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        <h1 className="text-2xl font-bold text-gray-800">账户中心</h1>
        <p className="text-gray-500 mt-1">管理您的账户信息</p>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.username}</h2>
            <p className="opacity-90 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              注册日期：{formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">总资产</span>
            <Wallet className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(balance?.total_assets || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">账户资金 + 持仓市值</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">可用资金</span>
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(balance?.available_balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">可用于买入股票</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">冻结资金</span>
            <Wallet className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(balance?.frozen_balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">挂单中冻结的资金</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">持仓市值</span>
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(balance?.market_value || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">当前持仓价值</p>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">今日统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <ArrowUpRight className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日买入</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(balance?.today_buy_total || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <ArrowDownRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日卖出</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(balance?.today_sell_total || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                (balance?.today_profit || 0) >= 0 ? 'bg-red-100' : 'bg-green-100'
              }`}
            >
              {(balance?.today_profit || 0) >= 0 ? (
                <TrendingUp className="h-6 w-6 text-red-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">今日盈亏</p>
              <p
                className={`text-xl font-bold ${
                  (balance?.today_profit || 0) >= 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatCurrency(balance?.today_profit || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">账户操作</h3>
        <div className="space-y-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-medium text-gray-800">退出登录</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>免责声明：</strong>本系统仅为模拟交易平台，所有交易数据均为虚拟，不构成任何投资建议。股市有风险，投资需谨慎。
        </p>
      </div>
    </div>
  );
};

export default Account;
