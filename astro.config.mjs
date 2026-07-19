import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
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
  adapter: vercel({
    edgeMiddleware: true,
  }),
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
