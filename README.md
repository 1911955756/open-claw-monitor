# 🦞 OpenClaw Agent Ops Dashboard v0.2

OpenClaw Agent 可观测与运维监控面板 - 前后端分离架构

## 📁 项目结构

```
claw_monitor/
├── backend/                 # 后端 API 服务
│   ├── src/
│   │   ├── index.ts       # Express 入口
│   │   ├── routes/        # API 路由
│   │   │   ├── telemetry.ts   # 埋点事件接收
│   │   │   ├── sessions.ts    # Session 管理
│   │   │   ├── agents.ts      # Agent 管理
│   │   │   └── health.ts      # 健康检查
│   │   └── utils/        # 工具函数
│   ├── prisma/           # 数据库 schema
│   ├── package.json
│   └── Dockerfile
│
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── main.ts        # Vue 入口
│   │   ├── App.vue        # 根组件
│   │   ├── router/        # 路由配置
│   │   ├── views/         # 页面组件
│   │   │   ├── Overview.vue       # 总览页
│   │   │   ├── Agents.vue         # Agent 列表
│   │   │   ├── AgentDetail.vue    # Agent 详情
│   │   │   ├── Sessions.vue       # Session 列表
│   │   │   ├── SessionDetail.vue  # Session 详情
│   │   │   └── SessionTimeline.vue # 时间线
│   │   ├── components/    # 公共组件
│   │   └── api/           # API 服务
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml     # Docker 部署配置
└── README.md
```

## 🚀 快速开始

### 本地开发

**后端**

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

**前端**

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### Docker 部署

```bash
docker-compose up -d
```

访问 http://localhost

## 📊 功能特性

### Phase 1（核心可用）

- ✅ **Session 管理**
  - Session 列表和详情
  - Session 时间线视图
  - Step 追踪

- ✅ **Agent 管理**
  - Agent 概览
  - Agent 详情和统计
  - Skills 使用统计

- ✅ **Telemetry SDK**
  - Session 生命周期事件
  - Step 生命周期事件
  - LLM 和 Tool 调用事件
  - Batch 事件接收

### Phase 2（规划中）

- 🔄 Call Tree 视图
- 🔄 全局调用拓扑图
- 🔄 Routing 规则可视化

### Phase 3（规划中）

- 🔄 Skills 注册表
- 🔄 成本和 Token 统计
- 🔄 实时运行监控

## 🔧 技术栈

### Backend
- Node.js + TypeScript
- Express.js
- Prisma + SQLite
- Winston Logger

### Frontend
- Vue 3 + TypeScript
- Element Plus
- Pinia + Vue Router
- Vite

## 📡 API 文档

### Telemetry API

```
POST /api/telemetry/session/started   # Session 开始
POST /api/telemetry/session/completed # Session 完成
POST /api/telemetry/step/started    # Step 开始
POST /api/telemetry/step/completed   # Step 完成
POST /api/telemetry/llm/call        # LLM 调用
POST /api/telemetry/tool/call        # Tool 调用
POST /api/telemetry/batch           # 批量事件
```

### Session API

```
GET  /api/sessions                    # Session 列表
GET  /api/sessions/:id                # Session 详情
GET  /api/sessions/:id/timeline       # Session 时间线
GET  /api/sessions/:id/stats          # Session 统计
DELETE /api/sessions/:id              # 删除 Session
```

### Agent API

```
GET /api/agents               # Agent 列表
GET /api/agents/:id          # Agent 详情
GET /api/agents/:id/skills    # Agent Skills
```

## 📝 参考文档

- [技术规范 v0.2](./docs/TECHNICAL_SPEC_v0.2.md)
- [前端架构文档](./docs/FRONTEND_IA_v0.2.md)

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT

---

**版本**: 0.1.0  
**状态**: Phase 1 开发中
