# OpenClaw Agent Ops Dashboard v0.2 - 实现计划

## 执行策略

按照执行计划的 **Phase 1** 优先实现核心可用功能：

### Phase 1（核心可用）
- **Epic A**: Telemetry SDK（埋点）
- **Epic B**: Ingest & Storage（存储）
- **Epic C2**: Session API
- **Epic D3**: Session 页面

## 技术栈选择

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: SQLite（轻量，适合演示）
- **ORM**: Prisma

### Frontend
- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router
- **UI Library**: Element Plus（快速开发）

## 实现顺序

### 第一批：核心后端 + API
1. 数据库Schema设计（sessions, steps, llm_calls, tool_calls）
2. Telemetry Ingest API（事件接收）
3. Session CRUD API
4. 单元测试

### 第二批：核心前端
1. 项目初始化 + 基础架构
2. Layout + Navigation
3. Session List 页面
4. Session Detail + Timeline 页面

### 第三批：功能完善
1. Agent Overview 页面
2. 路由和技能管理
3. 成本统计页面

## Git 提交规范

- feat: 新功能
- fix: Bug修复
- refactor: 重构
- docs: 文档
- chore: 构建/工具

---

**开始时间**: 2026-02-06
**预计完成**: 持续迭代
