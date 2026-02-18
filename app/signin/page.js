"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerWithEmail, signInWithEmail } from "@/lib/auth";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
};

function SignInContent() {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const nextPath = nextParam && nextParam.startsWith("/") ? nextParam : "/tasks";

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup" && !form.name.trim()) {
      setError("Name is required for sign up.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "signup") {
        registerWithEmail({
          name: form.name.trim(),
          email,
          password,
        });
      } else {
        signInWithEmail({
          email,
          password,
        });
      }

      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in right now.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 py-8 text-zinc-100">
      <div className="mesh-leak mesh-leak-teal" />
      <div className="mesh-leak mesh-leak-purple" />

      <div className="relative z-10 mx-auto max-w-md pt-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Streakman</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === "signin" ? "Sign in to continue your streaks." : "Create your account to start tracking."}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-5 sm:p-6" data-active="true">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`min-h-11 rounded-lg text-sm font-semibold transition-spring ${
                mode === "signin" ? "bg-teal-300/20 text-teal-100" : "text-zinc-400"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`min-h-11 rounded-lg text-sm font-semibold transition-spring ${
                mode === "signup" ? "bg-teal-300/20 text-teal-100" : "text-zinc-400"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-3">
            {mode === "signup" && (
              <label className="block text-sm">
                <span className="mb-2 block text-zinc-300">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="glass-card h-11 w-full rounded-xl px-3 outline-none placeholder:text-zinc-500"
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="block text-sm">
              <span className="mb-2 block text-zinc-300">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="glass-card h-11 w-full rounded-xl px-3 outline-none placeholder:text-zinc-500"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-zinc-300">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                className="glass-card h-11 w-full rounded-xl px-3 outline-none placeholder:text-zinc-500"
                placeholder="Password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={`glass-card mt-5 min-h-11 w-full rounded-xl text-sm font-semibold ${
              submitting
                ? "cursor-not-allowed text-zinc-500"
                : "bg-gradient-to-r from-teal-300/20 to-purple-300/20 text-zinc-100"
            }`}
          >
            {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <p className="mt-4 text-xs text-zinc-500">
            Local sign-in for this device. Use the same email/password to return.
          </p>
        </form>
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
