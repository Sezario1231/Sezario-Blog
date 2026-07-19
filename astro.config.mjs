import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math"; // 补上缺失导入

export default defineConfig({
  compat: {
    nodejs: true
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false
    })
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
  output: "server",
  adapter: cloudflare({
    session: false
  }),
  vite: {
    resolve: {
      alias: {
        "@": "/src"
        // 删掉错误别名 "@astrojs/tailwind": "/src"，无意义且冲突
      }
    }
  }
});