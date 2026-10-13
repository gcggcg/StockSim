package model

import (
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type Stock struct {
	ID            int64     `db:"id" json:"id"`
	Code          string    `db:"code" json:"code"`
	Name          string    `db:"name" json:"name"`
	CurrentPrice  float64   `db:"current_price" json:"current_price"`
	PrevClose     float64   `db:"prev_close" json:"prev_close"`
	ChangePercent float64   `db:"change_percent" json:"change_percent"`
	Market        string    `db:"market" json:"market"`
	Industry      string    `db:"industry" json:"industry"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time `db:"updated_at" json:"updated_at"`
}

type StockModel struct {
	conn sqlx.SqlConn
}

func NewStockModel(conn sqlx.SqlConn) *StockModel {
	return &StockModel{conn: conn}
}

func (m *StockModel) FindAll() ([]*Stock, error) {
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks ORDER BY code")
	var stocks []*Stock
	err := m.conn.QueryRows(&stocks, query)
	if err != nil {
		return nil, err
	}
	return stocks, nil
}

// FindAllWithPage 分页查询所有股票，支持排序
func (m *StockModel) FindAllWithPage(page, pageSize int, sortBy, order string) ([]*Stock, int, error) {
	// 验证排序字段
	validSortFields := map[string]bool{
		"prev_close":     true,
		"current_price":  true,
		"change_percent": true,
	}
	if !validSortFields[sortBy] {
		sortBy = "change_percent"
	}

	// 验证排序方向
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	// 查询总数
	var total int
	countQuery := "SELECT COUNT(*) FROM stocks"
	err := m.conn.QueryRow(&total, countQuery)
	if err != nil {
		return nil, 0, err
	}

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询数据
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks ORDER BY %s %s LIMIT ? OFFSET ?", sortBy, order)
	var stocks []*Stock
	err = m.conn.QueryRows(&stocks, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	return stocks, total, nil
}

func (m *StockModel) FindByCode(code string) (*Stock, error) {
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks WHERE code = ?")
	var stock Stock
	err := m.conn.QueryRow(&stock, query, code)
	if err != nil {
		return nil, err
	}
	return &stock, nil
}

func (m *StockModel) FindByMarket(market string) ([]*Stock, error) {
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks WHERE market = ? ORDER BY code")
	var stocks []*Stock
	err := m.conn.QueryRows(&stocks, query, market)
	if err != nil {
		return nil, err
	}
	return stocks, nil
}

// FindByMarketWithPage 分页查询指定市场的股票，支持排序
func (m *StockModel) FindByMarketWithPage(market string, page, pageSize int, sortBy, order string) ([]*Stock, int, error) {
	// 验证排序字段
	validSortFields := map[string]bool{
		"prev_close":     true,
		"current_price":  true,
		"change_percent": true,
	}
	if !validSortFields[sortBy] {
		sortBy = "change_percent"
	}

	// 验证排序方向
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	// 查询总数
	var total int
	countQuery := "SELECT COUNT(*) FROM stocks WHERE market = ?"
	err := m.conn.QueryRow(&total, countQuery, market)
	if err != nil {
		return nil, 0, err
	}

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询数据
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks WHERE market = ? ORDER BY %s %s LIMIT ? OFFSET ?", sortBy, order)
	var stocks []*Stock
	err = m.conn.QueryRows(&stocks, query, market, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	return stocks, total, nil
}

func (m *StockModel) FindByKeyword(keyword string) ([]*Stock, error) {
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks WHERE code LIKE ? OR name LIKE ? ORDER BY code LIMIT 50")
	var stocks []*Stock
	pattern := "%" + keyword + "%"
	err := m.conn.QueryRows(&stocks, query, pattern, pattern)
	if err != nil {
		return nil, err
	}
	return stocks, nil
}

// FindByKeywordWithPage 分页关键字搜索，支持排序
func (m *StockModel) FindByKeywordWithPage(keyword string, page, pageSize int, sortBy, order string) ([]*Stock, int, error) {
	// 验证排序字段
	validSortFields := map[string]bool{
		"prev_close":     true,
		"current_price":  true,
		"change_percent": true,
	}
	if !validSortFields[sortBy] {
		sortBy = "change_percent"
	}

	// 验证排序方向
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	pattern := "%" + keyword + "%"

	// 查询总数
	var total int
	countQuery := "SELECT COUNT(*) FROM stocks WHERE code LIKE ? OR name LIKE ?"
	err := m.conn.QueryRow(&total, countQuery, pattern, pattern)
	if err != nil {
		return nil, 0, err
	}

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询数据
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks WHERE code LIKE ? OR name LIKE ? ORDER BY %s %s LIMIT ? OFFSET ?", sortBy, order)
	var stocks []*Stock
	err = m.conn.QueryRows(&stocks, query, pattern, pattern, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	return stocks, total, nil
}

func (m *StockModel) FindTopGainers(limit int) ([]*Stock, error) {
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks ORDER BY change_percent DESC LIMIT ?")
	var stocks []*Stock
	err := m.conn.QueryRows(&stocks, query, limit)
	if err != nil {
		return nil, err
	}
	return stocks, nil
}

func (m *StockModel) FindTopLosers(limit int) ([]*Stock, error) {
	query := fmt.Sprintf("SELECT id, code, name, current_price, prev_close, change_percent, market, industry, created_at, updated_at FROM stocks ORDER BY change_percent ASC LIMIT ?")
	var stocks []*Stock
	err := m.conn.QueryRows(&stocks, query, limit)
	if err != nil {
		return nil, err
	}
	return stocks, nil
}

func (m *StockModel) UpdatePrice(code string, price float64, changePercent float64) error {
	query := fmt.Sprintf("UPDATE stocks SET current_price = ?, change_percent = ? WHERE code = ?")
	_, err := m.conn.Exec(query, price, changePercent, code)
	return err
}
