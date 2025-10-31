import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    slug: z.string().optional(),
    lang: z.string().optional(),
    image: z.string().optional(),
  }),
});

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.string(),
    pubDate: z.coerce.date(),
    slug: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  notes,
  projects,
};
