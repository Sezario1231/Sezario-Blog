# Sezario Blog

> 基于 Astro 4.x 构建的全栈个人博客系统，支持暗黑/明亮双主题、响应式设计、SEO 优化、RSS 订阅、评论系统、联系表单全栈闭环。

---

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [本地开发环境搭建](#本地开发环境搭建)
- [Supabase 配置](#supabase-配置)
- [环境变量配置](#环境变量配置)
- [Vercel 一键部署](#vercel-一键部署)
- [自定义域名配置](#自定义域名配置)
- [日常使用说明](#日常使用说明)
- [常见问题与排查](#常见问题与排查)

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 核心框架 | Astro 4.16 + React 18.3 |
| 样式方案 | Tailwind CSS 3.4 + shadcn/ui |
| 内容管理 | Astro Content Collections (Markdown) |
| 数据库 | Supabase PostgreSQL |
| 部署平台 | Vercel Serverless Functions |
| 域名 | eu.org + Cloudflare DNS + CDN |

## 项目结构

```
├── src/
│   ├── components/       # UI 组件（React + Astro）
│   │   └── ui/          # shadcn/ui 基础组件
│   ├── content/
│   │   ├── config.ts    # 内容集合 Schema
│   │   └── posts/       # Markdown 文章
│   ├── layouts/         # 全局布局
│   ├── lib/             # 工具函数
│   │   ├── sanitize.ts  # XSS 防护工具
│   │   ├── supabase.ts  # 服务端 Supabase 客户端
│   │   └── utils.ts     # 通用工具函数
│   ├── pages/           # 页面路由 + API 路由
│   │   └── api/
│   │       └── contact.ts  # 联系表单 API
│   └── styles/          # 全局样式
├── docs/
│   └── supabase_init.sql  # 数据库建表脚本
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── vercel.json
└── .env.example
```

## 本地开发环境搭建

### 前置要求

- **Node.js**: v18+（推荐 v20 LTS）
- **npm**: v9+
- **Git**: 用于版本管理

### 1. 安装 Node.js

```bash
# 下载安装包（推荐使用 nvm-windows 管理多版本）
# 访问 https://nodejs.org/ 下载 v20 LTS

# 验证安装
node -v   # 应输出 v20.x.x
npm -v    # 应输出 10.x.x
```

### 2. 克隆项目

```bash
git clone <你的仓库地址>
cd my-blog
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

复制环境变量模板并填写：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置 Supabase 密钥和站点 URL。详见 [环境变量配置](#环境变量配置) 和 [Supabase 配置](#supabase-配置)。

### 5. 启动开发服务器

```bash
npm run dev
```

浏览器访问 `http://localhost:4321` 即可预览。

### 常用命令

```bash
npm run dev      # 启动开发服务器（热更新）
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

---

## Supabase 配置

联系表单的后端数据存储在 Supabase，按以下步骤完成配置。

### 1. 注册 Supabase 账号

访问 https://supabase.com ，使用 GitHub 账号注册。

### 2. 创建项目

1. 登录后点击 **New project**
2. 填写项目名称（如 `my-blog`）
3. 设置数据库密码（**务必保存**）
4. 选择区域：**Singapore (ap-southeast-1)**（亚洲访问速度最快）
5. 等待 1-2 分钟项目创建完成

### 3. 执行建表 SQL

1. 进入项目后，点击左侧 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `docs/supabase_init.sql` 文件，复制全部内容
4. 粘贴到 SQL Editor 中，点击 **Run**
5. 验证：左侧 **Table Editor** 中应出现 `contact_messages` 表

### 4. 获取 API 密钥

1. 进入 **Project Settings** → **API Keys**
2. 找到以下两个值：

| 变量 | 位置 | 说明 |
|------|------|------|
| `SUPABASE_URL` | Project Settings → API → Project URL | 格式 `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | API Keys → secret keys | 以 `sb_secret_` 开头 |

> **安全警告**：`SUPABASE_SERVICE_ROLE_KEY` 拥有数据库完全权限，**绝不可**暴露到前端或提交到任何公开仓库。

### 5. 查看留言数据

通过 Table Editor 或 SQL Editor 查看：

```sql
select * from public.contact_messages order by created_at desc;
```

---

## 环境变量配置

项目使用 `.env` 文件管理环境变量，参考 `.env.example` 格式。

### 配置项说明

| 变量名 | 必填 | 说明 | 示例值 |
|--------|------|------|--------|
| `PUBLIC_SITE_URL` | 是 | 站点域名，用于 SEO 和 RSS 生成 | `http://localhost:4321` |
| `SUPABASE_URL` | 是 | Supabase 项目 URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | 是 | 服务端密钥 | `sb_secret_xxx` |

### 本地开发（.env）

```env
# 公开变量（会被暴露到前端）
PUBLIC_SITE_URL=http://localhost:4321

# 私有变量（仅服务端）
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_key_here
```

### 重要提醒

- `.env` 文件已在 `.gitignore` 中配置忽略，不会被 Git 提交
- 仅 `.env.example` 提交到仓库（不含真实密钥）
- 部署到 Vercel 时，需要在 Vercel 控制台手动配置环境变量

---

## Vercel 一键部署

### 1. 前置准备

- GitHub 账号（用于代码托管）
- Vercel 账号（使用 GitHub 登录）

### 2. 推送代码到 GitHub

```bash
# 在项目目录下初始化 Git
git init
git add .
git commit -m "initial commit"

# 在 GitHub 新建仓库（不要勾选 README / .gitignore）
# 关联远程仓库并推送
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 3. 导入到 Vercel

1. 访问 https://vercel.com 并登录（使用 GitHub）
2. 点击 **Add New** → **Project**
3. 选择刚才推送的 GitHub 仓库
4. 框架自动识别为 **Astro**（无需手动选择）

### 4. 配置环境变量

在 Vercel 项目配置页面的 **Environment Variables** 中添加：

| 名称 | 值 | Environment |
|------|----|-------------|
| `PUBLIC_SITE_URL` | `https://你的域名.vercel.app` | Production |
| `SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_xxx` | All |

> **注意**：`PUBLIC_SITE_URL` 在 Production 环境填 Vercel 分配的域名或自定义域名。Preview 环境会自动使用 Preview URL。

### 5. 部署

1. 点击 **Deploy**
2. 等待 1-2 分钟部署完成
3. 部署成功后 Vercel 会分配一个 `*.vercel.app` 域名

### 6. 验证上线

访问以下 URL 检查功能是否正常：

| URL | 作用 | 期望结果 |
|-----|------|----------|
| `https://你的域名.vercel.app/` | 首页 | 正常加载，动画效果 |
| `https://你的域名.vercel.app/posts` | 文章列表 | 显示文章 |
| `https://你的域名.vercel.app/contact` | 联系表单 | 可提交，数据写入 Supabase |
| `https://你的域名.vercel.app/rss.xml` | RSS 订阅 | 返回 RSS XML |
| `https://你的域名.vercel.app/sitemap.xml` | 站点地图 | 返回 Sitemap XML |
| `https://你的域名.vercel.app/robots.txt` | 爬虫规则 | 返回 Robots 配置 |

---

## 自定义域名配置

### 1. 申请免费域名

#### 方式一：eu.org（免费，推荐）

1. 访问 https://nic.eu.org 注册账号
2. 填写域名申请信息（审核通常 1-14 天）
3. 审核通过后，在域名管理页面设置 DNS

#### 方式二：其他免费域名

- **Freenom**：`.tk` / `.ml` / `.ga` / `.cf`（需确认当前可用性）
- **Cloudflare Pages** 自带域名功能

### 2. Cloudflare 接入

1. 注册 https://cloudflare.com
2. 添加你的域名（输入域名，选择 Free 套餐）
3. Cloudflare 扫描 DNS 记录
4. 将域名注册商的 NameServer 改为 Cloudflare 提供的两个地址

### 3. DNS 配置

在 Cloudflare DNS 设置中添加记录：

| 类型 | 名称 | 值 | 代理状态 |
|------|------|-----|---------|
| CNAME | `@` | `cname.vercel-dns.com` | 开启（橙色云朵） |
| CNAME | `www` | `你的域名.vercel.app` | 开启（橙色云朵） |

### 4. Vercel 绑定域名

1. 进入 Vercel 项目 → **Settings** → **Domains**
2. 输入你的域名，点击 **Add**
3. Vercel 会自动验证域名（需 DNS 已生效）
4. 等待 SSL 证书自动签发（1-5 分钟）

### 5. 开启 HTTPS 与 CDN

Cloudflare 默认提供：

- **SSL/TLS**：Full（strict）
- **CDN 加速**：全球节点缓存静态资源
- **Auto Minify**：自动压缩 HTML / CSS / JS

> **注意**：如果 Vercel 绑定域名后无法访问，检查 Cloudflare SSL/TLS 加密模式是否设置为 **Full（strict）**。

### 6. 更新环境变量

域名绑定后，在 Vercel 环境变量中更新：

```env
PUBLIC_SITE_URL=https://你的域名.com
```

重新部署即可生效。

---

## 日常使用说明

### 发布新文章

在 `src/content/posts/` 目录下创建 `.md` 文件：

```markdown
---
title: "文章标题"
description: "文章描述（用于 SEO 摘要）"
date: 2025-01-15
category: "Technology"
tags: ["Astro", "React", "Web"]
draft: false
---

这里是文章正文。支持 Markdown 语法。

## 二级标题

正文内容...

### 代码块

```javascript
console.log("Hello World");
```
```

**字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题 |
| `description` | 是 | SEO 摘要描述 |
| `date` | 是 | 发布日期 |
| `category` | 是 | 文章分类 |
| `tags` | 是 | 标签列表 |
| `draft` | 否 | 草稿状态，`true` 则不发布于生产环境 |

### 新增项目

在网页端无发布后台时，直接编辑 `src/pages/projects.astro` 中的项目数据数组。

### 查看留言数据

登录 Supabase 控制台 → **Table Editor** → `contact_messages` 表即可查看。

或者使用 SQL 查询：

```sql
-- 查看所有留言，按时间倒序
select id, name, email, substring(message, 1, 100) as preview, created_at, is_read
from public.contact_messages
order by created_at desc;

-- 统计未读留言数量
select count(*) from public.contact_messages where is_read = false;
```

### 配置评论系统（Giscus）

项目已集成 Giscus 评论组件，需要完成以下配置：

1. **安装 Giscus GitHub App**
   - 访问 https://github.com/apps/giscus
   - 点击 **Install**，选择你的仓库

2. **启用 GitHub Discussions**
   - 进入仓库 **Settings** → **General**
   - 勾选 **Discussions**，选择 **Announcements** 分类

3. **获取 Giscus 配置**
   - 访问 https://giscus.app
   - 输入你的仓库名
   - 页面会自动生成 `data-repo`、`data-repo-id`、`data-category`、`data-category-id`

4. **更新组件配置**
   - 打开 `src/pages/posts/[...slug].astro`
   - 找到 `Giscus` 组件，将占位值替换为实际参数：

```astro
<Giscus
  client:visible
  repo="你的用户名/你的仓库名"
  repoId="你的仓库ID"
  category="Announcements"
  categoryId="你的分类ID"
  term={"/" + slug}
/>
```

5. **重新部署**

修改完成后推送代码，Vercel 自动重新部署。

---

## 常见问题与排查

### 构建报错

#### 1. `Cannot find module '@astrojs/sitemap'`

```bash
npm install
```

#### 2. Node.js 版本警告

```
The local Node.js version (22) is not supported by Vercel Serverless Functions.
```

不影响构建和运行，仅告知 Vercel 生产环境将使用 Node.js 18。如需消除警告，将本地 Node.js 降级到 v18。

#### 3. 构建时环境变量未定义

确认 `.env` 文件存在且变量名拼写正确。`SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端 API 路由中引用，不影响前端构建。

### 开发环境问题

#### 1. 端口冲突

```bash
npm run dev -- --port 3000
```

#### 2. 样式未更新

```bash
# 清除 Astro 缓存
rm -rf .astro
npm run dev
```

### 部署问题

#### 1. 表单提交后 500 错误

- 确认 Supabase 表已创建
- 确认环境变量已正确配置（特别是 SUPABASE_SERVICE_ROLE_KEY）
- 检查 Vercel Functions 日志

#### 2. 自定义域名无法访问

- 确认 DNS 记录已生效（`dig 你的域名` 或在线 DNS 检查工具）
- Cloudflare SSL/TLS 设置为 Full（strict）
- 等待 SSL 证书签发（最长 5 分钟）

#### 3. 页面显示 404

- 确认 Vercel 部署已完成
- 检查构建日志中有无错误
- 尝试清除浏览器缓存

---

## 项目相关

- [在线演示](https://lckftybogvxbacaeuaxc.supabase.co)
- [反馈与建议](https://github.com/你的用户名/你的仓库名/issues)
