"use client";

import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

function readPublicEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getSupabaseConfigStatus() {
  const url = readPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    ready: Boolean(url && anonKey),
  };
}

export function hasSupabaseConfig() {
  return getSupabaseConfigStatus().ready;
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
