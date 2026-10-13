package handler

import (
	"errors"
	"net/http"
	"stocksim-backend/internal/model"
	"strconv"

	"stocksim-backend/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest/httpx"
)

type StockHandler struct {
	ctx *svc.ServiceContext
}

func NewStockHandler(ctx *svc.ServiceContext) *StockHandler {
	return &StockHandler{ctx: ctx}
}

// GetStocksHandler 获取股票列表
func (h *StockHandler) GetStocksHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		keyword := r.URL.Query().Get("keyword")
		market := r.URL.Query().Get("market")

		// 分页参数
		page := 1
		pageSize := 10
		if p := r.URL.Query().Get("page"); p != "" {
			if pageNum, err := strconv.Atoi(p); err == nil && pageNum > 0 {
				page = pageNum
			}
		}
		if ps := r.URL.Query().Get("page_size"); ps != "" {
			if size, err := strconv.Atoi(ps); err == nil && size > 0 {
				pageSize = size
			}
		}

		// 排序参数：sort_by (prev_close, current_price, change_percent)
		// order: asc 或 desc，默认 desc
		sortBy := r.URL.Query().Get("sort_by")
		if sortBy == "" {
			sortBy = "change_percent" // 默认按涨跌幅排序
		}
		order := r.URL.Query().Get("order")
		if order == "" {
			order = "desc" // 默认倒序
		}

		var stocks []*model.Stock
		var total int
		var err error

		if keyword != "" {
			stocks, total, err = ctx.StockModel.FindByKeywordWithPage(keyword, page, pageSize, sortBy, order)
		} else if market != "" {
			stocks, total, err = ctx.StockModel.FindByMarketWithPage(market, page, pageSize, sortBy, order)
		} else {
			stocks, total, err = ctx.StockModel.FindAllWithPage(page, pageSize, sortBy, order)
		}

		if err != nil {
			httpx.Error(w, errors.New("获取股票列表失败"))
			return
		}

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"stocks":     stocks,
				"total":      total,
				"page":       page,
				"page_size":  pageSize,
				"total_page": (total + pageSize - 1) / pageSize,
			},
		})
	}
}

// GetStockDetailHandler 获取股票详情
func (h *StockHandler) GetStockDetailHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 从URL路径中提取股票代码
		// URL格式: /api/stocks/:code
		logx.Infof("---------------------获取股票详情: %v \n", r.URL.Path)

		path := r.URL.Path
		prefix := "/api/stocks/"
		var code string

		// 手动解析路径参数
		if len(path) > len(prefix) && path[:len(prefix)] == prefix {
			code = path[len(prefix):]
		}

		logx.Infof("---------------------提取的股票代码: %v \n", code)

		// 如果路径参数获取失败，尝试从查询参数获取
		if code == "" {
			code = r.URL.Query().Get("code")
		}

		if code == "" {
			httpx.Error(w, errors.New("缺少股票代码参数"))
			return
		}

		logx.Infof("------------------- 查询股票代码: %s ------------------", code)
		stock, err := ctx.StockModel.FindByCode(code)
		if err != nil {
			httpx.Error(w, errors.New("股票不存在"))
			return
		}
		logx.Infof("------------------- 股票信息: %v ------------------", stock)

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data":    stock,
		})
	}
}

// GetStockRankingHandler 获取股票排行榜
func (h *StockHandler) GetStockRankingHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		typ := r.URL.Query().Get("type") // gainers or losers

		var gainers []*model.Stock
		var losers []*model.Stock
		var err error

		gainers, err = ctx.StockModel.FindTopGainers(10)
		if err != nil {
			httpx.Error(w, errors.New("获取涨幅榜失败"))
			return
		}

		losers, err = ctx.StockModel.FindTopLosers(10)
		if err != nil {
			httpx.Error(w, errors.New("获取跌幅榜失败"))
			return
		}

		var data interface{}
		switch typ {
		case "gainers":
			data = gainers
		case "losers":
			data = losers
		default:
			data = map[string]interface{}{
				"gainers": gainers,
				"losers":  losers,
			}
		}

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data":    data,
		})
	}
}
