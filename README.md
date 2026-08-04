# Sezario Blog

个人技术博客：AI · 全栈开发 · 技术探索 · 学习记录

在线地址：https://sezario-blog.pages.dev

> 详细的架构、组件索引、API 文档、部署说明请查看 **[PROJECT.md](./PROJECT.md)**。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 5.18（SSR）+ React 18.3 + TypeScript |
| 样式 | Tailwind CSS 3.4 + shadcn/ui 风格 + CSS 变量主题系统 |
| 数据库 | Supabase PostgreSQL（8 张表 + Storage） |
| 部署 | Cloudflare Pages（Direct Upload，无 Git 集成，需手动部署） |

## 快速开始

```bash
npm install
cp .env.example .env   # 填写 Supabase 密钥与站点 URL
npm run dev            # http://localhost:4321
```

## 常用命令

```bash
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run check    # 类型检查（astro check）
npm run preview  # 预览构建结果
```

## 部署（手动）

```bash
npm run build
npx wrangler pages deploy dist --project-name sezario-blog --branch main
```

## 环境变量

所有环境变量在 `.env` 中，模板见 `.env.example`：

- `PUBLIC_SITE_URL` / `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY`：公开变量
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `ADMIN_PASSWORD`：服务端私有变量（勿泄露）

## 文档

- [PROJECT.md](./PROJECT.md)：完整项目文档（架构、组件索引、API 路由、数据库表结构、安全措施）
- [docs/](./docs/)：Supabase SQL 迁移脚本
