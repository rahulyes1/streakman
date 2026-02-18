"use client";

import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

function readPublicEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function hasSupabaseConfig() {
  return Boolean(readPublicEnv("NEXT_PUBLIC_SUPABASE_URL") && readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function getSupabaseClient() {
  if (!hasSupabaseConfig()) return null;
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = readPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  supabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabaseClient;
}
