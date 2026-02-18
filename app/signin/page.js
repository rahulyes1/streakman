"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentSession, onAuthStateChange, signInWithGoogle } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/supabaseClient";

function SignInContent() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const nextPath = nextParam && nextParam.startsWith("/") ? nextParam : "/tasks";
  const supabaseReady = hasSupabaseConfig();

  useEffect(() => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setCheckingSession(false);
      }
    }, 3000);

    const bootstrap = async () => {
      try {
        const { session } = await getCurrentSession();
        if (session?.user) {
          router.replace(nextPath);
          return;
        }
      } catch {
        // Keep page usable even if initial session fetch fails.
      } finally {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          setCheckingSession(false);
        }
      }
    };

    const subscription = onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace(nextPath);
      }
    });

    void bootstrap();

    return () => {
      settled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [nextPath, router]);

  const handleGoogleSignIn = async () => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await signInWithGoogle(nextPath);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unable to start Google sign in.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 py-8 text-zinc-100">
      <div className="mesh-leak mesh-leak-teal" />
      <div className="mesh-leak mesh-leak-purple" />

      <div className="relative z-10 mx-auto max-w-md pt-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Streakman</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in with Google to sync your data across devices.</p>
        </header>

        <div className="glass-card rounded-3xl p-5 sm:p-6" data-active="true">
          {checkingSession ? (
            <p className="py-8 text-center text-sm text-zinc-400">Checking session...</p>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className={`glass-card min-h-11 w-full rounded-xl px-4 text-sm font-semibold ${
                  submitting
                    ? "cursor-not-allowed text-zinc-500"
                    : "bg-gradient-to-r from-teal-300/20 to-purple-300/20 text-zinc-100"
                }`}
              >
                {submitting ? "Redirecting..." : "Continue with Google"}
              </button>

              <button
                type="button"
                onClick={() => router.replace(nextPath)}
                className="glass-card mt-3 min-h-11 w-full rounded-xl px-4 text-sm font-semibold text-zinc-300"
              >
                Continue as Guest
              </button>

              {!supabaseReady && (
                <p className="mt-4 rounded-xl bg-amber-200/10 p-3 text-xs text-amber-200">
                  Supabase env vars are missing. Guest mode still works, but cloud sync is disabled.
                </p>
              )}

              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

              <p className="mt-4 text-xs text-zinc-500">
                Sign-in is optional. Use it when you want cloud backup and cross-device sync.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-zinc-400">
          Loading...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
