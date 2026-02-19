"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getCurrentSession, getCurrentUser, onAuthStateChange, signInWithGoogle, signOut } from "@/lib/auth";
import { getSupabaseConfigStatus } from "@/lib/supabaseClient";

const RESET_LOCAL_KEYS = [
  "streakman_tasks",
  "streakman_xp",
  "streakman_freeze_tokens",
  "streakman_first_use",
  "streakman_last_active",
  "streakman_first_complete",
  "streakman_onboarded",
  "streakman_username",
  "streakman_best_ever_streak",
  "streakman_daily_mission",
  "streakman_milestones_claimed",
  "streakman_milestone_xp_claimed",
  "streakman_forge_last_used",
  "streakman_city_last_update",
  "streakman_city_event",
  "streakman_shield_used",
  "streakman_total_completions",
  "streakman_last_spin",
  "streakman_last_reset_date",
  "gamificationIntensities",
  "minimalMode",
];

function getInitialMinimalMode() {
  if (typeof window === "undefined") return false;

  const saved = localStorage.getItem("minimalMode");
  if (!saved) return false;

  try {
    return JSON.parse(saved);
  } catch {
    return false;
  }
}

function getInitialUsername() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("streakman_username") || "";
}

export default function Settings() {
  const router = useRouter();
  const [minimalMode, setMinimalMode] = useState(() => getInitialMinimalMode());
  const [displayName, setDisplayName] = useState(() => getInitialUsername());
  const [profileSaved, setProfileSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const configStatus = getSupabaseConfigStatus();
  const supabaseReady = configStatus.ready;

  useEffect(() => {
    localStorage.setItem("minimalMode", JSON.stringify(minimalMode));
    window.dispatchEvent(new Event("settingsUpdated"));
  }, [minimalMode]);

  useEffect(() => {
    if (!profileSaved) return undefined;
    const timer = window.setTimeout(() => setProfileSaved(false), 1600);
    return () => window.clearTimeout(timer);
  }, [profileSaved]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { session } = await getCurrentSession();
        if (session?.user) {
          setCurrentUser(getCurrentUser());
        }
      } catch {
        // Keep settings functional in guest mode if auth bootstrap fails.
      }
    };

    const subscription = onAuthStateChange(() => {
      setCurrentUser(getCurrentUser());
    });

    void bootstrap();

    return () => subscription.unsubscribe();
  }, []);

  function saveDisplayName() {
    const nextName = displayName.trim() || "Explorer";
    localStorage.setItem("streakman_username", nextName);
    setDisplayName(nextName);
    setProfileSaved(true);
    window.dispatchEvent(new Event("settingsUpdated"));
  }

  function replayOnboarding() {
    localStorage.removeItem("streakman_onboarded");
    sessionStorage.removeItem("streakman_onboarding_checked");
    sessionStorage.removeItem("streakman_quick_intro_seen");
    router.push("/onboarding");
  }

  function resetAllAppData() {
    const confirmed = window.confirm(
      "This will permanently remove your local streak data on this device. Continue?"
    );
    if (!confirmed) return;

    RESET_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem("streakman_onboarding_checked");
    sessionStorage.removeItem("streakman_quick_intro_seen");

    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("xpUpdated"));
    window.dispatchEvent(new Event("tokensUpdated"));
    window.dispatchEvent(new Event("settingsUpdated"));

    setDisplayName("");
    setShowResetConfirm(false);
    router.replace("/tasks");
  }

  async function handleConnectGoogle() {
    if (!supabaseReady) {
      setAuthError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError("");
      await signInWithGoogle("/settings");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Unable to start Google sign in.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signOut();
      setCurrentUser(null);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Unable to sign out right now.");
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage your profile, onboarding, and app data.</p>
          </header>

          <section className="glass-card mb-6 rounded-3xl p-6" data-active="true">
            <h2 className="text-xl font-semibold">Profile</h2>
            <p className="mt-1 text-sm text-zinc-400">Choose how your name appears across your city and progress pages.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                onBlur={saveDisplayName}
                placeholder="Explorer"
                className="glass-card h-11 w-full rounded-xl px-3 text-sm outline-none placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={saveDisplayName}
                className="glass-card min-h-11 rounded-xl px-4 text-sm font-semibold text-teal-200"
              >
                Save Name
              </button>
            </div>

            {profileSaved && <p className="mt-2 text-xs text-emerald-300">Name saved.</p>}
          </section>

          <section className="glass-card mb-6 rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Onboarding</h2>
            <p className="mt-1 text-sm text-zinc-400">Replay the full onboarding flow from the start whenever you want.</p>

            <button
              type="button"
              onClick={replayOnboarding}
              className="glass-card mt-4 min-h-11 rounded-xl px-4 text-sm font-semibold text-teal-200"
            >
              Replay Full Onboarding
            </button>
          </section>

          <section className="glass-card mb-6 rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">Minimal Mode</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Simplifies the interface by reducing visual intensity and keeping task actions in focus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMinimalMode((current) => !current)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    minimalMode ? "bg-teal-300" : "bg-white/20"
                  }`}
                  aria-label="Toggle minimal mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      minimalMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card mb-6 rounded-3xl border border-rose-300/25 p-6">
            <h2 className="text-xl font-semibold text-rose-300">Danger Zone</h2>
            <p className="mt-1 text-sm text-zinc-400">Delete all local app data on this device and restart from scratch.</p>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="glass-card mt-4 min-h-11 rounded-xl px-4 text-sm font-semibold text-rose-300"
              >
                Reset All App Data
              </button>
            ) : (
              <div className="mt-4 rounded-xl border border-rose-300/35 bg-rose-300/10 p-4">
                <p className="text-sm text-rose-200">This will clear tasks, XP, tokens, onboarding state, and settings.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={resetAllAppData}
                    className="glass-card min-h-11 rounded-xl px-4 text-sm font-semibold text-rose-300"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="glass-card min-h-11 rounded-xl px-4 text-sm font-semibold text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="mt-2 text-sm text-zinc-500">Notification preferences are coming soon.</p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Account</h2>
              {currentUser ? (
                <>
                  <p className="mt-2 text-sm text-zinc-400">Signed in as</p>
                  <p className="font-semibold text-zinc-200">{currentUser.name || currentUser.email}</p>
                  <p className="mt-1 text-sm text-zinc-500">{currentUser.email}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="glass-card mt-4 min-h-11 rounded-xl px-4 text-sm font-semibold text-rose-300"
                  >
                    {authLoading ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-zinc-400">Sign in is optional. Connect Google for cloud sync.</p>
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    disabled={authLoading}
                    className="glass-card mt-4 min-h-11 rounded-xl px-4 text-sm font-semibold text-teal-200"
                  >
                    {authLoading ? "Connecting..." : "Connect Google Account"}
                  </button>
                  {!supabaseReady && (
                    <p className="mt-3 text-xs text-amber-200">
                      Supabase env vars are missing ({!configStatus.hasUrl ? "URL " : ""}
                      {!configStatus.hasAnonKey ? "ANON_KEY" : ""}). Guest mode works without cloud sync.
                    </p>
                  )}
                </>
              )}

              {authError && <p className="mt-3 text-sm text-rose-300">{authError}</p>}
            </div>
          </section>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
