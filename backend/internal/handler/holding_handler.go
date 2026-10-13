package handler

import (
	"errors"
	"net/http"

	"stocksim-backend/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

type HoldingHandler struct {
	ctx *svc.ServiceContext
}

func NewHoldingHandler(ctx *svc.ServiceContext) *HoldingHandler {
	return &HoldingHandler{ctx: ctx}
}

// HoldingResponse 持仓响应结构
type HoldingResponse struct {
	ID           int64   `json:"id"`
	StockCode    string  `json:"stock_code"`
	StockName    string  `json:"stock_name"`
	Quantity     int     `json:"quantity"`
	AvgCost      float64 `json:"avg_cost"`
	CurrentPrice float64 `json:"current_price"`
	MarketValue  float64 `json:"market_value"`
	Profit       float64 `json:"profit"`
	ProfitRate   float64 `json:"profit_rate"`
}

// GetHoldingsHandler 获取持仓列表
func (h *HoldingHandler) GetHoldingsHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromContext(r)
		if err != nil {
			httpx.Error(w, errors.New("未授权访问"))
			return
		}

		holdings, err := ctx.HoldingModel.FindByUserID(userID)
		if err != nil {
			httpx.Error(w, errors.New("获取持仓失败"))
			return
		}

		var response []HoldingResponse
		var totalProfit float64 = 0
		var totalMarketValue float64 = 0

		for _, holding := range holdings {
			stock, err := ctx.StockModel.FindByCode(holding.StockCode)
			currentPrice := holding.AvgCost
			if err == nil {
				currentPrice = stock.CurrentPrice
			}

			marketValue := currentPrice * float64(holding.Quantity)
			profit := (currentPrice - holding.AvgCost) * float64(holding.Quantity)
			profitRate := 0.0
			if holding.AvgCost > 0 {
				profitRate = (currentPrice - holding.AvgCost) / holding.AvgCost * 100
			}

			response = append(response, HoldingResponse{
				ID:           holding.ID,
				StockCode:    holding.StockCode,
				StockName:    holding.StockName,
				Quantity:     holding.Quantity,
				AvgCost:      holding.AvgCost,
				CurrentPrice: currentPrice,
				MarketValue:  marketValue,
				Profit:       profit,
				ProfitRate:   profitRate,
			})

			totalProfit += profit
			totalMarketValue += marketValue
		}

		// 获取用户余额
		user, _ := ctx.UserModel.FindOneByID(userID)

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"holdings":           response,
				"total_profit":       totalProfit,
				"total_market_value": totalMarketValue,
				"total_assets":       user.Balance + totalMarketValue,
				"balance":            user.Balance,
				"frozen_balance":     user.FrozenBalance,
				"available_balance":  user.Balance - user.FrozenBalance,
			},
		})
	}
}

// GetHoldingDetailHandler 获取持仓详情
func (h *HoldingHandler) GetHoldingDetailHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromContext(r)
		if err != nil {
			httpx.Error(w, errors.New("未授权访问"))
			return
		}
		// 从URL路径中提取股票代码
		// URL格式: /api/holdings/:code
		path := r.URL.Path
		prefix := "/api/holdings/"
		var code string

		// 手动解析路径参数
		if len(path) > len(prefix) && path[:len(prefix)] == prefix {
			code = path[len(prefix):]
		}

		// 如果路径参数获取失败，尝试从查询参数获取
		if code == "" {
			code = r.URL.Query().Get("code")
		}

		if code == "" {
			httpx.Error(w, errors.New("缺少股票代码参数"))
			return
		}

		holding, err := ctx.HoldingModel.FindByUserAndStock(userID, code)
		if err != nil {
			httpx.Error(w, errors.New("持仓不存在"))
			return
		}

		stock, err := ctx.StockModel.FindByCode(code)
		if err != nil {
			httpx.Error(w, errors.New("股票不存在"))
			return
		}

		marketValue := stock.CurrentPrice * float64(holding.Quantity)
		profit := (stock.CurrentPrice - holding.AvgCost) * float64(holding.Quantity)
		profitRate := 0.0
		if holding.AvgCost > 0 {
			profitRate = (stock.CurrentPrice - holding.AvgCost) / holding.AvgCost * 100
		}

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"holding": HoldingResponse{
					ID:           holding.ID,
					StockCode:    holding.StockCode,
					StockName:    holding.StockName,
					Quantity:     holding.Quantity,
					AvgCost:      holding.AvgCost,
					CurrentPrice: stock.CurrentPrice,
					MarketValue:  marketValue,
					Profit:       profit,
					ProfitRate:   profitRate,
				},
				"stock": stock,
			},
		})
	}
}
