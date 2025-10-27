export const prerender = false;
import { supabase } from "@services/supabase";
import type { APIRoute } from "astro";

/**
 * POST /api/blog/translations
 * Add a new translation to an existing post
 * Body: {
 *   post_id: string,
 *   language_code: string,
 *   slug: string,
 *   title: string,
 *   description?: string,
 *   content: string,
 *   is_published?: boolean
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      post_id,
      language_code,
      slug,
      title,
      description,
      content,
      is_published
    } = body;

    if (!post_id || !language_code || !slug || !title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: post_id, language_code, slug, title, content' }),
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

    // Verify post exists
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();

    if (postError || !postData) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404 }
      );
    }

    // Create translation
    const { data, error } = await supabase
      .from('post_translations')
      .insert({
        post_id,
        language_id: langData.id,
        slug,
        title,
        description: description || null,
        content,
        is_published: is_published ?? false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const constraintMatch = error.message.match(/unique_(\w+)/);
        if (constraintMatch) {
          if (constraintMatch[1] === 'post_language') {
            return new Response(
              JSON.stringify({ error: `Translation for ${language_code} already exists for this post` }),
              { status: 409 }
            );
          } else if (constraintMatch[1] === 'slug_language') {
            return new Response(
              JSON.stringify({ error: `A post with slug "${slug}" already exists for ${language_code}` }),
              { status: 409 }
            );
          }
        }
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog/translations:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * PUT /api/blog/translations
 * Update an existing translation
 * Query params:
 *   - id: string (translation ID, required)
 * Body: {
 *   slug?: string,
 *   title?: string,
 *   description?: string,
 *   content?: string,
 *   is_published?: boolean
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
    const { slug, title, description, content, is_published } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data, error } = await supabase
      .from('post_translations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: `A post with slug "${slug}" already exists for this language` }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Translation not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/blog/translations:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * DELETE /api/blog/translations
 * Delete a translation
 * Query params:
 *   - id: string (translation ID, required)
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
      .from('post_translations')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/blog/translations:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};
