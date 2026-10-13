package handler

import (
	"errors"
	"net/http"

	"stocksim-backend/internal/model"
	"stocksim-backend/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

type TradeHandler struct {
	ctx *svc.ServiceContext
}

func NewTradeHandler(ctx *svc.ServiceContext) *TradeHandler {
	return &TradeHandler{ctx: ctx}
}

// BuyRequest 买入请求
type BuyRequest struct {
	StockCode string `json:"stock_code"`
	Quantity  int    `json:"quantity"`
}

// BuyStockHandler 买入股票
func (h *TradeHandler) BuyStockHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromContext(r)
		if err != nil {
			httpx.Error(w, errors.New("未授权访问"))
			return
		}

		var req BuyRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, errors.New("参数错误"))
			return
		}

		// 验证股票
		stock, err := h.ctx.StockModel.FindByCode(req.StockCode)
		if err != nil {
			httpx.Error(w, errors.New("股票不存在"))
			return
		}

		// 验证数量（必须是100的整数倍）
		if req.Quantity <= 0 || req.Quantity%100 != 0 {
			httpx.Error(w, errors.New("买入数量必须是100的整数倍"))
			return
		}

		// 计算金额和费用
		amount := stock.CurrentPrice * float64(req.Quantity)
		fee := amount * 0.0003 // 0.03%手续费
		if fee < 5 {
			fee = 5 // 最低5元
		}
		totalCost := amount + fee

		// 获取用户信息
		user, err := h.ctx.UserModel.FindOneByID(userID)
		if err != nil {
			httpx.Error(w, errors.New("用户不存在"))
			return
		}

		// 验证余额
		if user.Balance < totalCost {
			httpx.Error(w, errors.New("余额不足"))
			return
		}

		// 冻结资金
		err = h.ctx.UserModel.FreezeBalance(userID, totalCost)
		if err != nil {
			httpx.Error(w, errors.New("余额不足，无法冻结"))
			return
		}

		// 解冻并扣除（简化流程，直接扣除）
		h.ctx.UserModel.UnfreezeAndDeduct(userID, totalCost)
		h.ctx.UserModel.UpdateBalance(userID, user.Balance-totalCost)

		// 更新持仓
		holding, err := h.ctx.HoldingModel.FindByUserAndStock(userID, req.StockCode)
		if err != nil {
			// 新持仓
			avgCost := stock.CurrentPrice + (fee / float64(req.Quantity))
			h.ctx.HoldingModel.Insert(userID, req.StockCode, stock.Name, req.Quantity, avgCost)
		} else {
			// 更新持仓成本
			totalQuantity := holding.Quantity + req.Quantity
			totalCostHolding := (holding.AvgCost * float64(holding.Quantity)) + (stock.CurrentPrice * float64(req.Quantity))
			newAvgCost := totalCostHolding / float64(totalQuantity)
			h.ctx.HoldingModel.UpdateQuantity(userID, req.StockCode, totalQuantity, newAvgCost)
		}

		// 创建交易记录
		tx := &model.Transaction{
			UserID:    userID,
			StockCode: req.StockCode,
			StockName: stock.Name,
			Direction: "buy",
			Price:     stock.CurrentPrice,
			Quantity:  req.Quantity,
			Amount:    amount,
			Fee:       fee,
			Tax:       0,
			Status:    "completed",
		}
		h.ctx.TransactionModel.Insert(tx)

		// 重新获取更新后的用户信息
		updatedUser, _ := h.ctx.UserModel.FindOneByID(userID)

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "买入成功",
			"data": map[string]interface{}{
				"stock_code": req.StockCode,
				"stock_name": stock.Name,
				"price":      stock.CurrentPrice,
				"quantity":   req.Quantity,
				"amount":     amount,
				"fee":        fee,
				"total_cost": totalCost,
				"balance":    updatedUser.Balance,
			},
		})
	}
}

// SellRequest 卖出请求
type SellRequest struct {
	StockCode string `json:"stock_code"`
	Quantity  int    `json:"quantity"`
}

// SellStockHandler 卖出股票
func (h *TradeHandler) SellStockHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromContext(r)
		if err != nil {
			httpx.Error(w, errors.New("未授权访问"))
			return
		}
		var req SellRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, errors.New("参数错误"))
			return
		}
		// 验证数量
		if req.Quantity <= 0 || req.Quantity%100 != 0 {
			httpx.Error(w, errors.New("卖出数量必须是100的整数倍"))
			return
		}
		// 获取持仓
		holding, err := ctx.HoldingModel.FindByUserAndStock(userID, req.StockCode)
		if err != nil || holding.Quantity < req.Quantity {
			httpx.Error(w, errors.New("持仓不足"))
			return
		}
		// 验证股票
		stock, err := ctx.StockModel.FindByCode(req.StockCode)
		if err != nil {
			httpx.Error(w, errors.New("股票不存在"))
			return
		}
		// 计算金额和费用
		amount := stock.CurrentPrice * float64(req.Quantity)
		fee := amount * 0.0003 // 0.03%手续费
		if fee < 5 {
			fee = 5
		}
		tax := amount * 0.001 // 0.1%印花税
		netAmount := amount - fee - tax

		// 更新持仓
		newQuantity := holding.Quantity - req.Quantity
		if newQuantity <= 0 {
			ctx.HoldingModel.Delete(userID, req.StockCode)
		} else {
			ctx.HoldingModel.UpdateQuantity(userID, req.StockCode, newQuantity, holding.AvgCost)
		}

		// 增加用户余额
		user, _ := ctx.UserModel.FindOneByID(userID)
		ctx.UserModel.UpdateBalance(userID, user.Balance+netAmount)

		// 创建交易记录
		tx := &model.Transaction{
			UserID:    userID,
			StockCode: req.StockCode,
			StockName: stock.Name,
			Direction: "sell",
			Price:     stock.CurrentPrice,
			Quantity:  req.Quantity,
			Amount:    amount,
			Fee:       fee,
			Tax:       tax,
			Status:    "completed",
		}
		ctx.TransactionModel.Insert(tx)

		// 重新获取更新后的用户信息
		updatedUser, _ := ctx.UserModel.FindOneByID(userID)

		// 计算盈亏
		profit := netAmount - (holding.AvgCost * float64(req.Quantity))

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "卖出成功",
			"data": map[string]interface{}{
				"stock_code": req.StockCode,
				"stock_name": stock.Name,
				"price":      stock.CurrentPrice,
				"quantity":   req.Quantity,
				"amount":     amount,
				"fee":        fee,
				"tax":        tax,
				"net_amount": netAmount,
				"profit":     profit,
				"balance":    updatedUser.Balance,
			},
		})
	}
}
