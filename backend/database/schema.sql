-- StockSim 模拟交易系统数据库初始化脚本
-- 数据库：stocksim

CREATE DATABASE IF NOT EXISTS stocksim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stocksim;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    balance DECIMAL(15,2) NOT NULL DEFAULT 100000.00 COMMENT '账户余额',
    frozen_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '冻结金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 股票表
CREATE TABLE IF NOT EXISTS stocks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE COMMENT '股票代码',
    name VARCHAR(100) NOT NULL COMMENT '股票名称',
    current_price DECIMAL(10,2) NOT NULL COMMENT '当前价格',
    prev_close DECIMAL(10,2) NOT NULL COMMENT '昨收价',
    change_percent DECIMAL(10,2) NOT NULL COMMENT '涨跌幅%',
    market VARCHAR(10) NOT NULL COMMENT '市场（SH/SZ）',
    industry VARCHAR(50) DEFAULT '未知' COMMENT '所属行业',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_market (market),
    INDEX idx_change_percent (change_percent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票表';

-- 持仓表
CREATE TABLE IF NOT EXISTS holdings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    stock_code VARCHAR(10) NOT NULL COMMENT '股票代码',
    stock_name VARCHAR(100) NOT NULL COMMENT '股票名称',
    quantity INT NOT NULL DEFAULT 0 COMMENT '持仓数量',
    avg_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '平均成本',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_stock (user_id, stock_code),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='持仓表';

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    stock_code VARCHAR(10) NOT NULL COMMENT '股票代码',
    stock_name VARCHAR(100) NOT NULL COMMENT '股票名称',
    direction ENUM('buy', 'sell') NOT NULL COMMENT '交易方向',
    price DECIMAL(10,2) NOT NULL COMMENT '成交价格',
    quantity INT NOT NULL COMMENT '成交数量',
    amount DECIMAL(15,2) NOT NULL COMMENT '成交金额',
    fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '手续费',
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '印花税',
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_stock_code (stock_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易记录表';

-- 插入模拟股票数据
INSERT INTO stocks (code, name, current_price, prev_close, change_percent, market, industry) VALUES
('600519', '贵州茅台', 1688.00, 1720.50, -1.89, 'SH', '白酒'),
('000858', '五粮液', 142.50, 145.30, -1.93, 'SZ', '白酒'),
('002475', '立讯精密', 49.83, 49.11, 1.47, 'SZ', '消费电子'),
('000001', '平安银行', 11.25, 11.10, 1.35, 'SZ', '银行'),
('600036', '招商银行', 35.60, 35.20, 1.14, 'SH', '银行'),
('601318', '中国平安', 45.80, 45.50, 0.66, 'SH', '保险'),
('000333', '美的集团', 58.90, 58.50, 0.68, 'SZ', '家电'),
('600276', '恒瑞医药', 52.30, 51.80, 0.97, 'SH', '医药'),
('002594', '比亚迪', 268.50, 265.00, 1.32, 'SZ', '汽车'),
('601888', '中国中免', 72.50, 71.80, 0.97, 'SH', '旅游'),
('000725', '京东方A', 4.25, 4.20, 1.19, 'SZ', '面板'),
('600030', '中信证券', 22.80, 22.50, 1.33, 'SH', '证券'),
('002230', '科大讯飞', 48.90, 48.20, 1.45, 'SZ', 'AI'),
('300750', '宁德时代', 198.50, 195.00, 1.79, 'SZ', '新能源'),
('688981', '中芯国际', 52.30, 51.80, 0.97, 'SH', '半导体'),
('601012', '隆基绿能', 28.50, 28.10, 1.42, 'SH', '光伏'),
('002415', '海康威视', 35.80, 35.40, 1.13, 'SZ', '安防'),
('000002', '万科A', 8.95, 9.10, -1.65, 'SZ', '房地产'),
('600900', '长江电力', 28.60, 28.40, 0.70, 'SH', '电力'),
('601398', '工商银行', 5.45, 5.40, 0.93, 'SH', '银行');
