import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    category: z.string(),
    tags: z.array(z.string()),
    coverImage: z.string().optional(),
    password: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts };
