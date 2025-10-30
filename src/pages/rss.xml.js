import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('posts')).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const site = new URL(import.meta.env.SITE ?? 'https://notesontech.example');

  const items = posts
    .filter((post) => !post.data.draft)
    .map((post) => {
      const url = new URL(`/blog/${post.slug}/`, site);
      return `
        <item>
          <title><![CDATA[${post.data.title}]]></title>
          <link>${url.href}</link>
          <guid>${url.href}</guid>
          <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
          <description><![CDATA[${post.data.description}]]></description>
        </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Notes on Tech, AI, and Life in Sweden</title>
      <link>${site.href}</link>
      <description>Notes, experiments, and reflections by Alberto Ferreira de Melo.</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
