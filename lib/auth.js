"use client";

import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabaseClient";

const AUTH_USER_CACHE_KEY = "streakman_auth_user_cache";
const STALE_AUTH_KEYS = ["streakman_auth", "streakman_auth_user", "streakman_auth_users"];

function readJSON(key, fallbackValue) {
  if (typeof window === "undefined") return fallbackValue;

  const raw = localStorage.getItem(key);
  if (!raw) return fallbackValue;

  try {
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function clearKey(key) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

function pickDisplayName(user) {
  if (!user) return "";
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.preferred_username ||
    (user.email ? user.email.split("@")[0] : "")
  );
}

function toSerializableUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
    name: pickDisplayName(user),
    avatarUrl: user.user_metadata?.avatar_url || "",
  };
}

function cacheUser(user) {
  if (user) {
    writeJSON(AUTH_USER_CACHE_KEY, toSerializableUser(user));
    return;
  }

  clearKey(AUTH_USER_CACHE_KEY);
}

function emitAuthUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("authUpdated"));
}

function clearStaleLocalAuth() {
  if (typeof window === "undefined") return;
  STALE_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function getCurrentUser() {
  return readJSON(AUTH_USER_CACHE_KEY, null);
}

export async function getCurrentSession() {
  clearStaleLocalAuth();

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { session: null, error: hasSupabaseConfig() ? null : new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase.auth.getSession();
  cacheUser(data.session?.user ?? null);

  return {
    session: data.session ?? null,
    error,
  };
}

export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      unsubscribe() {},
    };
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    cacheUser(session?.user ?? null);
    emitAuthUpdated();
    if (callback) callback(event, session);
  });

  return {
    unsubscribe() {
      data.subscription.unsubscribe();
    },
  };
}

export async function signInWithGoogle(nextPath = "/tasks") {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/tasks";
  const redirectTo = `${window.location.origin}/signin?next=${encodeURIComponent(safeNextPath)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  cacheUser(null);
  clearStaleLocalAuth();
  emitAuthUpdated();
}
