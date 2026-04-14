"use client";

import { useState, useCallback, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AppStateContext } from "@/lib/store";
import type { PostStatus } from "@/types/reddit";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, PostStatus>
  >({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const setStatus = useCallback((postId: string, status: PostStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [postId]: status }));
  }, []);

  const toggleSaved = useCallback((postId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  return (
    <SessionProvider>
      <AppStateContext.Provider
        value={{ statusOverrides, savedIds, setStatus, toggleSaved }}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </AppStateContext.Provider>
    </SessionProvider>
  );
}
