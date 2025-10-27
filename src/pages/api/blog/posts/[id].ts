export const prerender = false;
import { supabase } from "@services/supabase";
import type { APIRoute } from "astro";

/**
 * GET /api/blog/posts/[id]
 * Get a post with all its translations
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing post ID" }), {
        status: 400,
      });
    }

    // Get the post
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (postError) {
      return new Response(JSON.stringify({ error: postError.message }), {
        status: postError.code === "PGRST116" ? 404 : 500,
      });
    }

    // Get all translations for this post
    const { data: translationsData, error: translationsError } = await supabase
      .from("post_translations")
      .select(
        `
        *,
        language:languages(*)
      `
      )
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (translationsError) {
      return new Response(
        JSON.stringify({ error: translationsError.message }),
        {
          status: 500,
        }
      );
    }

    // Combine into result
    const result = {
      ...postData,
      translations: translationsData.map((t: any) => ({
        id: t.id,
        post_id: t.post_id,
        language_id: t.language_id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        content: t.content,
        is_published: t.is_published,
        created_at: t.created_at,
        updated_at: t.updated_at,
        language: t.language,
      })),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/blog/posts/[id]:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
