package model

import (
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ *sqlx.SqlConn

type User struct {
	ID            int64     `db:"id" json:"id"`
	Username      string    `db:"username" json:"username"`
	Password      string    `db:"password" json:"-"`
	Balance       float64   `db:"balance" json:"balance"`
	FrozenBalance float64   `db:"frozen_balance" json:"frozen_balance"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time `db:"updated_at" json:"updated_at"`
}

type UserModel struct {
	conn sqlx.SqlConn
}

func NewUserModel(conn sqlx.SqlConn) *UserModel {
	return &UserModel{conn: conn}
}

func (m *UserModel) FindOneByUsername(username string) (*User, error) {
	query := fmt.Sprintf("SELECT id, username, password, balance, frozen_balance, created_at, updated_at FROM users WHERE username = ?")
	var user User
	err := m.conn.QueryRow(&user, query, username)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (m *UserModel) FindOneByID(id int64) (*User, error) {
	query := fmt.Sprintf("SELECT id, username, password, balance, frozen_balance, created_at, updated_at FROM users WHERE id = ?")
	var user User
	err := m.conn.QueryRow(&user, query, id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (m *UserModel) Insert(username, password string) (int64, error) {
	query := fmt.Sprintf("INSERT INTO users (username, password, balance, frozen_balance) VALUES (?, ?, 100000.00, 0.00)")
	result, err := m.conn.Exec(query, username, password)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (m *UserModel) UpdateBalance(id int64, balance float64) error {
	query := fmt.Sprintf("UPDATE users SET balance = ? WHERE id = ?")
	_, err := m.conn.Exec(query, balance, id)
	return err
}

func (m *UserModel) UpdateFrozenBalance(id int64, frozenBalance float64) error {
	query := fmt.Sprintf("UPDATE users SET frozen_balance = ? WHERE id = ?")
	_, err := m.conn.Exec(query, frozenBalance, id)
	return err
}

func (m *UserModel) FreezeBalance(id int64, amount float64) error {
	query := fmt.Sprintf("UPDATE users SET balance = balance - ?, frozen_balance = frozen_balance + ? WHERE id = ? AND balance >= ?")
	result, err := m.conn.Exec(query, amount, amount, id, amount)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("insufficient balance")
	}
	return nil
}

func (m *UserModel) UnfreezeAndDeduct(id int64, amount float64) error {
	query := fmt.Sprintf("UPDATE users SET frozen_balance = frozen_balance - ? WHERE id = ? AND frozen_balance >= ?")
	result, err := m.conn.Exec(query, amount, id, amount)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("insufficient frozen balance")
	}
	return nil
}

func (m *UserModel) UnfreezeAndReturn(id int64, amount float64) error {
	query := fmt.Sprintf("UPDATE users SET frozen_balance = frozen_balance - ?, balance = balance + ? WHERE id = ? AND frozen_balance >= ?")
	result, err := m.conn.Exec(query, amount, amount, id, amount)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("insufficient frozen balance")
	}
	return nil
}

func (m *UserModel) AddBalance(id int64, amount float64) error {
	query := fmt.Sprintf("UPDATE users SET balance = balance + ? WHERE id = ?")
	_, err := m.conn.Exec(query, amount, id)
	return err
}
