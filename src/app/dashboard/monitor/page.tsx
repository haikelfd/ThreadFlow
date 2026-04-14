"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  Plus,
  Search,
  ArrowBigUp,
  MessageCircle,
  ExternalLink,
  Reply,
  Zap,
  X,
  Eye,
  EyeOff,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";
import { SubredditHoverCard } from "@/components/subreddit-hover-card";
import { mockKeywords, mockKeywordMatches } from "@/lib/mock-data";
import { ComposeReply } from "@/components/dashboard/compose-reply";
import type { TrackedKeyword, KeywordMatch } from "@/types/reddit";

function OpportunityBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-[var(--signal-green)]/15 text-[var(--signal-green)] border-[var(--signal-green)]/30"
      : score >= 70
        ? "bg-[var(--signal-orange)]/15 text-[var(--signal-orange)] border-[var(--signal-orange)]/30"
        : "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30";

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", color)}>
      <Zap className="h-3 w-3" />
      {score}% match
    </Badge>
  );
}

function highlightKeyword(text: string, keyword: string) {
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="rounded bg-primary/20 px-0.5 text-primary"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function MonitorPage() {
  const [keywords, setKeywords] = useState<TrackedKeyword[]>(mockKeywords);
  const [matches, setMatches] = useState<KeywordMatch[]>(mockKeywordMatches);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<KeywordMatch | null>(null);
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [repliedIds, setRepliedIds] = useState<Set<string>>(new Set());

  const filteredMatches = activeKeyword
    ? matches.filter((m) => m.keywordId === activeKeyword)
    : matches;

  const sortedMatches = [...filteredMatches].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );

  const activeKeywords = keywords.filter((k) => k.isActive);

  function handleAddKeyword() {
    if (!newKeyword.trim()) return;
    const kw: TrackedKeyword = {
      id: `kw_${Date.now()}`,
      keyword: newKeyword.trim(),
      subreddits: [],
      createdAt: Date.now() / 1000,
      matchCount: 0,
      isActive: true,
    };
    setKeywords((prev) => [...prev, kw]);
    setNewKeyword("");
    setAddingKeyword(false);
  }

  function handleToggleKeyword(id: string) {
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isActive: !k.isActive } : k))
    );
  }

  function handleReplied(matchId: string) {
    setRepliedIds((prev) => new Set(prev).add(matchId));
    setReplyingTo(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Radar className="h-6 w-6 text-primary" />
            Keyword Monitor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track keywords across Reddit and find engagement opportunities
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground"
          onClick={() => setAddingKeyword(true)}
        >
          <Plus className="h-4 w-4" />
          Add Keyword
        </Button>
      </div>

      {/* Add keyword input */}
      <AnimatePresence>
        {addingKeyword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2 rounded-xl border border-primary/30 bg-card p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                  placeholder='e.g. "best CRM for startups", "notion alternative"'
                  className="w-full rounded-lg border border-border/60 bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <Button size="sm" onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
                Track
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAddingKeyword(false);
                  setNewKeyword("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyword pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveKeyword(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-all",
            activeKeyword === null
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/50 text-muted-foreground hover:border-primary/30"
          )}
        >
          All ({matches.length})
        </button>
        {keywords.map((kw) => (
          <div key={kw.id} className="group relative flex items-center">
            <button
              onClick={() =>
                setActiveKeyword(activeKeyword === kw.id ? null : kw.id)
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                !kw.isActive && "opacity-50",
                activeKeyword === kw.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/30"
              )}
            >
              <span>&quot;{kw.keyword}&quot;</span>
              <span className="text-xs opacity-60">{kw.matchCount}</span>
            </button>
            <button
              onClick={() => handleToggleKeyword(kw.id)}
              className="ml-1 rounded-md p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              title={kw.isActive ? "Pause" : "Resume"}
            >
              {kw.isActive ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}
      </div>

      <Separator className="mb-6" />

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            {sortedMatches.length} opportunities found
            {activeKeyword &&
              ` for "${keywords.find((k) => k.id === activeKeyword)?.keyword}"`}
          </span>
          <span className="ml-auto text-xs">Sorted by opportunity score</span>
        </div>

        {sortedMatches.map((match, i) => {
          const hasReplied = repliedIds.has(match.id) || match.replied;
          const isReplying = replyingTo?.id === match.id;

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={cn(
                "rounded-xl border bg-card p-5 transition-all",
                hasReplied
                  ? "border-[var(--signal-green)]/20 opacity-60"
                  : "border-border/60 hover:border-primary/30"
              )}
            >
              {/* Match header */}
              <div className="mb-2 flex items-center gap-2 text-sm">
                <SubredditHoverCard subreddit={match.subreddit}>
                  <span className="font-medium text-primary/80 cursor-pointer hover:underline">
                    {match.subreddit}
                  </span>
                </SubredditHoverCard>
                <span className="text-muted-foreground/50">&middot;</span>
                <TimeAgo timestamp={match.createdUtc} className="text-muted-foreground" />
                <span className="text-muted-foreground/50">&middot;</span>
                <span className="text-xs text-muted-foreground">
                  by {match.author}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <OpportunityBadge score={match.opportunityScore} />
                  {hasReplied && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-[var(--signal-green)]/30 bg-[var(--signal-green)]/10 text-xs text-[var(--signal-green)]"
                    >
                      <Check className="h-3 w-3" />
                      Replied
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-2 font-medium leading-snug">
                {match.isComment ? (
                  <span className="mr-1.5 text-xs text-muted-foreground">
                    [comment]
                  </span>
                ) : null}
                {highlightKeyword(match.postTitle, match.keyword)}
              </h3>

              {/* Body preview */}
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {highlightKeyword(match.postBody, match.keyword)}
              </p>

              {/* Engagement + actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ArrowBigUp className="h-4 w-4" />
                  <span>{match.score}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{match.numComments}</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {!hasReplied && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() =>
                        setReplyingTo(isReplying ? null : match)
                      }
                    >
                      <Reply className="h-3.5 w-3.5" />
                      {isReplying ? "Cancel" : "Reply"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline reply */}
              <AnimatePresence>
                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <ComposeReply
                      parentAuthor={match.author}
                      parentBody={match.postBody}
                      subreddit={match.subreddit}
                      threadTitle={match.postTitle}
                      onSend={() => handleReplied(match.id)}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
