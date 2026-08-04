import { defineConfig } from "astro/config";
import fs from "node:fs";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "");
const siteUrl = env.PUBLIC_SITE_URL;

try {
  fs.writeFileSync(
    "dist-build-env.json",
    JSON.stringify({
      url: env.SUPABASE_URL,
      urlLen: (env.SUPABASE_URL || "").length,
      svcLen: (env.SUPABASE_SERVICE_ROLE_KEY || "").length,
      adminLen: (env.ADMIN_PASSWORD || "").length,
    })
  );
} catch {}

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
