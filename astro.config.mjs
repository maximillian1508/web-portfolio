// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  build: {
    format: "directory",
  },
  trailingSlash: "never",
  site: "https://maximillianleonard.dev",
  integrations: [sitemap({
    filter: (page) =>
      page !== "https://maximillianleonard.dev/login" &&
      page !== "https://maximillianleonard.dev/dashboard",
  }), mdx(), partytown()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),

  prefetch: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "id"],
    fallback: {
      id: "en",
    },
    routing: {
      fallbackType: "rewrite",
      prefixDefaultLocale: false,
    },
  },
});