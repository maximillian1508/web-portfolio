export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../services/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const honeypot = formData.get("website")?.toString();

  // Security: Check honeypot field (should be empty)
  if (honeypot) {
    // Bot detected, redirect to 404
    return redirect("/404");
  }

  // Security: Basic rate limiting check (you could enhance this with a database)
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

  if (isBot) {
    return redirect("/404");
  }

  if (!email || !password) {
    return redirect("/login?error=missing_credentials");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
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

  return redirect("/dashboard");
};
