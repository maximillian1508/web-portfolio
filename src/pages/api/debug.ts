export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    // Test environment variables
    const envCheck = {
      import_meta_env: {
        supabase_url: !!import.meta.env.SUPABASE_URL,
        supabase_key: !!import.meta.env.SUPABASE_ANON_KEY,
        url_length: import.meta.env.SUPABASE_URL?.length || 0,
        key_length: import.meta.env.SUPABASE_ANON_KEY?.length || 0
      },
      process_env: {
        supabase_url: !!process.env.SUPABASE_URL,
        supabase_key: !!process.env.SUPABASE_ANON_KEY,
        url_length: process.env.SUPABASE_URL?.length || 0,
        key_length: process.env.SUPABASE_ANON_KEY?.length || 0
      }
    };

    // Try to import supabase
    const { supabase } = await import("../../services/supabase");
    
    // Try a simple supabase call
    const { data, error } = await supabase.from("_supabase_migrations").select("*").limit(1);
    
    return new Response(JSON.stringify({
      status: "API working",
      env_check: envCheck,
      supabase_test: {
        error: error?.message || null,
        success: !error
      },
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Debug API failed",
      details: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : "No stack trace"
    }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};