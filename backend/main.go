package main

import (
	"flag"
	"stocksim-backend/internal/config"
	"stocksim-backend/internal/handler"
	"stocksim-backend/internal/middleware"
	"stocksim-backend/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/service"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "./etc/config.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)
	logx.Infof("config file is %s,配置文件: %+v", *configFile, c)
	ctx := svc.NewServiceContext(c)
	// 自定义跨域问题
	domains := []string{"*", "http://127.0.0.1", "http://10.15.46.24", "http://localhost"}
	server := rest.MustNewServer(rest.RestConf{
		ServiceConf: service.ServiceConf{
			Name: "stocksim-api",
			Mode: "dev",
		},
		Port: 8080,
	}, rest.WithCors(domains...))

	// 注册路由
	registerHandlers(server, ctx)

	logx.Infof("Starting server at http://0.0.0.0:8080...")
	server.Start()
}

func registerHandlers(server *rest.Server, ctx *svc.ServiceContext) {
	// 公开路由（无需认证）
	server.AddRoutes(
		[]rest.Route{
			{
				Method:  "POST",
				Path:    "/api/auth/register",
				Handler: handler.NewAuthHandler(ctx).RegisterHandler(ctx),
			},
			{
				Method:  "POST",
				Path:    "/api/auth/login",
				Handler: handler.NewAuthHandler(ctx).LoginHandler(ctx),
			},
			{
				Method:  "GET",
				Path:    "/api/stocks",
				Handler: handler.NewStockHandler(ctx).GetStocksHandler(ctx),
			},
			{
				Method:  "GET",
				Path:    "/api/stocks/:code",
				Handler: handler.NewStockHandler(ctx).GetStockDetailHandler(ctx),
			},
			{
				Method:  "GET",
				Path:    "/api/stocks/ranking/list",
				Handler: handler.NewStockHandler(ctx).GetStockRankingHandler(ctx),
			},
		},
	)

	// 受保护的路由（需要认证）
	authMiddleware := middleware.NewAuthMiddleware().Handle

	server.AddRoutes(
		[]rest.Route{
			// 用户信息
			{
				Method:  "GET",
				Path:    "/api/auth/userinfo",
				Handler: authMiddleware(handler.NewAuthHandler(ctx).GetUserInfoHandler(ctx)),
			},
			// 账户
			{
				Method:  "GET",
				Path:    "/api/account/balance",
				Handler: authMiddleware(handler.NewAccountHandler(ctx).GetBalanceHandler(ctx)),
			},
			// 交易
			{
				Method:  "POST",
				Path:    "/api/trade/buy",
				Handler: authMiddleware(handler.NewTradeHandler(ctx).BuyStockHandler(ctx)),
			},
			{
				Method:  "POST",
				Path:    "/api/trade/sell",
				Handler: authMiddleware(handler.NewTradeHandler(ctx).SellStockHandler(ctx)),
			},
			// 持仓
			{
				Method:  "GET",
				Path:    "/api/holdings",
				Handler: authMiddleware(handler.NewHoldingHandler(ctx).GetHoldingsHandler(ctx)),
			},
			{
				Method:  "GET",
				Path:    "/api/holdings/:code",
				Handler: authMiddleware(handler.NewHoldingHandler(ctx).GetHoldingDetailHandler(ctx)),
			},
			// 交易历史
			{
				Method:  "GET",
				Path:    "/api/transactions",
				Handler: authMiddleware(handler.NewTransactionHandler(ctx).GetTransactionsHandler(ctx)),
			},
		},
	)
}
