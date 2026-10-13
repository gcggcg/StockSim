package svc

import (
	"stocksim-backend/internal/config"
	"stocksim-backend/internal/model"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config           config.Config
	UserModel        *model.UserModel
	StockModel       *model.StockModel
	HoldingModel     *model.HoldingModel
	TransactionModel *model.TransactionModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	// 连接MySQL数据库
	conn := sqlx.NewMysql(c.Mysql.DataSource)

	return &ServiceContext{
		Config:           c,
		UserModel:        model.NewUserModel(conn),
		StockModel:       model.NewStockModel(conn),
		HoldingModel:     model.NewHoldingModel(conn),
		TransactionModel: model.NewTransactionModel(conn),
	}
}
