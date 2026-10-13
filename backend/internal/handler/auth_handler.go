package handler

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"stocksim-backend/internal/middleware"
	"stocksim-backend/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest/httpx"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	ctx *svc.ServiceContext
}

func NewAuthHandler(ctx *svc.ServiceContext) *AuthHandler {
	return &AuthHandler{ctx: ctx}
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterHandler 处理用户注册
func (h *AuthHandler) RegisterHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		fmt.Printf("开始请求: %v\n", r)
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}
		fmt.Printf("获取请求体: %v\n", req)
		// 验证输入
		if strings.TrimSpace(req.Username) == "" || len(req.Username) < 3 {
			httpx.Error(w, errors.New("用户名至少需要3个字符"))
			return
		}
		if len(req.Password) < 6 {
			httpx.Error(w, errors.New("密码至少需要6个字符"))
			return
		}

		// 检查用户名是否已存在
		existingUser, err := ctx.UserModel.FindOneByUsername(req.Username)
		if err == nil && existingUser != nil {
			httpx.Error(w, errors.New("用户名已存在"))
			return
		}

		// 加密密码
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			httpx.Error(w, errors.New("密码加密失败"))
			return
		}

		// 创建用户
		userID, err := ctx.UserModel.Insert(req.Username, string(hashedPassword))
		if err != nil {
			httpx.Error(w, errors.New("创建用户失败"+err.Error()))
			return
		}

		// 生成Token
		token, err := middleware.GenerateToken(userID, req.Username)
		if err != nil {
			httpx.Error(w, errors.New("生成token失败"))
			return
		}

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "注册成功",
			"data": map[string]interface{}{
				"user_id":  userID,
				"username": req.Username,
				"token":    token,
				"balance":  100000.00,
			},
		})
	}
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginHandler 处理用户登录
func (h *AuthHandler) LoginHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		// 查找用户
		user, err := ctx.UserModel.FindOneByUsername(req.Username)
		if err != nil {
			httpx.Error(w, errors.New("用户名或密码错误"))
			return
		}

		// 验证密码
		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
		if err != nil {
			httpx.Error(w, errors.New("用户名或密码错误"))
			return
		}

		// 生成Token
		token, err := middleware.GenerateToken(user.ID, user.Username)
		if err != nil {
			httpx.Error(w, errors.New("生成token失败"))
			return
		}

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "登录成功",
			"data": map[string]interface{}{
				"user_id":        user.ID,
				"username":       user.Username,
				"token":          token,
				"balance":        user.Balance,
				"frozen_balance": user.FrozenBalance,
			},
		})
	}
}

// GetUserInfoHandler 获取用户信息
func (h *AuthHandler) GetUserInfoHandler(ctx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logx.Infof("获取用户权限信息: %v", r.Header.Get("Authorization"))
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

		httpx.OkJson(w, map[string]interface{}{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"user_id":        user.ID,
				"username":       user.Username,
				"balance":        user.Balance,
				"frozen_balance": user.FrozenBalance,
				"created_at":     user.CreatedAt,
			},
		})
	}
}
