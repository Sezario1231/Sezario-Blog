# Sezario 个人博客 — 项目文档

> 用于后续开发者和 AI 快速了解全貌，避免重复探查。

---

## 1. 项目概览

| 项目 | 说明 |
|------|------|
| 名称 | Sezario 的个人小屋 |
| 定位 | 个人技术博客：AI · 全栈开发 · 技术探索 · 学习记录 |
| 网址 | https://sezario-blog.pages.dev |
| 框架 | Astro 5.18 (SSR) + React 18.3 |
| 样式 | Tailwind CSS 3.4 + shadcn/ui 风格 + CSS 变量主题系统 |
| 数据库 | Supabase PostgreSQL（7 个表 + Storage） |
| 部署 | Cloudflare Workers（Direct Upload，无 Git 集成） |
| 评论 | Supabase（数据库直连，支持嵌套回复 + IP 限流） |
| 数学公式 | KaTeX（remark-math + rehype-katex） |

---

## 2. 目录结构

```
D:\code\my-blog\
├── astro.config.mjs          # Astro 核心配置（adapter/plugins/aliases）
├── tailwind.config.mjs       # Tailwind + CSS 变量主题 + typography
├── tsconfig.json             # strict + @/ path alias
├── package.json              # 依赖与脚本
├── wrangler.toml             # Cloudflare Workers 配置
├── .env                      # 所有环境变量（含密钥，勿泄露）
├── .env.example              # 环境变量模板
│
├── public/                   # 静态资源（直接可访问）
│   ├── favicon.svg           # 网站图标：橙色圆角方块 + 白色三节点网络
│   ├── avatar.jpg            # 作者头像
│   ├── katex.min.css         # KaTeX 样式
│   └── music/                # 5 首 MP3 背景音乐
│
├── src/
│   ├── middleware.ts          # Astro 中间件：全局安全响应头（CSP/HSTS/X-Frame-Options 等）
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro  # 全局布局（184 行）：SEO meta、主题初始化、所有全局组件
│   │
│   ├── components/
│   │   ├── admin/            # 管理后台组件
│   │   │   └── MarkdownEditor.tsx
│   │   ├── ui/               # shadcn/ui 基础组件
│   │   │   ├── Button.tsx / Card.tsx / Input.tsx / Textarea.tsx
│   │   │
│   │   ├── Header.astro      # 固定导航栏：Logo + 链接 + Ctrl+K 提示 + 搜索 + 主题切换 + 移动菜单
│   │   ├── Footer.astro      # 页脚：品牌 + 导航 + 社交 + 在线人数
│   │   ├── SearchDialog.astro # 搜索弹窗（Ctrl+K 触发，ESC 按钮可点击关闭）
│   │   ├── MusicPlayer.astro # 音乐播放器（循环 5 首 MP3，AbortController 管理事件）
│   │   ├── ParticleCanvas.tsx # Canvas 粒子网络动画（visibilitychange 暂停/恢复）
│   │   ├── ThemeToggle.tsx   # 4 主题切换器
│   │   ├── CursorFollower.tsx # 自定义鼠标光标
│   │   ├── GlobalEffects.astro # 快捷键提示 Toast + 图片灯箱（AbortController 管理事件）
│   │   ├── EasterEggs.astro  # 控制台彩蛋 + 节日自动换肤
│   │   └── ... 约 48 个组件   # 见下方组件索引
│   │
│   ├── lib/
│   │   ├── supabase.ts       # 服务端 Supabase 客户端（单例，service_role 密钥）
│   │   ├── posts.ts          # 文章数据访问层
│   │   ├── admin-auth.ts     # 管理员密码验证 + CSRF Origin 校验 + 统一响应工具
│   │   ├── sanitize.ts       # XSS 防护（escapeHtml/maskIp/normalizeWhitespace）
│   │   └── utils.ts          # cn() = clsx + tailwind-merge
│   │
│   ├── pages/
│   │   ├── index.astro              # 首页：Hero + 最新文章网格
│   │   ├── archive.astro            # 按时间线归档
│   │   ├── contact.astro            # 联系表单 + 留言墙
│   │   ├── friends.astro            # 友情链接
│   │   ├── projects.astro           # 项目展示
│   │   ├── posts/index.astro        # 文章列表（分页 + 过滤）
│   │   ├── posts/[...slug].astro    # 文章详情（catch-all）
│   │   ├── api/                     # 15 个 API 路由（CRUD + 搜索 + 验证 + 上传）
│   │   ├── rss.xml.ts / sitemap.xml.ts / robots.txt.ts
│   │
│   └── styles/
│       └── globals.css       # 573 行：字体 + 主题变量 + 组件类 + 动画 + 排版
│
├── docs/                     # SQL 迁移脚本
│   ├── supabase_init.sql
│   ├── migration_admin_cms.sql
│   ├── migration_comments.sql
│   ├── migration_visitor_sessions.sql
│   └── migration_storage.sql
```

---

## 3. 技术栈详解

### 3.1 框架
- **Astro 5.18** — SSR 模式（`output: "server"`），非静态生成
- **React 18.3** — 交互组件使用 `client:*` 指令加载
- **TypeScript** — strict 模式

### 3.2 适配器
- **主力**：`@astrojs/cloudflare` 12.6
- **备份**：`@astrojs/vercel` 9.0 也安装在依赖中
- **注意**：`main` 分支曾因 cherry-pick 冲突保留过 Vercel 配置，需要时手动切回

### 3.3 样式方案
- **Tailwind CSS 3.4** + `tailwindcss-animate` + `@tailwindcss/typography`
- **CSS 变量主题系统**：仿 shadcn/ui 的 `hsl()` 变量体系
- **字体**：`@fontsource/inter`（自托管，无 Google Fonts CDN 请求）
- **暗色模式**：`class` 策略，localStorage 持久化

### 3.4 数据库
- **Supabase PostgreSQL** — 所有内容动态管理
- **服务端访问**：通过 `service_role` 密钥（在 `src/lib/supabase.ts` 中初始化）
- **RLS 策略**：所有表默认拒绝 anon/authenticated 角色，服务端绕过
- **Storage**：`blog-images` 存储桶（管理后台图片上传）

### 3.5 依赖要点

| 依赖 | 用途 |
|------|------|
| `@supabase/supabase-js` 2.110 | Supabase 客户端 |
| `marked` 15 | Markdown 渲染 |
| `@uiw/react-md-editor` | 管理后台 Markdown 编辑器 |
| `lucide-react` | 图标库 |
| `rehype-katex` / `remark-math` | 数学公式渲染 |
| `tailwind-merge` / `clsx` / `class-variance-authority` | shadcn/ui 工具链 |

---

## 4. 数据库表结构

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `posts` | 博客文章 | `id`, `slug`, `title`, `description`, `content`, `category`, `tags[]`, `published`, `created_at` |
| `projects` | 项目展示 | `id`, `title`, `description`, `tech_stack[]`, `github_url`, `demo_url`, `image_url`, `sort_order` |
| `site_settings` | 键值配置 | `key`, `value` |
| `quotes` | 随机名言 | `id`, `content`, `author` |
| `comments` | 文章评论 | `id`, `post_slug`, `author`, `content`, `parent_id`, `created_at` |
| `contact_messages` | 联系留言 | `id`, `name`, `email`, `message`, `created_at` |
| `visitor_sessions` | 在线追踪 | `id`, `ip`, `last_seen` |

---

## 5. API 路由

所有 API 在 `src/pages/api/` 下，完整列表：

| 路由 | 公开 | 方法 | 认证方式 | 用途 |
|------|------|------|----------|------|
| `/api/posts` | GET | 是 | 无 | 文章列表 |
| `/api/posts` | POST | 否 | 密码 + Origin | 创建文章 |
| `/api/posts/[id]` | GET | 是 | 无 | 单篇文章详情 |
| `/api/posts/[id]` | PUT | 否 | 密码 + Origin | 更新文章 |
| `/api/posts/[id]` | DELETE | 否 | 密码 + Origin | 删除文章 |
| `/api/projects` | GET | 是 | 无 | 项目列表 |
| `/api/projects` | POST | 否 | 密码 + Origin | 创建项目 |
| `/api/projects/[id]` | PUT | 否 | 密码 + Origin | 更新项目 |
| `/api/projects/[id]` | DELETE | 否 | 密码 + Origin | 删除项目 |
| `/api/quotes` | GET | 是 | 无 | 名言列表 |
| `/api/quotes` | POST | 否 | 密码 + Origin | 添加名言 |
| `/api/quotes` | DELETE | 否 | 密码 + Origin | 删除名言 |
| `/api/comments` | GET | 是 | 无 | 获取评论 |
| `/api/comments` | POST | 是 | 限流 (IP, 10min/3次) | 提交评论 |
| `/api/contact` | POST | 是 | 限流 + XSS 转义 | 联系表单提交 |
| `/api/online` | POST/DELETE | 是 | 无 | 在线状态心跳 |
| `/api/settings` | GET | 是 | 无 | 获取站点设置 |
| `/api/settings` | PUT | 否 | 密码 + Origin | 更新站点设置 |
| `/api/admin-verify` | POST | 是 | 限流 (IP, 15min/5次) | 管理员密码验证 |
| `/api/upload` | POST | 否 | 密码 + Origin + MIME 白名单 | 图片上传到 Supabase Storage |
| `/api/search.json` | GET | 是 | 无 | 前端搜索数据源 |
| `/api/admin/posts/batch` | POST | 否 | 密码 + Origin | 批量删除/发布/草稿 |
| `/api/admin/projects/batch` | POST | 否 | 密码 + Origin | 批量删除 |
| `/api/admin/quotes/batch` | POST | 否 | 密码 + Origin | 批量删除 |
| `/api/admin/contacts/batch` | POST | 否 | 密码 + Origin | 批量删除/标为已读 |
| `/api/admin/comments/batch` | POST | 否 | 密码 + Origin | 批量删除（级联） |
| `/api/admin/contacts` | GET | 否 | 密码 + Origin | 获取联系留言列表 |
| `/api/admin/comments` | GET | 否 | 密码 + Origin | 获取评论列表 |
| `/api/admin/export/[type]` | GET | 否 | 密码 + Origin | 导出数据（posts/projects/quotes/contacts/comments） |
| `/api/admin/stats` | GET | 否 | 密码 + Origin | 仪表盘统计数据 |

**认证方式**：
- **密码**：请求头 `x-admin-password` 与 `.env` 中 `ADMIN_PASSWORD` 比对
- **Origin**：CSRF 防护，校验 `Origin`/`Referer` 必须为本站域名
- **限流**：基于 IP 内存计数

---

## 6. 安全措施

### 6.1 防护清单

| 措施 | 实现方式 | 作用 |
|------|----------|------|
| **HTTP 安全头** | `src/middleware.ts` | CSP、X-Frame-Options(DENY)、HSTS、X-Content-Type-Options、Referrer-Policy、Permissions-Policy |
| **XSS 防护** | `src/lib/sanitize.ts` `escapeHtml()` | 评论、联系表单所有用户输入入库前转义 |
| **CSRF 防护** | `src/lib/admin-auth.ts` `verifyOrigin()` | 管理 API 校验 Origin/Referer 必须为本站域名 |
| **IP 脱敏** | `maskIp()` | IPv4 末段掩码为 x，IPv6 尾部截断 |
| **速率限制** | 评论/联系 10 分钟 3 次，管理员登录 15 分钟 5 次 | IP 级别内存计数 |
| **文件上传校验** | `/api/upload` | 白名单 MIME 类型 + 5MB 大小限制 |
| **管理员暴力破解防护** | `/api/admin-verify` | 内存 Map 15 分钟 5 次尝试限制 |
| **RLS 策略** | Supabase 表默认拒绝公共访问 | 服务端通过 service_role 绕过 |
| **服务端密钥** | 仅存于 `.env` + `wrangler.toml` | 不暴露给客户端 |

### 6.2 CSP 策略

```
default-src 'self';
script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
connect-src 'self' https://*.supabase.co;
font-src 'self' data:;
base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none';
```

---

## 7. 组件索引（约 48 个组件）

### 布局
- `Header.astro` — 固定顶栏：Logo + 导航链接 + 搜索（`Ctrl+K` 提示） + GitHub + 移动菜单按钮
- `Footer.astro` — 品牌信息 + 导航 + 社交链接 + 版权 + 在线人数
- `MobileMenu.astro` — 滑出式侧边导航
- `Breadcrumb.astro`

### 首页
- `HeroSection.astro` — 渐变标题 + 3D 头像 + CTA
- `DotGrid.astro` — 鼠标视差点阵
- `ScrollIndicator.astro` — 向下滚动箭头
- `Marquee.astro` — 跑马灯横幅
- `Avatar3D.astro` — 3D 翻转 + 鼠标倾斜

### 文章
- `ArticleCard.tsx` (React) — 卡片：标题/日期/分类/描述/标签
- `FilterBar.astro` — 分类/标签过滤
- `Pagination.astro`
- `Timeline.astro` — 按年分组
- `RelatedPosts.astro` — 标签/分类评分推荐
- `ShareButtons.astro` — Twitter/Facebook/复制链接
- `LikeButton.astro` — localStorage 持久化点赞
- `CodeBlock.astro` — 行号 + 复制 + 折叠
- `CodePlayground.astro` — eval 沙箱执行
- `Admonition.astro` — 提示/警告/危险/成功
- `MermaidChart.astro` — 动态加载 CDN 渲染

### 交互
- `SearchDialog.astro` — Ctrl+K 搜索弹窗（本地 JSON 搜索）
- `ContactForm.tsx` (React) — 校验 + 提交
- `Comments.tsx` (React) — Supabase 评论 + 树形回复 + IP 限流
- `Guestbook.astro` — 快速留言
- `EmailSubscribe.astro` — 展示层表单
- `MusicPlayer.astro` — 5 首 MP3 循环 + 进度条
- `ThemeToggle.tsx` (React) — 4 主题切换

### 可视化 & 装饰
- `AuroraBackground.astro` — CSS 极光动画
- `ParticleCanvas.tsx` (React) — Canvas 粒子网络
- `CosmicEnding.tsx` (React) — 星空彩蛋（300星+星云+流星，可关闭）
- `GlobalEffects.astro` — 快捷键 Toast + 图片灯箱
- `CursorFollower.tsx` (React) — 自定义光标
- `EasterEggs.astro` — 控制台彩蛋 + 节日换肤
- `ContributionCalendar.astro` — GitHub 风格发布热力图
- `SkillBars.astro` — 技能条动画
- `TagCloud.astro`
- `ReadingList.astro` — 书单/影单
- `StatusCard.astro` — 实时时间/日期/状态
- `ProjectCard.tsx` (React) — 3D 倾斜悬停
- `RandomQuote.astro` — Supabase 名言
- `OnlineCounter.astro` — 心跳追踪
- `Skeleton.astro` — 骨架屏变体

### UI 基础组件
- `ui/Button.tsx` — 6 种变体
- `ui/Card.tsx` — 卡片系统
- `ui/Input.tsx` / `ui/Textarea.tsx`

### 管理后台
- `admin/MarkdownEditor.tsx` (React) — @uiw/react-md-editor + 图片上传

---

## 8. 主题系统

4 种主题，通过 CSS 变量 + `class` 策略实现：

| 主题 | class | 特征 |
|------|-------|------|
| 明亮 | （默认） | 暖橙色 #c86428 |
| 暗色（极客） | `.dark` | 翠绿色 #2dd4bf |
| 深夜蓝 | `.dark.theme-deepblue` | 蓝色系 |
| 护眼绿 | `.dark.theme-eyegreen` | 绿色系 |

主题切换逻辑在 `ThemeToggle.tsx` 中，通过操作 `<html>` 的 `class` 和 `data-theme` 属性实现。

---

## 9. 部署

### 9.1 重要：Cloudflare Pages 无 Git 集成

该项目使用 **Direct Upload** 模式部署到 Cloudflare Pages，git push 不会触发自动构建。每次修改后需要手动部署：

```powershell
npm run build
npx wrangler pages deploy dist --project-name sezario-blog --branch main
```

### 9.2 开发服务器

```powershell
npm run dev
```

默认在 `http://localhost:4321` 启动。

### 9.3 分支策略

| 分支 | 用途 | 适配器 |
|------|------|--------|
| `master` | 开发主分支 | Cloudflare |
| `main` | 部署分支（已同步） | Cloudflare（之前曾遗留 Vercel 配置） |

**注意**：两个分支的 `astro.config.mjs` 必须保持一致。修改后请同步：

```powershell
git checkout main
git checkout master -- astro.config.mjs wrangler.toml
git commit -m "sync config from master"
git push origin main
git checkout master
```

---

## 10. 环境变量

所有环境变量在 `.env` 中（已提交到 `.env.example` 模板）：

| 变量 | 公开 | 用途 |
|------|------|------|
| `PUBLIC_SITE_URL` | 是 | 站点 URL（开发时用 localhost） |
| `PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `PUBLIC_SUPABASE_ANON_KEY` | 是 | 公开匿名密钥 |
| `SUPABASE_URL` | 否 | 服务端 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 否 | 服务端超级权限密钥 |
| `ADMIN_PASSWORD` | 否 | 管理后台密码 |

---

## 11. 已知注意事项

### 11.1 代码约定
- **所有组件无注释**（除非必要）
- shadcn/ui 风格：`cva()` + `cn()` 工具函数
- CSS 变量命名遵循 `--color-name` 模式
- 组件类型：纯展示用 `.astro`，有交互状态的用 `.tsx`（React）
- Astro 组件中的 `<script>` 使用 `AbortController` 管理事件监听

### 11.2 常见陷阱
- **Cloudflare 不支持 `sharp` 运行时**：构建时已有警告，若图片处理出错需配置 `imageService: "compile"`
- **`@astrojs/vercel` 与 `@astrojs/cloudflare` 共存**：两者都在 package.json 中，切换适配器时记得改 `astro.config.mjs`
- **`.env` 中的 ADMIN_PASSWORD 不能更改**（除非同步更新 Supabase 中的验证逻辑）
- **搜索数据源**：`/api/search.json` 返回所有已发布文章，前端做客户端过滤
- **favicon.ico 不存在**：只有 `favicon.svg`，浏览器默认请求 `favicon.ico` 会返回 404（正常）

### 11.3 未来可能的改进方向
- 将 Cloudflare Pages 接入 Git 仓库，实现 push 自动部署
- 添加 `public/_headers` 文件，让静态文件（favicon.svg 等）也带上安全头
- 添加 `public/_redirects` 文件处理 404 回退
- 优化图片加载（Cloudflare Image Resizing 或 Astro 的 `<Image />` 组件）
- 用 Cloudflare KV 替代内存 Map 实现持久化速率限制（目前 Worker 冷启动会重置）

---

## 12. 快速参考命令

```powershell
# 开发
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name sezario-blog --branch main

# 查看 Cloudflare 部署列表
npx wrangler pages deployment list --project-name sezario-blog
```

---

## 13. 最近更新记录

| 日期 | 内容 |
|------|------|
| 2025-07-20 | 评论系统从 Giscus 切换到 Supabase（支持嵌套回复 + IP 限流 + 管理面板 CRUD） |
| 2025-07-20 | 管理面板：批量操作（全选/批量删除/发布/草稿）、留言管理、评论管理、数据导出 |
| 2025-07-20 | 星空彩蛋：页面底部滚动触发，300 星 + 星云 + 流星，localStorage 记忆关闭状态 |
| 2025-07-20 | 修复 admin-auth.ts verifyOrigin/verifyAdminRequest（url→request 参数修复） |
| 2025-07-20 | 修复 stats.ts Promise.allSettled 500 错误 |
