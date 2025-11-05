// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

// import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  build: {
    format: "directory",
  },
  trailingSlash: "never",
  site: "https://maximillianleonard.dev",
  integrations: [
    sitemap({
      filter: (page) =>
        page !== "https://maximillianleonard.dev/login" &&
        page !== "https://maximillianleonard.dev/dashboard",
    }), // partytown(),
    mdx(),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare({
    imageService: "passthrough",
  }),

  prefetch: true,
});
