import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    slug: z.string().optional(),
    lang: z.enum(['en', 'sv']).optional(),
    image: z.string().optional(),
    // Unpublished notes: written by the skriv editor, invisible in builds,
    // visible in `astro dev` so the editor's live preview works.
    draft: z.boolean().optional(),
    // Innehållsdeklaration — how this note was made. 'none' = written by hand.
    ai: z.enum(['none', 'assisted', 'ai-drafted']).optional(),
    tools: z.array(z.string()).optional(),
    revisions: z.number().int().nonnegative().optional(),
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
