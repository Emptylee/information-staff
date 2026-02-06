# 技术架构文档 - 名人消息实时聚合助手

## 1. 技术栈选择

| 模块         | 技术选型                         | 原因                                                                                  |
| :--------- | :--------------------------- | :---------------------------------------------------------------------------------- |
| **前端框架**   | **Next.js 14 (App Router)**  | React 生态标准，自带服务端 API 路由，利于 SEO 和隐藏密钥。                                               |
| **UI 组件库** | **Tailwind CSS + shadcn/ui** | 快速构建美观、响应式的现代化界面。                                                                   |
| **开发语言**   | **TypeScript**               | 强类型，减少维护错误。                                                                         |
| **数据库**    | **Supabase (PostgreSQL)**    | 存储用户关注列表、缓存的历史消息。提供免费层。                                                             |
| **搜索服务**   | **Tavily Search API**        | 专为 AI Agent 设计的搜索 API，检索质量高，自带清洗后的文本。**服务端调用，无需翻墙。**                                |
| **LLM 服务** | **DeepSeek V3**              | **替换 OpenAI**。高性能、低成本（甚至免费），完全兼容 OpenAI SDK，中文理解能力强。                                |
| **部署托管**   | **Vercel (US Region)**       | **关键点**：利用 Vercel 的海外服务器节点作为中转，确保能稳定访问 Tavily 和 X 等海外数据源，国内用户只需访问 Vercel 托管的前端页面即可。 |

## 2. 架构设计

```mermaid
graph TD
    User[用户 (Browser, China/Global)] -->|1. 访问页面| Frontend[Next.js Frontend (Vercel CDN)]
    Frontend -->|2. 验证 Access Code| Middleware[Middleware / Auth]
    Frontend -->|3. API 请求| Backend[Next.js API Routes (Serverless Function in US)]
    
    Backend -->|4. 读写数据| DB[(Supabase DB)]
    Backend -->|5. 实时搜索| SearchAPI[Tavily API]
    Backend -->|6. 内容摘要| LLM[DeepSeek API]
    
    subgraph "Vercel Serverless Environment (US)"
        Backend
    end

    subgraph "外部服务"
        SearchAPI
        LLM
    end
    
    subgraph "数据层"
        DB
    end
```

## 3. 费用分析与控制

### 3.1 成本估算表

| 服务               | 免费额度/计费模式              | 预计开销 (个人使用)                  |
| :--------------- | :--------------------- | :--------------------------- |
| **Vercel**       | Hobby Plan: 免费         | **$0**                       |
| **Supabase**     | Free Tier: 500MB 数据库   | **$0**                       |
| **Tavily API**   | Free Tier: 1,000 次搜索/月 | **$0** (每天刷新 \~30 次内免费)      |
| **DeepSeek API** | 极其低廉 / 免费赠送额度          | **\~$0** (相比 OpenAI 进一步降低成本) |

### 3.2 成本控制策略

* **数据缓存**：对于同一人物，1 小时内不重复调用搜索 API，直接返回数据库缓存。

* **服务端代理**：利用 Vercel Serverless Function 代理所有外部 API 请求，避免客户端直接连接海外服务受阻。

## 4. 安全设计 (专属服务)

### 4.1 简易访问控制

由于是个人专属工具，无需复杂的 OAuth 登录。

1. **环境变量**：在 Vercel 后台设置 `ACCESS_CODE=my_secret_password`。
2. **前端拦截**：

   * 用户首次访问，检查 `localStorage` 是否有 `access_code`。

   * 若无，重定向至 `/login` 页面输入。
3. **API 鉴权**：

   * 所有 API 请求头必须携带 `x-access-code`。

   * 后端 Middleware 校验该 Code 是否与环境变量一致。

   * 不一致返回 401 Unauthorized。

## 5. 数据模型 (Supabase)

### 5.1 Tables

* **`profiles`** (不需要复杂的 Auth 表，仅作为简单的配置存储，可选)

* **`celebrities`** (关注的人物)

  * `id`: UUID

  * `name`: String (e.g., "Elon Musk")

  * `keywords`: String\[] (e.g., \["Tesla", "SpaceX", "Twitter"])

  * `avatar_url`: String

  * `platform_handles`: JSON (e.g., { twitter: "@elonmusk" })

* **`news_feed`** (消息流)

  * `id`: UUID

  * `celebrity_id`: FK

  * `content`: Text (摘要)

  * `original_url`: String

  * `source`: String (e.g., "Twitter", "News")

  * `published_at`: Timestamp

  * `created_at`: Timestamp

## 6. API 接口定义

* `POST /api/auth/verify`: 验证访问码

* `GET /api/celebrities`: 获取关注列表

* `POST /api/celebrities`: 添加关注 (触发搜索确认)

* `POST /api/news/refresh`: 触发指定人物的新闻刷新 (调用 Tavily + DeepSeek)

