package model

import (
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type Transaction struct {
	ID        int64     `db:"id" json:"id"`
	UserID    int64     `db:"user_id" json:"user_id"`
	StockCode string    `db:"stock_code" json:"stock_code"`
	StockName string    `db:"stock_name" json:"stock_name"`
	Direction string    `db:"direction" json:"direction"` // buy or sell
	Price     float64   `db:"price" json:"price"`
	Quantity  int       `db:"quantity" json:"quantity"`
	Amount    float64   `db:"amount" json:"amount"`
	Fee       float64   `db:"fee" json:"fee"`
	Tax       float64   `db:"tax" json:"tax"`
	Status    string    `db:"status" json:"status"` // pending, completed, cancelled
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type TransactionModel struct {
	conn sqlx.SqlConn
}

func NewTransactionModel(conn sqlx.SqlConn) *TransactionModel {
	return &TransactionModel{conn: conn}
}

func (m *TransactionModel) Insert(tx *Transaction) (int64, error) {
	query := fmt.Sprintf("INSERT INTO transactions (user_id, stock_code, stock_name, direction, price, quantity, amount, fee, tax, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	result, err := m.conn.Exec(query, tx.UserID, tx.StockCode, tx.StockName, tx.Direction, tx.Price, tx.Quantity, tx.Amount, tx.Fee, tx.Tax, tx.Status)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (m *TransactionModel) FindByUserID(userID int64, limit, offset int) ([]*Transaction, error) {
	query := fmt.Sprintf("SELECT id, user_id, stock_code, stock_name, direction, price, quantity, amount, fee, tax, status, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
	var transactions []*Transaction
	err := m.conn.QueryRows(&transactions, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

func (m *TransactionModel) FindByUserIDAndDirection(userID int64, direction string, limit, offset int) ([]*Transaction, error) {
	query := fmt.Sprintf("SELECT id, user_id, stock_code, stock_name, direction, price, quantity, amount, fee, tax, status, created_at FROM transactions WHERE user_id = ? AND direction = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
	var transactions []*Transaction
	err := m.conn.QueryRows(&transactions, query, userID, direction, limit, offset)
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

func (m *TransactionModel) FindByUserIDAndStock(userID int64, stockCode string) ([]*Transaction, error) {
	query := fmt.Sprintf("SELECT id, user_id, stock_code, stock_name, direction, price, quantity, amount, fee, tax, status, created_at FROM transactions WHERE user_id = ? AND stock_code = ? ORDER BY created_at DESC")
	var transactions []*Transaction
	err := m.conn.QueryRows(&transactions, query, userID, stockCode)
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

func (m *TransactionModel) CountByUserID(userID int64) (int64, error) {
	query := fmt.Sprintf("SELECT COUNT(*) FROM transactions WHERE user_id = ?")
	var count int64
	err := m.conn.QueryRow(&count, query, userID)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (m *TransactionModel) GetTodayStats(userID int64) (float64, float64, error) {
	// 获取今日买入总额和卖出总额
	query := `
		SELECT
			COALESCE(SUM(CASE WHEN direction = 'buy' THEN amount + fee ELSE 0 END), 0) as buy_total,
			COALESCE(SUM(CASE WHEN direction = 'sell' THEN amount - fee - tax ELSE 0 END), 0) as sell_total
		FROM transactions
		WHERE user_id = ? AND DATE(created_at) = CURDATE() AND status = 'completed'
	`
	var buyTotal, sellTotal float64
	err := m.conn.QueryRow(&struct{ buy, sell *float64 }{&buyTotal, &sellTotal}, query, userID)
	if err != nil {
		return 0, 0, err
	}
	return buyTotal, sellTotal, nil
}

func (m *TransactionModel) GetTotalProfitLoss(userID int64) (float64, error) {
	// 计算历史总盈亏（卖出收益 - 卖出成本）
	query := `
		SELECT COALESCE(SUM(CASE WHEN direction = 'sell' THEN amount - fee - tax ELSE 0 END), 0) as sell_total
		FROM transactions
		WHERE user_id = ? AND status = 'completed'
	`
	var total float64
	err := m.conn.QueryRow(&total, query, userID)
	if err != nil {
		return 0, err
	}
	return total, nil
}
