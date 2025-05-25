export const prerender = false;
import { supabase } from "@services/supabase";
import { generateSlug } from "@lib/utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase.from("blog").select("*");
  return new Response(JSON.stringify(data), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const { data, error } = await supabase.from("blog").insert({
    title: "My first blog post",
    content: "This is my first blog post",
  });
  return new Response(JSON.stringify(data), { status: 200 });
};

export const PUT: APIRoute = async ({ request }) => {
  const { data, error } = await supabase.from("blog").update({
    title: "My first blog post",
    content: "This is my first blog post",
  });
  return new Response(JSON.stringify(data), { status: 200 });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { data, error } = await supabase.from("blog").delete();
  return new Response(JSON.stringify(data), { status: 200 });
};
