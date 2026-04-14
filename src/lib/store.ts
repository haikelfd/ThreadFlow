// Lightweight client-side state for smart tracking actions.
// Uses React context instead of a heavy state library.

import { createContext, useContext } from "react";
import type { PostStatus } from "@/types/reddit";

export interface TrackingAction {
  postId: string;
  status: PostStatus;
}

export interface AppState {
  statusOverrides: Record<string, PostStatus>;
  savedIds: Set<string>;
  setStatus: (postId: string, status: PostStatus) => void;
  toggleSaved: (postId: string) => void;
}

export const AppStateContext = createContext<AppState>({
  statusOverrides: {},
  savedIds: new Set(),
  setStatus: () => {},
  toggleSaved: () => {},
});

export function useAppState() {
  return useContext(AppStateContext);
}
