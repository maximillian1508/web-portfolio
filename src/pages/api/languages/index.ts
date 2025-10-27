export const prerender = false;
import { supabase } from "@services/supabase";
import type { APIRoute } from "astro";

/**
 * GET /api/languages
 * Query params:
 *   - active: 'true' | 'false' (default: only active languages)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const activeParam = url.searchParams.get('active');

    let query = supabase.from('languages').select('*');

    // Filter by active status (default: true)
    if (activeParam !== 'false') {
      query = query.eq('is_active', true);
    }

    // Order by sort_order
    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/languages:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * POST /api/languages
 * Create a new language
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code, name, native_name, is_active, sort_order } = body;

    if (!code || !name || !native_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: code, name, native_name' }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('languages')
      .insert({
        code,
        name,
        native_name,
        is_active: is_active ?? true,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: `Language with code "${code}" already exists` }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/languages:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * PUT /api/languages
 * Update an existing language
 * Query params:
 *   - id: string (language ID, required)
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
    const { code, name, native_name, is_active, sort_order } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (native_name !== undefined) updateData.native_name = native_name;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data, error } = await supabase
      .from('languages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: `Language with code "${code}" already exists` }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Language not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/languages:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};

/**
 * DELETE /api/languages
 * Delete a language
 * Query params:
 *   - id: string (language ID, required)
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
      .from('languages')
      .delete()
      .eq('id', id);

    if (error) {
      // Check if there are translations using this language
      if (error.code === '23503') {
        return new Response(
          JSON.stringify({ error: 'Cannot delete language with existing translations' }),
          { status: 409 }
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/languages:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};
