# jiucai-stock-mcp

一个基于 Model Context Protocol (MCP) 的股票数据服务，用于获取韭研公社的股票相关数据和财经资讯。

> 本项目仅供技术学习用途。

## 功能特性

- 📊 **文章热度排行榜** - 获取韭研公社热门股票文章排行榜数据
- ⏰ **财经事件时间轴** - 查询重要财经事件和投资机会
- 🔧 **MCP 标准兼容** - 基于 Model Context Protocol 构建，易于集成
- ⚡ **高性能 API** - 使用 TypeScript 和现代化工具链

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行服务

```bash
npm start
```

### 客户端集成

```json
{
  "mcpServers": {
    "jiucai-stock": {
      "command": "node",
      "args": ["/path/to/project/dist/index.js"],
      "env": {}
    }
  }
}
```

## MCP 工具说明

### 1. get_article_ranking - 文章热度排行榜

获取韭研公社文章热度排行榜数据，用于分析市场热点和投资者关注度。

**参数：**
- `timeRange` (可选): 时间范围
  - `day` - 今日 (默认)
  - `week` - 本周
  - `month` - 本月
- `category` (可选): 文章分类
  - `all` - 全部 (默认)
  - `stock` - 个股研究
  - `industry` - 题材行业
  - `news` - 资讯萃取
  - `memo` - 纪要转载
- `limit` (可选): 返回文章数量限制，默认 20 篇 (1-100)

**使用示例：**
```json
{
  "name": "get_article_ranking",
  "arguments": {
    "timeRange": "day",
    "category": "stock",
    "limit": 10
  }
}
```

### 2. get_timeline_events - 财经事件时间轴

获取韭研公社财经事件时间轴数据，用于分析重要财经事件和投资机会。

**参数：**
- `startDate` (可选): 开始日期，格式：YYYY-MM-DD
- `endDate` (可选): 结束日期，格式：YYYY-MM-DD
- `eventType` (可选): 事件类型
  - `all` - 全部 (默认)
  - `earnings` - 财报
  - `policy` - 政策
  - `merger` - 并购
  - `investment` - 投资
- `limit` (可选): 返回事件数量限制，默认 20 个 (1-100)

**使用示例：**
```json
{
  "name": "get_timeline_events",
  "arguments": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "eventType": "earnings",
    "limit": 15
  }
}
```

## 项目结构

```
jiucai-stock-mcp/
├── src/
│   ├── index.ts                  # MCP 服务器主入口
│   ├── services/
│   │   ├── jiuyangongshe-api.ts # 韭研公社 API 客户端
│   │   └── types.ts             # 类型定义
│   ├── tools/
│   │   ├── article-ranking.ts   # 文章排行榜工具
│   │   └── timeline-events.ts   # 时间轴事件工具
│   └── utils/
│       ├── http-client.ts       # HTTP 客户端工具
│       └── validators.ts        # 数据验证工具
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **MCP SDK** - Model Context Protocol 软件开发工具包
- **Zod** - TypeScript-first 模式验证库
- **node-fetch** - Node.js 的 Fetch API 实现
- **tsup** - 基于 esbuild 的 TypeScript 构建工具

## 开发指南

### 添加新工具

1. 在 `src/tools/` 目录下创建新的工具文件
2. 实现工具类，包含 `getToolDefinition()` 和 `execute()` 方法
3. 在 `src/index.ts` 中注册新工具

### API 客户端扩展

1. 在 `src/services/jiuyangongshe-api.ts` 中添加新的 API 方法
2. 在 `src/services/types.ts` 中定义相关类型
3. 使用 Zod 进行数据验证

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

---

本项目使用 Claude Code 生成。