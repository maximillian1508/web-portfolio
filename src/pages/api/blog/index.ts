export const prerender = false;
import { supabase } from "@services/supabase";
import type { APIRoute } from "astro";

/**
 * GET /api/blog
 * Query params:
 *   - id: string (get single post by ID)
 *   - locale: 'en' | 'id' (required for filtered results)
 *   - published: 'true' | 'false' (default: only published)
 *   - slug: string (get single post by slug, requires locale)
 *   - limit: number (default: all)
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');
    const locale = url.searchParams.get('locale');
    const publishedParam = url.searchParams.get('published');
    const slug = url.searchParams.get('slug');
    const limit = url.searchParams.get('limit');

    // Get single post by ID
    if (id) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.code === 'PGRST116' ? 404 : 500
        });
      }
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let query = supabase.from('posts').select('*');

    // Filter by locale
    if (locale) {
      query = query.eq('locale', locale);
    }

    // Filter by published status (default: true)
    if (publishedParam !== 'false') {
      query = query.eq('published', true);
    }

    // Filter by slug
    if (slug) {
      query = query.eq('slug', slug);
      if (locale) {
        const { data, error } = await query.single();
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: error.code === 'PGRST116' ? 404 : 500
          });
        }
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * POST /api/blog
 * Create a new blog post
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { slug, locale, title, description, content, published, featured_image } = body;

    if (!slug || !locale || !title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: slug, locale, title, content' }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        id: crypto.randomUUID(),
        slug,
        locale,
        title,
        description: description || null,
        content,
        published: published || false,
        featured_image: featured_image || null,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: `A post with slug "${slug}" already exists for ${locale}` }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * PUT /api/blog
 * Update an existing blog post
 * Query params:
 *   - id: string (post ID, required)
 */
export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing required query parameter: id' }),
        { status: 400 }
      );
    }

    const body = await request.json();
    const { slug, locale, title, description, content, published, featured_image } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (slug !== undefined) updateData.slug = slug;
    if (locale !== undefined) updateData.locale = locale;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;
    if (featured_image !== undefined) updateData.featured_image = featured_image;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: `A post with slug "${slug}" already exists for ${locale}` }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * DELETE /api/blog
 * Delete a blog post
 * Query params:
 *   - id: string (post ID, required)
 */
export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing required query parameter: id' }),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/blog:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};
