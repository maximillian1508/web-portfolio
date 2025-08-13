export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../services/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Return JSON response for debugging instead of redirects
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const honeypot = formData.get("website")?.toString();

    // Security: Check honeypot field (should be empty)
    if (honeypot) {
      return new Response(JSON.stringify({ error: "Bot detected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Security: Basic rate limiting check
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    if (isBot) {
      return new Response(JSON.stringify({ error: "Bot detected via user agent" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check environment variables
    const envCheck = {
      supabase_url: !!import.meta.env.SUPABASE_URL,
      supabase_key: !!import.meta.env.SUPABASE_ANON_KEY,
      url_value: import.meta.env.SUPABASE_URL,
      key_length: import.meta.env.SUPABASE_ANON_KEY?.length || 0
    };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ 
        error: "Supabase auth error", 
        details: error.message,
        env_check: envCheck
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Success - for now just return success message instead of redirect
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Login successful",
      env_check: envCheck
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Login API error:", err);
    // Return detailed error for debugging
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : "No stack trace",
      env_check: {
        supabase_url: !!process.env.SUPABASE_URL,
        supabase_key: !!process.env.SUPABASE_ANON_KEY
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
