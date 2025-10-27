export const prerender = false;
import { supabase } from "@services/supabase";
import type { APIRoute } from "astro";

/**
 * GET /api/blog/posts
 * Query params:
 *   - language: string (language code: 'en', 'id')
 *   - slug: string (get single post by slug + language)
 *   - published: 'true' | 'false' (default: only published)
 *   - limit: number
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const languageCode = url.searchParams.get('language');
    const slug = url.searchParams.get('slug');
    const publishedParam = url.searchParams.get('published');
    const limit = url.searchParams.get('limit');

    // Get single post by slug and language
    if (slug && languageCode) {
      const { data: langData } = await supabase
        .from('languages')
        .select('id')
        .eq('code', languageCode)
        .single();

      if (!langData) {
        return new Response(JSON.stringify({ error: 'Language not found' }), {
          status: 404
        });
      }

      // Query with joins
      const { data, error } = await supabase
        .from('post_translations')
        .select(`
          *,
          post:posts(*),
          language:languages(*)
        `)
        .eq('slug', slug)
        .eq('language_id', langData.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.code === 'PGRST116' ? 404 : 500
        });
      }

      // Flatten the structure
      const result = {
        ...data.post,
        translation: {
          id: data.id,
          post_id: data.post_id,
          language_id: data.language_id,
          slug: data.slug,
          title: data.title,
          description: data.description,
          content: data.content,
          is_published: data.is_published,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        language: data.language,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get multiple posts with translations for a language
    if (languageCode) {
      const { data: langData } = await supabase
        .from('languages')
        .select('id')
        .eq('code', languageCode)
        .single();

      if (!langData) {
        return new Response(JSON.stringify({ error: 'Language not found' }), {
          status: 404
        });
      }

      let query = supabase
        .from('post_translations')
        .select(`
          *,
          post:posts(*),
          language:languages(*)
        `)
        .eq('language_id', langData.id);

      // Filter by published status
      if (publishedParam !== 'false') {
        query = query.eq('is_published', true).eq('post.is_published', true);
      }

      // Apply limit
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500
        });
      }

      // Flatten the structure
      const results = data.map((item: any) => ({
        ...item.post,
        translation: {
          id: item.id,
          post_id: item.post_id,
          language_id: item.language_id,
          slug: item.slug,
          title: item.title,
          description: item.description,
          content: item.content,
          is_published: item.is_published,
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
        language: item.language,
      }));

      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all posts (no language filter) - for dashboard
    let query = supabase
      .from('posts')
      .select('*');

    if (publishedParam !== 'false') {
      query = query.eq('is_published', true);
    }

    query = query.order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/blog/posts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * POST /api/blog/posts
 * Create a new post with initial translation
 * Body: {
 *   language_code: string,
 *   slug: string,
 *   title: string,
 *   description?: string,
 *   content: string,
 *   is_published?: boolean,
 *   featured_image?: string
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      language_code,
      slug,
      title,
      description,
      content,
      is_published,
      featured_image
    } = body;

    if (!language_code || !slug || !title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: language_code, slug, title, content' }),
        { status: 400 }
      );
    }

    // Get language ID
    const { data: langData, error: langError } = await supabase
      .from('languages')
      .select('id')
      .eq('code', language_code)
      .single();

    if (langError || !langData) {
      return new Response(
        JSON.stringify({ error: `Language "${language_code}" not found` }),
        { status: 404 }
      );
    }

    // Create post first
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        is_published: is_published ?? false,
        featured_image: featured_image || null,
      })
      .select()
      .single();

    if (postError) {
      return new Response(JSON.stringify({ error: postError.message }), { status: 500 });
    }

    // Create translation
    const { data: translationData, error: translationError } = await supabase
      .from('post_translations')
      .insert({
        post_id: postData.id,
        language_id: langData.id,
        slug,
        title,
        description: description || null,
        content,
        is_published: is_published ?? false,
      })
      .select()
      .single();

    if (translationError) {
      // Rollback: delete the post if translation creation fails
      await supabase.from('posts').delete().eq('id', postData.id);

      if (translationError.code === '23505') {
        return new Response(
          JSON.stringify({ error: `A post with slug "${slug}" already exists for ${language_code}` }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: translationError.message }), { status: 500 });
    }

    // Return the complete post with translation
    const result = {
      ...postData,
      translation: translationData,
    };

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog/posts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * PUT /api/blog/posts
 * Update post and/or translation
 * Query params:
 *   - id: string (post ID, required)
 * Body: {
 *   is_published?: boolean,  // Global publish status
 *   featured_image?: string
 * }
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
    const { is_published, featured_image } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (is_published !== undefined) updateData.is_published = is_published;
    if (featured_image !== undefined) updateData.featured_image = featured_image;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
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
    console.error('Error in PUT /api/blog/posts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * DELETE /api/blog/posts
 * Delete a post (cascade deletes all translations)
 * Query params:
 *   - id: string (post ID, required)
 */
export const DELETE: APIRoute = async ({ url }) => {
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
    console.error('Error in DELETE /api/blog/posts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};
