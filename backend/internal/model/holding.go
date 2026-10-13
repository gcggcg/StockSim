package model

import (
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type Holding struct {
	ID        int64     `db:"id" json:"id"`
	UserID    int64     `db:"user_id" json:"user_id"`
	StockCode string    `db:"stock_code" json:"stock_code"`
	StockName string    `db:"stock_name" json:"stock_name"`
	Quantity  int       `db:"quantity" json:"quantity"`
	AvgCost   float64   `db:"avg_cost" json:"avg_cost"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type HoldingModel struct {
	conn sqlx.SqlConn
}

func NewHoldingModel(conn sqlx.SqlConn) *HoldingModel {
	return &HoldingModel{conn: conn}
}

func (m *HoldingModel) FindByUserID(userID int64) ([]*Holding, error) {
	query := fmt.Sprintf("SELECT id, user_id, stock_code, stock_name, quantity, avg_cost, created_at, updated_at FROM holdings WHERE user_id = ? AND quantity > 0 ORDER BY updated_at DESC")
	var holdings []*Holding
	err := m.conn.QueryRows(&holdings, query, userID)
	if err != nil {
		return nil, err
	}
	return holdings, nil
}

func (m *HoldingModel) FindByUserAndStock(userID int64, stockCode string) (*Holding, error) {
	query := fmt.Sprintf("SELECT id, user_id, stock_code, stock_name, quantity, avg_cost, created_at, updated_at FROM holdings WHERE user_id = ? AND stock_code = ?")
	var holding Holding
	err := m.conn.QueryRow(&holding, query, userID, stockCode)
	if err != nil {
		return nil, err
	}
	return &holding, nil
}

func (m *HoldingModel) Insert(userID int64, stockCode, stockName string, quantity int, avgCost float64) error {
	query := fmt.Sprintf("INSERT INTO holdings (user_id, stock_code, stock_name, quantity, avg_cost) VALUES (?, ?, ?, ?, ?)")
	_, err := m.conn.Exec(query, userID, stockCode, stockName, quantity, avgCost)
	return err
}

func (m *HoldingModel) UpdateQuantity(userID int64, stockCode string, quantity int, avgCost float64) error {
	query := fmt.Sprintf("UPDATE holdings SET quantity = ?, avg_cost = ? WHERE user_id = ? AND stock_code = ?")
	result, err := m.conn.Exec(query, quantity, avgCost, userID, stockCode)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("holding not found")
	}
	return nil
}

func (m *HoldingModel) Delete(userID int64, stockCode string) error {
	query := fmt.Sprintf("DELETE FROM holdings WHERE user_id = ? AND stock_code = ?")
	_, err := m.conn.Exec(query, userID, stockCode)
	return err
}

// UpdateOrInsert 更新或插入持仓
func (m *HoldingModel) UpdateOrInsert(userID int64, stockCode, stockName string, quantity int, avgCost float64) error {
	_, err := m.FindByUserAndStock(userID, stockCode)
	if err != nil {
		// 不存在，插入新记录
		return m.Insert(userID, stockCode, stockName, quantity, avgCost)
	}

	if quantity <= 0 {
		// 数量为0，删除持仓记录
		return m.Delete(userID, stockCode)
	}

	// 存在，更新数量和成本
	return m.UpdateQuantity(userID, stockCode, quantity, avgCost)
}
