import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featuredImage: z.string().optional(),
    draft: z.boolean().default(false),
    lang: z.enum(["en", "id"]),
    // Custom slug for URL - allows translated slugs per language
    slug: z.string().optional(),
    // Key to link translations of the same post across languages
    translationKey: z.string(),
  }),
});

export const collections = { blog };
