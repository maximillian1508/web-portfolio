export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../services/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    console.log("Login API called");
    
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const honeypot = formData.get("website")?.toString();

    console.log("Form data parsed", { email: !!email, password: !!password, honeypot: !!honeypot });

    // Security: Check honeypot field (should be empty)
    if (honeypot) {
      console.log("Bot detected via honeypot");
      return redirect("/404");
    }

    // Security: Basic rate limiting check (you could enhance this with a database)
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    if (isBot) {
      console.log("Bot detected via user agent");
      return redirect("/404");
    }

    if (!email || !password) {
      console.log("Missing credentials");
      return redirect("/login?error=missing_credentials");
    }

    console.log("About to call Supabase auth");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase response", { hasData: !!data, hasError: !!error, errorMessage: error?.message });

    if (error) {
      console.log("Supabase error:", error);
      return redirect("/login?error=invalid_credentials");
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log("Login successful, redirecting to dashboard");
    return redirect("/dashboard");
  } catch (err) {
    console.error("Login API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
