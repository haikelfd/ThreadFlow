"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  X,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockEligibility } from "@/lib/mock-data";
import type { SubredditEligibility, SubredditRequirement, ContentRule, RuleSeverity } from "@/types/reddit";

const statusConfig = {
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    color: "text-[var(--signal-green)]",
    bg: "bg-[var(--signal-green)]/10",
    border: "border-[var(--signal-green)]/30",
    description: "You can post and comment freely",
  },
  limited: {
    label: "Limited",
    icon: AlertTriangle,
    color: "text-[var(--signal-orange)]",
    bg: "bg-[var(--signal-orange)]/10",
    border: "border-[var(--signal-orange)]/30",
    description: "You can comment but can't post yet",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    description: "You need to build more reputation here",
  },
};

const severityConfig: Record<RuleSeverity, { label: string; className: string }> = {
  ban: {
    label: "Ban risk",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  remove: {
    label: "Post removed",
    className: "border-[var(--signal-orange)]/40 bg-[var(--signal-orange)]/10 text-[var(--signal-orange)]",
  },
  warn: {
    label: "Warning",
    className: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  },
};

const categoryLabels: Record<string, string> = {
  self_promotion: "Self-Promotion",
  links: "Links & URLs",
  content_type: "Content Type",
  formatting: "Formatting",
  behavior: "Behavior",
  spam: "Spam",
};

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5 }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  );
}

function RequirementRow({ req }: { req: SubredditRequirement }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {req.met ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--signal-green)]" />
      ) : (
        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", req.met ? "text-muted-foreground" : "text-foreground")}>
          {req.label}
        </p>
        {!req.met && req.progress !== undefined && (
          <div className="mt-1 flex items-center gap-2">
            <ProgressBar
              progress={req.progress}
              color={
                req.progress >= 75
                  ? "bg-[var(--signal-green)]"
                  : req.progress >= 40
                    ? "bg-[var(--signal-orange)]"
                    : "bg-primary/50"
              }
            />
            <span className="shrink-0 text-xs text-muted-foreground">
              {req.current}/{req.threshold}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EligibilityCard({
  eligibility,
  index,
  onRefresh,
  refreshing,
  autoExpand,
}: {
  eligibility: SubredditEligibility;
  index: number;
  onRefresh: (subreddit: string) => void;
  refreshing: boolean;
  autoExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(autoExpand ?? false);
  const config = statusConfig[eligibility.status];
  const StatusIcon = config.icon;
  const totalReqs = eligibility.requirements.length;
  const metCount = eligibility.requirements.filter((r) => r.met).length;
  const banRules = eligibility.contentRules.filter((r) => r.severity === "ban");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        "rounded-xl border bg-card transition-all",
        expanded ? `${config.border} shadow-sm` : "border-border/60"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.bg)}>
          <StatusIcon className={cn("h-5 w-5", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{eligibility.subreddit}</h3>
            <Badge variant="outline" className={cn("text-[10px]", config.border, config.color)}>
              {config.label}
            </Badge>
            {banRules.length > 0 && (
              <Badge variant="outline" className="gap-0.5 border-destructive/30 bg-destructive/5 text-[10px] text-destructive">
                <Lock className="h-2.5 w-2.5" />
                {banRules.length} ban {banRules.length === 1 ? "rule" : "rules"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{metCount}/{totalReqs}</p>
            <p className="text-[10px] text-muted-foreground">requirements</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground/50">
              {eligibility.contentRules.length} rules
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border/40 px-4 pb-4 pt-3"
        >
          {/* Requirements */}
          <div className="mb-4">
            <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Requirements
            </h4>
            <div className="divide-y divide-border/30">
              {eligibility.requirements.map((req, i) => (
                <RequirementRow key={i} req={req} />
              ))}
            </div>
          </div>

          {/* Content rules */}
          {eligibility.contentRules.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Content Rules ({eligibility.contentRules.length})
              </h4>
              <div className="space-y-2">
                {eligibility.contentRules.map((rule) => {
                  const sev = severityConfig[rule.severity];
                  return (
                    <div
                      key={rule.id}
                      className="rounded-lg border border-border/40 bg-muted/10 p-3"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        {rule.severity === "ban" ? (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-destructive" />
                        ) : rule.severity === "remove" ? (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--signal-orange)]" />
                        ) : (
                          <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{rule.title}</span>
                        <Badge variant="outline" className={cn("ml-auto text-[10px]", sev.className)}>
                          {sev.label}
                        </Badge>
                      </div>
                      <p className="pl-[22px] text-xs leading-relaxed text-muted-foreground">
                        {rule.description}
                      </p>
                      <div className="mt-1.5 pl-[22px]">
                        <Badge variant="outline" className="border-border/30 text-[10px] text-muted-foreground/70">
                          {categoryLabels[rule.category] ?? rule.category}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Your stats */}
          <div className="flex items-center gap-4 rounded-lg bg-muted/20 p-3">
            <div className="text-center">
              <p className="text-sm font-bold">{eligibility.userKarma.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total karma</p>
            </div>
            <div className="h-6 w-px bg-border/40" />
            <div className="text-center">
              <p className="text-sm font-bold">{eligibility.userCommentKarma.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Comment karma</p>
            </div>
            <div className="h-6 w-px bg-border/40" />
            <div className="flex items-center gap-1.5">
              {eligibility.canPost ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--signal-green)]" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground/50" />
              )}
              <span className="text-xs">Posting</span>
            </div>
            <div className="flex items-center gap-1.5">
              {eligibility.canComment ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--signal-green)]" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground/50" />
              )}
              <span className="text-xs">Commenting</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh(eligibility.subreddit);
              }}
              disabled={refreshing}
              className="ml-auto rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              title="Refresh rules from Reddit"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </button>
          </div>

          {/* Tip */}
          {eligibility.status !== "ready" && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary">
                {eligibility.status === "limited"
                  ? "Tip: Comment on a few posts in this subreddit to build karma. Helpful replies earn karma fastest."
                  : "Tip: Start by commenting in this subreddit regularly. Once moderators see consistent participation, you may request posting access."}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function EligibilityContent() {
  const searchParams = useSearchParams();
  const highlightedSub = searchParams.get("sub");

  const [filter, setFilter] = useState<"all" | "ready" | "limited" | "locked">("all");
  const [subreddits, setSubreddits] = useState<SubredditEligibility[]>(mockEligibility);
  const [adding, setAdding] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Try to load real data on mount
  useEffect(() => {
    fetch("/api/reddit/subreddit-rules")
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSubreddits(data);
        }
        // else keep mock data
      })
      .catch(() => {});
  }, []);

  const fetchSubreddit = useCallback(async (name: string) => {
    const clean = name.replace(/^r\//, "").trim();
    if (!clean) return;

    setLoading(clean);
    try {
      const res = await fetch(`/api/reddit/subreddit-rules?subreddit=${clean}`);
      if (res.ok) {
        const data: SubredditEligibility = await res.json();
        setSubreddits((prev) => {
          const existing = prev.findIndex((s) => s.subreddit === data.subreddit);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = data;
            return updated;
          }
          return [...prev, data];
        });
      }
    } catch {
      // Silently fail — user stays on mock/existing data
    } finally {
      setLoading(null);
    }
  }, []);

  function handleAdd() {
    if (!newSub.trim()) return;
    fetchSubreddit(newSub);
    setNewSub("");
    setAdding(false);
  }

  const filtered =
    filter === "all"
      ? subreddits
      : subreddits.filter((e) => e.status === filter);

  const readyCount = subreddits.filter((e) => e.status === "ready").length;
  const limitedCount = subreddits.filter((e) => e.status === "limited").length;
  const lockedCount = subreddits.filter((e) => e.status === "locked").length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-6 w-6 text-primary" />
            Subreddit Access
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rules fetched from Reddit — see where you can post and what to avoid
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Add Subreddit
        </Button>
      </div>

      {/* Add subreddit input */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 overflow-hidden"
        >
          <div className="flex gap-2 rounded-xl border border-primary/30 bg-card p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. startups, marketing, SaaS"
                className="w-full rounded-lg border border-border/60 bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <Button size="sm" onClick={handleAdd} disabled={!newSub.trim() || !!loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewSub(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { key: "ready" as const, count: readyCount, ...statusConfig.ready },
          { key: "limited" as const, count: limitedCount, ...statusConfig.limited },
          { key: "locked" as const, count: lockedCount, ...statusConfig.locked },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? "all" : s.key)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              filter === s.key
                ? `${s.border} ${s.bg}`
                : "border-border/60 bg-card hover:border-border"
            )}
          >
            <s.icon className={cn("mb-1 h-5 w-5", s.color)} />
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((el, i) => {
          const isHighlighted =
            highlightedSub &&
            el.subreddit.replace(/^r\//, "").toLowerCase() ===
              highlightedSub.toLowerCase();
          return (
            <div
              key={el.subreddit}
              ref={isHighlighted ? (node) => {
                if (node) {
                  setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
                }
              } : undefined}
            >
              <EligibilityCard
                eligibility={el}
                index={i}
                onRefresh={(sub) => fetchSubreddit(sub)}
                refreshing={loading === el.subreddit.replace(/^r\//, "")}
                autoExpand={!!isHighlighted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EligibilityPage() {
  return (
    <Suspense>
      <EligibilityContent />
    </Suspense>
  );
}
