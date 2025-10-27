import rss from '@astrojs/rss';

export async function GET(context) {
  // Fetch published English posts via API using new multi-table structure
  const response = await fetch(`${context.site}api/blog/posts?language=en&published=true`);
  const posts = response.ok ? await response.json() : [];

  return rss({
    title: 'Maximillian Leonard - Blog',
    description: 'Thoughts on software engineering, web development, and technology',
    site: context.site,
    items: posts?.map((post) => ({
      title: post.translation.title,
      description: post.translation.description || '',
      link: `/blog/${post.translation.slug}`,
      pubDate: new Date(post.translation.created_at),
    })) || [],
    customData: `<language>en-us</language>`,
  });
}