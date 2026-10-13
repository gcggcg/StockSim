package config

import "github.com/zeromicro/go-zero/rest"

type Config struct {
	rest.RestConf
	Mysql struct {
		DataSource string
	}
	Auth struct {
		SecretKey string
		ExpireIn  int64
	}
	Trade struct {
		FeeRate     float64
		MinFee      float64
		TaxRate     float64
		MinQuantity int
	}
}
