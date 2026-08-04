# Reasonix project memory

Notes the user pinned via the `#` prompt prefix. The whole file is
loaded into the immutable system prefix every session — keep it terse.

- 结论
`https://my-blog-eta-pearl.vercel.app/` **中国大陆普通家用WiFi/手机4G/5G正常网络下基本打不开**，会出现页面空白、加载超时、连接失败。

## 一、无法正常访问的核心原因
1. **DNS污染**
所有后缀为 `.vercel.app` 的官方二级域名，在国内运营商DNS普遍被污染，解析不到正确海外服务器IP，浏览器一直转圈无响应。
2. **无国内节点**
Vercel 没有中国大陆CDN与服务器，流量全部走国际出口，路由容易被限流、丢包，即便偶尔解析成功，加载速度极慢、图片/接口加载失败。
3. **无ICP备案**
海外平台域名不支持国内备案，国内网络管控会对纯海外二级域名做访问限制。

## 二、临时能打开的极端情况（不适合普通访客）
1. 手动修改设备DNS为海外公共DNS（8.8.8.8、1.1.1.1），部分宽带能临时解析，但不稳定；
2. 使用跨境网络工具。

## 三、长期稳定让国内正常访问的方案（适配你手里的域名 `sezario-blog.bbroot.com`）
### 方案步骤（和你之前Cloudflare操作衔接）
1. Vercel后台绑定自定义域名 `sezario-blog.bbroot.com`；
2. 域名NS已切到Cloudflare（你已完成）；
3. 在Cloudflare DNS添加CNAME记录：
   - 名称：`@`
   - 类型：CNAME
   - 内容：`my-blog-eta-pearl.vercel.app`
   - 代理状态：橙色云朵（启用Cloudflare全球CDN中转）
4. Cloudflare开启「Always Use HTTPS」强制HTTPS；
5. 等待解析生效后，国内用户直接访问 `https://sezario-blog.bbroot.com`，通过Cloudflare海外节点中转，大幅提升连通率与速度。

## 四、替代方案（完全规避海外访问问题）
如果面向大量国内访客，推荐直接迁移到 **Cloudflare Pages、Zeabur、Vercel国内镜像、阿里云/腾讯云静态托管**，原生适配国内网络，无需中转。
- 结论
`https://my-blog-eta-pearl.vercel.app/` **中国大陆普通家用WiFi/手机4G/5G正常网络下基本打不开**，会出现页面空白、加载超时、连接失败。

## 一、无法正常访问的核心原因
1. **DNS污染**
所有后缀为 `.vercel.app` 的官方二级域名，在国内运营商DNS普遍被污染，解析不到正确海外服务器IP，浏览器一直转圈无响应。
2. **无国内节点**
Vercel 没有中国大陆CDN与服务器，流量全部走国际出口，路由容易被限流、丢包，即便偶尔解析成功，加载速度极慢、图片/接口加载失败。
3. **无ICP备案**
海外平台域名不支持国内备案，国内网络管控会对纯海外二级域名做访问限制。

## 二、临时能打开的极端情况（不适合普通访客）
1. 手动修改设备DNS为海外公共DNS（8.8.8.8、1.1.1.1），部分宽带能临时解析，但不稳定；
2. 使用跨境网络工具。

## 三、长期稳定让国内正常访问的方案（适配你手里的域名 `sezario-blog.bbroot.com`）
### 方案步骤（和你之前Cloudflare操作衔接）
1. Vercel后台绑定自定义域名 `sezario-blog.bbroot.com`；
2. 域名NS已切到Cloudflare（你已完成）；
3. 在Cloudflare DNS添加CNAME记录：
   - 名称：`@`
   - 类型：CNAME
   - 内容：`my-blog-eta-pearl.vercel.app`
   - 代理状态：橙色云朵（启用Cloudflare全球CDN中转）
4. Cloudflare开启「Always Use HTTPS」强制HTTPS；
5. 等待解析生效后，国内用户直接访问 `https://sezario-blog.bbroot.com`，通过Cloudflare海外节点中转，大幅提升连通率与速度。

## 四、替代方案（完全规避海外访问问题）
如果面向大量国内访客，推荐直接迁移到 **Cloudflare Pages、Zeabur、Vercel国内镜像、阿里云/腾讯云静态托管**，原生适配国内网络，无需中转。
