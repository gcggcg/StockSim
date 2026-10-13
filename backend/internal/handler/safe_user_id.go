package handler

import (
	"errors"
	"net/http"
)

// getUserIDFromContext 从context中安全获取user_id
func getUserIDFromContext(r *http.Request) (int64, error) {
	userIDInterface := r.Context().Value("user_id")
	if userIDInterface == nil {
		return 0, errors.New("user_id not found in context")
	}
	userID, ok := userIDInterface.(int64)
	if !ok {
		return 0, errors.New("invalid user_id type")
	}
	return userID, nil
}
