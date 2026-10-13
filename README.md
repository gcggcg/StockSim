# 📈 StockSim · 股票模拟交易系统

<p align="center">
  <b>零门槛学炒股 · 无风险练交易 · 全栈开源练手项目</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.23-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TS" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  前端优雅易用，后端稳健清晰 — 5 分钟跑起来，10 分钟看懂代码，适合作为 <b>Go + React 全栈入门 / 课程设计 / 毕设 / 面试作品</b>。
</p>

<p align="center">
  ⭐ 如果这个项目对你有帮助，请点一个 Star，这是对开源作者最大的鼓励！
</p>

---

## 📚 目录

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [在线体验与截图](#-在线体验与截图)
- [技术栈](#️-技术栈)
- [系统架构](#-系统架构)
- [目录结构](#-目录结构)
- [快速开始](#-快速开始)
- [配置说明](#️-配置说明)
- [交易规则](#-交易规则)
- [API 接口一览](#-api-接口一览)
- [常见问题 FAQ](#-常见问题-faq)
- [路线图](#️-路线图)
- [如何贡献](#-如何贡献)
- [许可证](#-许可证)
- [致谢](#-致谢)

---

## 👋 项目简介

**StockSim** 是一个前后端分离的**股票模拟交易平台**。

用户注册后即可获得 **10 万元虚拟启动资金**，在真实感的行情数据中练习买入 / 卖出、查看持仓盈亏、复盘交易历史。不用开户、不花真钱，也能体验完整的 A 股交易流程。

> 适合人群：
>
> - 🎓 想学 **Go（go-zero）+ React** 全栈开发的同学
> - 💼 需要一个**拿得出手的开源作品 / 毕设 / 课设**的求职者
> - 📊 想了解**交易系统核心逻辑**（账户、持仓、撮合、手续费）的新手

一句话总结：**后端负责“算账”，前端负责“好看”，数据库负责“记账”。**

---

## ✨ 功能特性

| 模块 | 能力 | 说明 |
|------|------|------|
| 🔐 用户认证 | 注册 / 登录 / 用户信息 | JWT 鉴权，Token 持久化，未登录自动拦截 |
| 📊 行情中心 | 列表 / 搜索 / 筛选 / 排序 / 分页 | 支持按市场、行业筛选，涨跌幅排行 |
| 📄 股票详情 | 信息展示 + K 线感图表 | 点击任意股票进入详情，直接下单 |
| 💰 模拟交易 | 买入 / 卖出 | 按真实规则计手续费、印花税，最小 1 手 |
| 💼 持仓管理 | 持仓列表 / 盈亏统计 | 平均成本、现价、市值、收益率一目了然 |
| 🧾 交易历史 | 历史成交记录 | 支持买卖方向筛选，方便复盘 |
| 🏦 账户中心 | 余额 / 总资产 / 当日统计 | 可用余额、冻结金额、今日盈亏全展示 |
| 🌗 体验优化 | 响应式 + 暗色模式 + Toast | 移动端可用，表单校验友好 |

---

## 🖥 在线体验与截图

> 本地启动后访问：前端 `http://localhost:8088`，后端 `http://localhost:8080`

| 页面 | 路径 | 功能 |
|------|------|------|
| 🏠 仪表盘 | `/` | 资产概览、今日交易 |
| 📈 行情 | `/market` | 全市场股票列表 |
| 📄 股票详情 | `/stock/:code` | 如 `/stock/600519`，查看 + 交易 |
| 💼 持仓 | `/holdings` | 我的股票和盈亏 |
| 🧾 历史 | `/history` | 所有成交记录 |
| 🏦 账户 | `/account` | 资金明细 |
| 🔑 登录 / 注册 | `/login` `/register` | 无需邮箱，用户名即可注册 |

📌 **想给 README 加截图？** 把截图放到 `docs/images/` 下，然后在这里引用即可：

```markdown
![仪表盘](docs/images/dashboard.png)
![行情页](docs/images/market.png)
```

---

## 🛠️ 技术栈

### 后端 `backend/`

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.23 | 主语言 |
| go-zero | v1.6.4 | Web 框架（路由、配置、日志、MySQL 封装） |
| golang-jwt | v4.5.0 | JWT 签发与校验 |
| golang.org/x/crypto | v0.22.0 | 密码 bcrypt 加密 |
| MySQL | 8.x | 用户 / 股票 / 持仓 / 流水存储 |

### 前端 `frontend/`

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.6.2 | 类型安全 |
| Vite | 6.0.1 | 构建与 dev server（端口 8088） |
| React Router | v6 | 路由 + 登录守卫 |
| Tailwind CSS | 3.4.16 | 原子化样式 |
| Radix UI / shadcn 风格 | - | 高质量组件 |
| Axios | 1.13.6 | 请求封装（自动带 Token、401 跳登录） |
| React Hook Form + Zod | - | 表单 + 校验 |
| Recharts | 2.12.4 | 行情图表 |
| Lucide / sonner / next-themes | - | 图标 / 通知 / 主题 |

> 包管理：前端使用 **pnpm**，后端使用 **go mod**，均无需额外私有源。

---

## 🏗 系统架构

```text
浏览器
  │
  ▼
前端 (React + Vite, :8088)
  │  Axios + Bearer Token
  │  { code, message, data }
  ▼
后端 (go-zero, :8080)
  ├── 公开路由：注册 / 登录 / 行情 / 排行
  └── 鉴权路由 (JWT 中间件)：账户 / 交易 / 持仓 / 历史
  │
  ▼
MySQL (stocksim)
  ├── users        用户 + 余额
  ├── stocks       行情快照 + 20 只示例股
  ├── holdings     持仓 (user_id + stock_code 唯一)
  └── transactions 每次成交流水
```

**一次买入发生了什么？**

```text
前端表单 → POST /api/trade/buy → JWT 校验 → 查余额 → 扣钱
→ 更新/新增持仓(加权平均成本) → 写 transactions → 返回最新余额
```

---

## 📁 目录结构

```text
StockSim/
├── README.md              ← 你正在看的这份文档
├── backend/               # Go 后端
│   ├── main.go            # 入口 + 路由注册
│   ├── go.mod / go.sum
│   ├── etc/config.yaml    # 端口 / MySQL / JWT / 交易费率
│   ├── database/schema.sql# 建库建表 + 20 只示例股票
│   └── internal/
│       ├── config/        # 配置结构体
│       ├── handler/       # auth / stock / trade / holding / account
│       ├── middleware/    # JWT 鉴权中间件
│       ├── model/         # user / stock / holding / transaction
│       └── svc/           # ServiceContext (DB 连接 + Model 聚合)
└── frontend/              # React 前端
    ├── index.html
    ├── vite.config.ts     # 别名 @ → src，dev 端口 8088
    ├── package.json       # pnpm scripts
    ├── src/
    │   ├── App.tsx        # 路由表 + ProtectedRoute / PublicRoute
    │   ├── main.tsx       # React 入口
    │   ├── pages/         # Login / Register / Dashboard / Market
    │   │                   # StockDetail / Holdings / History / Account
    │   ├── components/    # Layout / ErrorBoundary / ui
    │   ├── context/       # AuthContext (全局唯一的全局状态)
    │   ├── services/api.ts# Axios 封装
    │   ├── types/         # User / Stock / Holding / Transaction
    │   └── lib/ hooks/    # cn() / use-mobile 等工具
    └── 设计文档.md         # 更详细的前端设计说明
```

---

## 🚀 快速开始

### 1. 前置要求

| 依赖 | 最低版本 | 检查命令 |
|------|----------|----------|
| Go | 1.23+ | `go version` |
| Node.js | 18+ | `node -v` |
| pnpm | 8+ | `pnpm -v` |
| MySQL | 8.0+ | `mysql --version` |

> 没有 pnpm？执行 `npm install -g pnpm` 即可。

### 2. 克隆项目

```bash
git clone https://github.com/gcggcg/StockSim.git
cd StockSim
```

### 3. 初始化数据库

```bash
# 方式一：命令行导入（推荐）
mysql -u root -p < backend/database/schema.sql

# 方式二：用 Navicat / DBeaver 等工具直接执行 schema.sql
```

执行成功后你会得到：

- 数据库 `stocksim`
- 4 张表：`users / stocks / holdings / transactions`
- 20 只示例股票（贵州茅台、宁德时代、比亚迪……）
- 新用户默认余额 **100000.00**

### 4. 启动后端

```bash
cd backend

# 修改数据库连接（把 IP/密码换成你自己的）
# 文件：etc/config.yaml
# Mysql:
#   DataSource: root:你的密码@tcp(127.0.0.1:3306)/stocksim?charset=utf8mb4&parseTime=true&loc=Local

go mod tidy
go run main.go -f etc/config.yaml
```

看到以下日志即成功：

```text
Starting server at http://0.0.0.0:8080...
```

### 5. 启动前端

```bash
cd frontend

# 安装依赖并启动（dev 脚本已包含 install）
pnpm dev
# 或分两步：
# pnpm install
# pnpm dev -- --port 8088
```

浏览器打开 **http://localhost:8088**，注册一个用户名即可开始交易 🎉

### 6. 构建生产包（可选）

```bash
# 前端构建
cd frontend
pnpm build        # 输出到 dist/
pnpm preview      # 本地预览构建结果

# 后端构建
cd backend
go build -o stocksim-api .
./stocksim-api -f etc/config.yaml
```

---

## ⚙️ 配置说明

### 后端 `backend/etc/config.yaml`

```yaml
Name: stocksim-api
Host: 0.0.0.0
Port: 8080

Mysql:
  DataSource: root:123root@tcp(10.15.144.63:3306)/stocksim?charset=utf8mb4&parseTime=true&loc=Local

Auth:
  SecretKey: stocksim-secret-key-2024  # ⚠️ 生产环境请换成随机长字符串
  ExpireIn: 86400                       # Token 有效期 24h

Trade:
  FeeRate: 0.0003      # 手续费率 0.03%
  MinFee: 5.0          # 最低 5 元
  TaxRate: 0.001       # 印花税 0.1%，仅卖出收
  MinQuantity: 100     # 最小 1 手 = 100 股
```

### 前端环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_URL` | 后端地址 | `http://localhost:8080` |

```bash
# frontend/.env
VITE_API_URL=http://localhost:8080
```

> 前后端跨域已在 `main.go` 中用 `rest.WithCors` 放行，本地联调无需额外配置 Nginx。

---

## 💸 交易规则

和真实 A 股保持一致，新手一看就懂：

- 🎁 注册即送 **100,000 元**虚拟资金
- 📦 最小交易单位 **100 股（1 手）**，且为 100 的整数倍
- 💰 买入成本 = 价格 × 数量 + 手续费（0.03%，最低 5 元）
- 💰 卖出到账 = 价格 × 数量 − 手续费 − 印花税（0.1%）
- 📊 持仓成本按**加权平均**计算，盈亏实时按现价重估
- 🔒 余额不足 / 持仓不足会直接拒绝下单并给出中文提示

---

## 🔌 API 接口一览

Base URL：`http://localhost:8080`，统一响应 `{ code, message, data }`（`code=0` 为成功）。

| 分类 | 方法 | 路径 | 是否要 Token | 说明 |
|------|------|------|--------------|------|
| 认证 | POST | `/api/auth/register` | ❌ | 注册，body: username/password |
| 认证 | POST | `/api/auth/login` | ❌ | 登录，返回 token + 用户信息 |
| 认证 | GET | `/api/auth/userinfo` | ✅ | 当前用户信息 |
| 行情 | GET | `/api/stocks` | ❌ | 股票列表（搜索/分页/排序） |
| 行情 | GET | `/api/stocks/:code` | ❌ | 股票详情 |
| 行情 | GET | `/api/stocks/ranking/list` | ❌ | 涨跌幅排行 |
| 账户 | GET | `/api/account/balance` | ✅ | 余额 / 总资产 / 今日统计 |
| 交易 | POST | `/api/trade/buy` | ✅ | 买入，body: stock_code/quantity |
| 交易 | POST | `/api/trade/sell` | ✅ | 卖出，body: stock_code/quantity |
| 持仓 | GET | `/api/holdings` | ✅ | 持仓列表 + 总盈亏 |
| 持仓 | GET | `/api/holdings/:code` | ✅ | 单只持仓详情 |
| 历史 | GET | `/api/transactions` | ✅ | 成交历史 |

鉴权方式：

```http
Authorization: Bearer <token>
```

> Token 在登录后由前端自动存 `localStorage` 并在每次请求中携带，过期（默认 24h）会自动跳登录页。

---

## ❓ 常见问题 FAQ

**Q1：前端报 `Network Error` / 连不上后端？**
先确认后端在 8080 端口已启动，再检查 `VITE_API_URL` 是否指向后端地址。跨域问题后端已默认放行。

**Q2：`go run` 报连不上 MySQL？**
检查三件事：MySQL 是否启动、`etc/config.yaml` 的 IP/端口/密码是否正确、`stocksim` 库是否已导入 `schema.sql`。

**Q3：`pnpm dev` 端口被占用？**
Vite 配置了 `strictPort: false`，会自动换端口，留意终端输出的实际地址即可。固定想用 8088 可加 `-- --port 8088`。

**Q4：注册后余额是多少？**
默认 10 万元，在 `users.balance` 字段和 `schema.sql` 中定义，学习阶段随便造。

**Q5：生产环境要注意什么？**
必做三件事：换 `SecretKey`、给 MySQL 建最小权限账号、用环境变量覆盖密码，不要把真实密码提交到 Git。

---

## 🗺 路线图

- [ ] K 线图（日 K / 周 K / 月 K 切换）
- [ ] 自选股 + 价格提醒
- [ ] 实时行情推送（WebSocket）
- [ ] React Query 数据缓存 + 骨架屏
- [ ] Vitest 单元测试 + Playwright E2E 补全
- [ ] Docker Compose 一键启动（前端 + 后端 + MySQL）
- [ ] 接入 Sentry / Web Vitals 监控

欢迎在 Issue 里投票你最想要的功能 👇

---

## 🤝 如何贡献

非常欢迎提 PR，一起把这个项目做得更好！

```bash
# 1. Fork 本仓库后克隆
git clone https://github.com/你的用户名/StockSim.git

# 2. 新建分支
git checkout -b feat/你的功能名

# 3. 提交（请写清楚改了什么）
git commit -m "feat: 增加自选股功能"

# 4. 推送并发起 PR
git push origin feat/你的功能名
```

小规范（让 review 更快）：

1. 后端遵循 `go fmt + go vet` 无报错，前端 `pnpm lint` 通过
2. 一个 PR 只做一件事，附上前后截图/GIF 更佳
3. 遇到 Bug 请先提 Issue 描述复现步骤，我们会尽快跟进

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源，你可以自由使用、修改、分发，只需保留原作者署名。

> 如果暂无 LICENSE 文件，建议直接使用 MIT：在仓库根目录新建 `LICENSE` 并写入标准 MIT 文本即可。

---

## 🙏 致谢

- [go-zero](https://github.com/zeromicro/go-zero) —— 好用的 Go 微服务框架
- [Vite](https://vitejs.dev/) / [React](https://react.dev/) / [Tailwind CSS](https://tailwindcss.com/) —— 前端三件套
- [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) —— 优雅的组件灵感
- 所有 Star / Fork / 提 Issue 的朋友们 ❤️

---

<p align="center">
  用 ❤️ 写代码，用模拟盘练心态 — 祝你在 StockSim 里稳定盈利，早日实盘见红 📈
</p>
