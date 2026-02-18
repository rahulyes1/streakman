"use client";

import { getSupabaseClient } from "@/lib/supabaseClient";

const SCHEMA_VERSION = 1;
const MERGE_PREF_KEY_PREFIX = "streakman_merge_pref_";
const STORAGE = {
  tasks: "streakman_tasks",
  xp: "streakman_xp",
  freezeTokens: "streakman_freeze_tokens",
  totalCompletions: "streakman_total_completions",
  lastSpinDate: "streakman_last_spin",
  firstUseDate: "streakman_first_use",
  lastResetDate: "streakman_last_reset_date",
  gamificationIntensities: "gamificationIntensities",
  minimalMode: "minimalMode",
};

let debounceTimer = null;

function parseJSON(raw, fallbackValue) {
  if (!raw) return fallbackValue;

  try {
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function normalizeSnapshot(raw = {}) {
  return {
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    xp: Number.isFinite(Number(raw.xp)) ? Number(raw.xp) : 0,
    freezeTokens: Number.isFinite(Number(raw.freezeTokens)) ? Number(raw.freezeTokens) : 0,
    totalCompletions: Number.isFinite(Number(raw.totalCompletions)) ? Number(raw.totalCompletions) : 0,
    lastSpinDate: raw.lastSpinDate || null,
    firstUseDate: raw.firstUseDate || null,
    lastResetDate: raw.lastResetDate || null,
    gamificationIntensities:
      raw.gamificationIntensities && typeof raw.gamificationIntensities === "object"
        ? raw.gamificationIntensities
        : {
            surprise: 2,
            competition: 2,
            progression: 2,
            achievement: 2,
            reminders: 2,
          },
    minimalMode: Boolean(raw.minimalMode),
    metadata: {
      schemaVersion: SCHEMA_VERSION,
      lastSyncedAt: raw.metadata?.lastSyncedAt || null,
    },
  };
}

function dispatchLocalStateEvents() {
  window.dispatchEvent(new Event("tasksUpdated"));
  window.dispatchEvent(new Event("xpUpdated"));
  window.dispatchEvent(new Event("tokensUpdated"));
  window.dispatchEvent(new Event("settingsUpdated"));
}

function mergePreferenceKey(userId) {
  return `${MERGE_PREF_KEY_PREFIX}${userId}`;
}

export function readLocalSnapshot() {
  if (typeof window === "undefined") return normalizeSnapshot();

  const snapshot = {
    tasks: parseJSON(localStorage.getItem(STORAGE.tasks), []),
    xp: parseInt(localStorage.getItem(STORAGE.xp) || "0", 10),
    freezeTokens: parseInt(localStorage.getItem(STORAGE.freezeTokens) || "0", 10),
    totalCompletions: parseInt(localStorage.getItem(STORAGE.totalCompletions) || "0", 10),
    lastSpinDate: localStorage.getItem(STORAGE.lastSpinDate),
    firstUseDate: localStorage.getItem(STORAGE.firstUseDate),
    lastResetDate: localStorage.getItem(STORAGE.lastResetDate),
    gamificationIntensities: parseJSON(localStorage.getItem(STORAGE.gamificationIntensities), {
      surprise: 2,
      competition: 2,
      progression: 2,
      achievement: 2,
      reminders: 2,
    }),
    minimalMode: parseJSON(localStorage.getItem(STORAGE.minimalMode), false),
    metadata: {
      schemaVersion: SCHEMA_VERSION,
      lastSyncedAt: null,
    },
  };

  return normalizeSnapshot(snapshot);
}

export function writeLocalSnapshot(snapshot) {
  if (typeof window === "undefined") return;

  const normalized = normalizeSnapshot(snapshot);

  localStorage.setItem(STORAGE.tasks, JSON.stringify(normalized.tasks));
  localStorage.setItem(STORAGE.xp, String(normalized.xp));
  localStorage.setItem(STORAGE.freezeTokens, String(normalized.freezeTokens));
  localStorage.setItem(STORAGE.totalCompletions, String(normalized.totalCompletions));

  if (normalized.lastSpinDate) localStorage.setItem(STORAGE.lastSpinDate, normalized.lastSpinDate);
  else localStorage.removeItem(STORAGE.lastSpinDate);

  if (normalized.firstUseDate) localStorage.setItem(STORAGE.firstUseDate, normalized.firstUseDate);
  else localStorage.removeItem(STORAGE.firstUseDate);

  if (normalized.lastResetDate) localStorage.setItem(STORAGE.lastResetDate, normalized.lastResetDate);
  else localStorage.removeItem(STORAGE.lastResetDate);

  localStorage.setItem(STORAGE.gamificationIntensities, JSON.stringify(normalized.gamificationIntensities));
  localStorage.setItem(STORAGE.minimalMode, JSON.stringify(normalized.minimalMode));

  dispatchLocalStateEvents();
}

export async function fetchCloudSnapshot(userId) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("user_app_state")
    .select("state, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.state) return null;

  return normalizeSnapshot({
    ...data.state,
    metadata: {
      ...data.state?.metadata,
      schemaVersion: SCHEMA_VERSION,
      lastSyncedAt: data.updated_at,
    },
  });
}

export async function upsertCloudSnapshot(userId, snapshot) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  const normalized = normalizeSnapshot(snapshot);
  const payload = {
    ...normalized,
    metadata: {
      ...normalized.metadata,
      schemaVersion: SCHEMA_VERSION,
      lastSyncedAt: new Date().toISOString(),
    },
  };

  const { error } = await supabase.from("user_app_state").upsert(
    {
      user_id: userId,
      state: payload,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) throw error;
}

function resolveMergeChoice(userId, mergeStrategy) {
  if (mergeStrategy === "cloud" || mergeStrategy === "local") return mergeStrategy;

  const prefKey = mergePreferenceKey(userId);
  const cached = localStorage.getItem(prefKey);
  if (cached === "cloud" || cached === "local") return cached;

  const useLocal = window.confirm(
    "Cloud data already exists for this account. Press OK to use this device data, or Cancel to keep cloud data (recommended)."
  );

  const choice = useLocal ? "local" : "cloud";
  localStorage.setItem(prefKey, choice);
  return choice;
}

export async function syncOnLogin({ userId, mergeStrategy = "prompt" } = {}) {
  if (!userId || typeof window === "undefined") return { source: "none" };

  const localSnapshot = readLocalSnapshot();
  const cloudSnapshot = await fetchCloudSnapshot(userId);

  if (!cloudSnapshot) {
    await upsertCloudSnapshot(userId, localSnapshot);
    return { source: "local_uploaded" };
  }

  const choice = resolveMergeChoice(userId, mergeStrategy);

  if (choice === "local") {
    await upsertCloudSnapshot(userId, localSnapshot);
    return { source: "local_overwrote_cloud" };
  }

  writeLocalSnapshot(cloudSnapshot);
  return { source: "cloud_applied" };
}

export function scheduleDebouncedCloudSave(userId, delay = 800) {
  if (!userId) return;

  if (debounceTimer) window.clearTimeout(debounceTimer);

  debounceTimer = window.setTimeout(() => {
    debounceTimer = null;

    upsertCloudSnapshot(userId, readLocalSnapshot()).catch((error) => {
      console.error("Cloud sync failed", error);
    });
  }, delay);
}
