import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { loadEnv } from "vite";

const { PUBLIC_SITE_URL } = loadEnv(
  process.env.NODE_ENV || "production",
  process.cwd(),
  "PUBLIC_"
);
const siteUrl = PUBLIC_SITE_URL || "https://lckftybogvxbacaeuaxc.supabase.co";

export default defineConfig({
  site: siteUrl,
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
