// In-memory keyword store for MVP.
// In production, replace with a database (Postgres, Redis, etc.)

import type { TrackedKeyword, KeywordMatch } from "@/types/reddit";

interface KeywordStore {
  keywords: TrackedKeyword[];
  matches: KeywordMatch[];
  lastPoll: number;
}

const store: KeywordStore = {
  keywords: [],
  matches: [],
  lastPoll: 0,
};

export function getKeywords(): TrackedKeyword[] {
  return store.keywords;
}

export function getMatches(keywordId?: string): KeywordMatch[] {
  if (keywordId) {
    return store.matches.filter((m) => m.keywordId === keywordId);
  }
  return store.matches;
}

export function addKeyword(keyword: Omit<TrackedKeyword, "id" | "createdAt" | "matchCount">): TrackedKeyword {
  const kw: TrackedKeyword = {
    ...keyword,
    id: `kw_${Date.now()}`,
    createdAt: Date.now() / 1000,
    matchCount: 0,
  };
  store.keywords.push(kw);
  return kw;
}

export function removeKeyword(id: string) {
  store.keywords = store.keywords.filter((k) => k.id !== id);
  store.matches = store.matches.filter((m) => m.keywordId !== id);
}

export function toggleKeyword(id: string) {
  const kw = store.keywords.find((k) => k.id === id);
  if (kw) kw.isActive = !kw.isActive;
}

export function addMatches(matches: KeywordMatch[]) {
  // Deduplicate by permalink
  const existing = new Set(store.matches.map((m) => m.permalink));
  const newMatches = matches.filter((m) => !existing.has(m.permalink));
  store.matches.push(...newMatches);

  // Update match counts
  for (const kw of store.keywords) {
    kw.matchCount = store.matches.filter((m) => m.keywordId === kw.id).length;
  }

  return newMatches.length;
}

export function markReplied(matchId: string) {
  const match = store.matches.find((m) => m.id === matchId);
  if (match) match.replied = true;
}

export function getLastPoll(): number {
  return store.lastPoll;
}

export function setLastPoll(time: number) {
  store.lastPoll = time;
}
