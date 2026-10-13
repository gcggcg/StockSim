import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Stock } from '../types';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const Market: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [marketFilter, setMarketFilter] = useState<'all' | 'SH' | 'SZ'>('all');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  
  // 排序状态
  const [sortBy, setSortBy] = useState<'prev_close' | 'current_price' | 'change_percent'>('change_percent');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // 自动刷新状态
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // 获取股票数据
  const fetchStocks = useCallback(async () => {
    try {
      const response = await apiService.getStocks({
        keyword: searchKeyword || undefined,
        market: marketFilter === 'all' ? undefined : marketFilter,
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        order: order,
      });
      
      if (response.code === 0) {
        setStocks(response.data.stocks || []);
        setTotal(response.data.total || 0);
        setTotalPage(response.data.total_page || 1);
        setLastUpdateTime(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, marketFilter, currentPage, sortBy, order]);

  // 初始加载和参数变化时获取数据
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // 10秒定时刷新
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchStocks();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStocks]);

  // 搜索或筛选变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, marketFilter, sortBy, order]);

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPage) {
      setCurrentPage(page);
    }
  };

  const handleSort = (field: 'prev_close' | 'current_price' | 'change_percent') => {
    if (sortBy === field) {
      // 切换排序方向
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // 切换排序字段，默认倒序
      setSortBy(field);
      setOrder('desc');
    }
  };

  const getSortIcon = (field: 'prev_close' | 'current_price' | 'change_percent') => {
    if (sortBy !== field) return null;
    return order === 'asc' ? '↑' : '↓';
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPage <= maxVisible) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPage - 2) {
        for (let i = totalPage - 4; i <= totalPage; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">股票行情</h1>
          <p className="text-gray-500 mt-1">实时查看沪深两市股票行情</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            最后更新: {lastUpdateTime.toLocaleTimeString()}
          </div>
          <button
            onClick={() => fetchStocks()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">自动刷新(10s)</span>
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索股票代码或名称..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Market Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setMarketFilter('all')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                marketFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setMarketFilter('SH')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                marketFilter === 'SH'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              上海
            </button>
            <button
              onClick={() => setMarketFilter('SZ')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                marketFilter === 'SZ'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              深圳
            </button>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  股票代码
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  股票名称
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  市场
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('prev_close')}
                >
                  昨收价 {getSortIcon('prev_close')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('current_price')}
                >
                  当前价 {getSortIcon('current_price')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('change_percent')}
                >
                  涨跌幅 {getSortIcon('change_percent')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(stocks || []).map((stock) => (
                <tr key={stock.code} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-800">{stock.code}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-800">{stock.name}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        stock.market === 'SH'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {stock.market === 'SH' ? '上海' : '深圳'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-600">
                    ¥{stock.prev_close.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-800">
                    ¥{stock.current_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded ${
                        stock.change_percent >= 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {stock.change_percent >= 0 ? (
                        <ArrowUpRight size={14} className="mr-1" />
                      ) : (
                        <ArrowDownRight size={14} className="mr-1" />
                      )}
                      <span className="font-medium">
                        {formatPercent(stock.change_percent)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      to={`/stock/${stock.code}`}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      交易
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stocks.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">未找到匹配的股票</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPage > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            共 {total} 条记录，第 {currentPage} / {totalPage} 页
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPage}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">股票总数</p>
              <p className="text-2xl font-bold text-gray-800">{total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">上涨</p>
              <p className="text-2xl font-bold text-red-600">
                {(stocks || []).filter((s) => s.change_percent > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">下跌</p>
              <p className="text-2xl font-bold text-green-600">
                {(stocks || []).filter((s) => s.change_percent < 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
