package handler

import (
	"errors"
	"net/http"

	"stocksim-backend/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

type AccountHandler struct {
	ctx *svc.ServiceContext
}

func NewAccountHandler(ctx *svc.ServiceContext) *AccountHandler {
	return &AccountHandler{ctx: ctx}
}

// GetBalanceHandler 获取账户资金
func (h *AccountHandler) GetBalanceHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromContext(r)
		if err != nil {
			httpx.Error(w, errors.New("未授权访问"))
			return
		}

		user, err := ctx.UserModel.FindOneByID(userID)
		if err != nil {
			httpx.Error(w, errors.New("用户不存在"))
			return
		}

		// 获取持仓市值
		holdings, _ := ctx.HoldingModel.FindByUserID(userID)
		var totalMarketValue float64 = 0
		for _, holding := range holdings {
			stock, err := ctx.StockModel.FindByCode(holding.StockCode)
			if err == nil {
				totalMarketValue += stock.CurrentPrice * float64(holding.Quantity)
			}
		}

		// 获取今日统计
		buyTotal, sellTotal, _ := ctx.TransactionModel.GetTodayStats(userID)

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"balance":           user.Balance,
				"frozen_balance":    user.FrozenBalance,
				"available_balance": user.Balance - user.FrozenBalance,
				"market_value":      totalMarketValue,
				"total_assets":      user.Balance + totalMarketValue,
				"today_buy_total":   buyTotal,
				"today_sell_total":  sellTotal,
				"today_profit":      sellTotal - buyTotal,
			},
		})
	}
}

// TransactionHandler 交易记录处理器
type TransactionHandler struct {
	ctx *svc.ServiceContext
}

func NewTransactionHandler(ctx *svc.ServiceContext) *TransactionHandler {
	return &TransactionHandler{ctx: ctx}
}

// GetTransactionsHandler 获取交易历史
func (h *TransactionHandler) GetTransactionsHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromContext(r)
		if err != nil {
			httpx.Error(w, errors.New("未授权访问"))
			return
		}

		// 获取分页参数
		page := 1
		pageSize := 20

		transactions, err := ctx.TransactionModel.FindByUserID(userID, pageSize, (page-1)*pageSize)
		if err != nil {
			httpx.Error(w, errors.New("获取交易记录失败"))
			return
		}

		total, _ := ctx.TransactionModel.CountByUserID(userID)

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"transactions": transactions,
				"total":        total,
				"page":         page,
				"page_size":    pageSize,
			},
		})
	}
}
