import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  experimental: {
    nodejsCompat: true
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
        "@astrojs/tailwind": "/src",
        "@": "/src"
      }
    }
  }
});
