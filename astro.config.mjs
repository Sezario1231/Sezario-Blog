import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { loadEnv } from "vite";

const siteUrl = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "").PUBLIC_SITE_URL;

export default defineConfig({
  site: siteUrl || "http://localhost:4321",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  output: "server",
  adapter: cloudflare({
    session: false,
  }),
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
