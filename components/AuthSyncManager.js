"use client";

import { useEffect, useRef } from "react";
import { getCurrentSession, onAuthStateChange } from "@/lib/auth";
import { scheduleDebouncedCloudSave, syncOnLogin } from "@/lib/cloudState";

const SYNC_EVENTS = ["tasksUpdated", "xpUpdated", "tokensUpdated", "settingsUpdated"];

export default function AuthSyncManager() {
  const userIdRef = useRef(null);

  useEffect(() => {
    const onDataMutation = () => {
      if (!userIdRef.current) return;
      scheduleDebouncedCloudSave(userIdRef.current);
    };

    const bootstrap = async () => {
      try {
        const { session } = await getCurrentSession();
        const userId = session?.user?.id || null;
        userIdRef.current = userId;

        if (userId) {
          await syncOnLogin({ userId, mergeStrategy: "prompt" });
        }
      } catch (error) {
        console.error("Auth bootstrap sync failed", error);
      }
    };

    SYNC_EVENTS.forEach((eventName) => window.addEventListener(eventName, onDataMutation));
    void bootstrap();

    const authSubscription = onAuthStateChange(async (_event, session) => {
      const userId = session?.user?.id || null;
      userIdRef.current = userId;

      if (userId) {
        try {
          await syncOnLogin({ userId, mergeStrategy: "prompt" });
        } catch (error) {
          console.error("Auth event sync failed", error);
        }
      }
    });

    return () => {
      SYNC_EVENTS.forEach((eventName) => window.removeEventListener(eventName, onDataMutation));
      authSubscription.unsubscribe();
    };
  }, []);

  return null;
}
