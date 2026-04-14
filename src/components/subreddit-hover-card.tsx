"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Check,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockEligibility } from "@/lib/mock-data";
import type { SubredditInfo, SubredditEligibility } from "@/types/reddit";

// Mock info generator for demo mode (before Reddit auth)
function getMockInfo(subreddit: string): SubredditInfo {
  const clean = subreddit.replace(/^r\//, "");
  const mockStats: Record<string, { subscribers: number; active: number; title: string }> = {
    startups: { subscribers: 1_240_000, active: 3_400, title: "Pair your skills with ideas" },
    Entrepreneur: { subscribers: 2_100_000, active: 5_200, title: "Pair your ambition with action" },
    SaaS: { subscribers: 189_000, active: 890, title: "Software as a Service" },
    indiehackers: { subscribers: 142_000, active: 620, title: "Build profitable businesses" },
    marketing: { subscribers: 1_800_000, active: 4_100, title: "Share marketing strategies" },
    sales: { subscribers: 340_000, active: 1_200, title: "Sales professionals community" },
    GrowthHacking: { subscribers: 267_000, active: 780, title: "Growth strategies and experiments" },
    SideProject: { subscribers: 198_000, active: 540, title: "Show off your side projects" },
    smallbusiness: { subscribers: 890_000, active: 2_300, title: "Small business owners community" },
    productivity: { subscribers: 2_400_000, active: 6_100, title: "Get more done" },
    dataisbeautiful: { subscribers: 21_000_000, active: 12_000, title: "Data visualization" },
    RemoteWork: { subscribers: 456_000, active: 1_100, title: "Remote work discussions" },
  };

  const stats = mockStats[clean] ?? {
    subscribers: Math.floor(Math.random() * 500_000) + 10_000,
    active: Math.floor(Math.random() * 2_000) + 100,
    title: clean,
  };

  const eligibility = mockEligibility.find(
    (e) => e.subreddit.replace(/^r\//, "").toLowerCase() === clean.toLowerCase()
  );

  return {
    name: `r/${clean}`,
    title: stats.title,
    description: "",
    subscribers: stats.subscribers,
    activeUsers: stats.active,
    createdUtc: 0,
    isSubscribed: true,
    isTracked: !!eligibility,
    fullname: `t5_${clean}`,
    subredditType: "public",
    eligibility,
  };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const statusIcons = {
  ready: CheckCircle2,
  limited: AlertTriangle,
  locked: Lock,
};
const statusColors = {
  ready: "text-[var(--signal-green)]",
  limited: "text-[var(--signal-orange)]",
  locked: "text-destructive",
};
const statusLabels = {
  ready: "Can post & comment",
  limited: "Comment only",
  locked: "No access yet",
};

interface SubredditHoverCardProps {
  subreddit: string;
  children: React.ReactNode;
  className?: string;
}

export function SubredditHoverCard({
  subreddit,
  children,
  className,
}: SubredditHoverCardProps) {
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState<SubredditInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [tracked, setTracked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchInfo = useCallback(async () => {
    if (info) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/reddit/subreddit-info?subreddit=${subreddit.replace(/^r\//, "")}`
      );
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
        setJoined(data.isSubscribed);
        setTracked(data.isTracked);
        setLoading(false);
        return;
      }
    } catch {
      // Fall through to mock
    }

    // Use mock data for demo
    const mock = getMockInfo(subreddit);
    setInfo(mock);
    setJoined(mock.isSubscribed);
    setTracked(mock.isTracked);
    setLoading(false);
  }, [subreddit, info]);

  function handleMouseEnter() {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
      fetchInfo();
    }, 400);
  }

  function handleMouseLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 200);
  }

  function handleCardEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function handleCardLeave() {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 200);
  }

  async function handleJoin() {
    if (!info) return;
    setJoined(!joined);
    try {
      await fetch("/api/reddit/subreddit-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: info.fullname,
          action: joined ? "unsub" : "sub",
        }),
      });
    } catch {
      setJoined(joined); // revert on error
    }
  }

  function handleTrack() {
    setTracked(true);
    // Would call /api/reddit/subreddit-rules?subreddit=xxx to fetch and cache
    fetch(
      `/api/reddit/subreddit-rules?subreddit=${subreddit.replace(/^r\//, "")}`
    ).catch(() => {});
  }

  const el = info?.eligibility;
  const banRuleCount = el?.contentRules?.filter((r) => r.severity === "ban").length ?? 0;

  return (
    <span
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {show && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
            className="absolute left-0 top-full z-50 w-80"
          >
            {/* Invisible bridge to cover the gap between trigger and card */}
            <div className="h-2" />
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xl">
            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">
                  Loading subreddit info...
                </span>
              </div>
            ) : info ? (
              <>
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{info.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {info.title}
                    </p>
                  </div>
                  {info.subredditType !== "public" && (
                    <Badge
                      variant="outline"
                      className="border-destructive/30 text-[10px] text-destructive"
                    >
                      {info.subredditType}
                    </Badge>
                  )}
                </div>

                {/* Stats row */}
                <div className="mb-3 flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">
                      {formatCount(info.subscribers)}
                    </span>
                    members
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 text-[var(--signal-green)]" />
                    <span className="font-medium text-foreground">
                      {formatCount(info.activeUsers)}
                    </span>
                    online
                  </div>
                </div>

                {/* Eligibility status */}
                {el && (
                  <div className="mb-3 rounded-lg border border-border/40 bg-muted/15 p-2.5">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = statusIcons[el.status];
                        return (
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              statusColors[el.status]
                            )}
                          />
                        );
                      })()}
                      <span className="text-xs font-medium">
                        {statusLabels[el.status]}
                      </span>
                      {banRuleCount > 0 && (
                        <Badge
                          variant="outline"
                          className="ml-auto gap-0.5 border-destructive/30 bg-destructive/5 text-[10px] text-destructive"
                        >
                          <Lock className="h-2.5 w-2.5" />
                          {banRuleCount} ban{" "}
                          {banRuleCount === 1 ? "rule" : "rules"}
                        </Badge>
                      )}
                    </div>

                    {/* Top rules preview */}
                    {el.contentRules && el.contentRules.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {el.contentRules
                          .filter((r) => r.severity === "ban")
                          .slice(0, 2)
                          .map((rule) => (
                            <div
                              key={rule.id}
                              className="flex items-start gap-1.5 text-[11px] text-destructive/80"
                            >
                              <Lock className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                              <span className="line-clamp-1">{rule.title}</span>
                            </div>
                          ))}
                        {el.contentRules.length > 2 && (
                          <a
                            href="/dashboard/eligibility"
                            className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            View all {el.contentRules.length} rules
                            <ArrowRight className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Requirements preview */}
                    {el.requirements.some((r) => !r.met) && (
                      <div className="mt-2 border-t border-border/30 pt-2">
                        {el.requirements
                          .filter((r) => !r.met)
                          .slice(0, 2)
                          .map((req, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 text-[11px] text-[var(--signal-orange)]"
                            >
                              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                              <span className="line-clamp-1">{req.label}</span>
                              {req.progress !== undefined && (
                                <span className="ml-auto shrink-0 text-[10px]">
                                  {req.progress}%
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={joined ? "outline" : "default"}
                    className={cn(
                      "flex-1 gap-1.5 text-xs",
                      joined
                        ? "border-[var(--signal-green)]/30 text-[var(--signal-green)]"
                        : "bg-primary text-primary-foreground"
                    )}
                    onClick={handleJoin}
                  >
                    {joined ? (
                      <>
                        <Check className="h-3 w-3" />
                        Joined
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Join
                      </>
                    )}
                  </Button>

                  {!tracked && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-primary/30 text-xs text-primary"
                      onClick={handleTrack}
                    >
                      <Shield className="h-3 w-3" />
                      Track Rules
                    </Button>
                  )}
                  {tracked && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-[var(--signal-green)]/30 text-xs text-[var(--signal-green)]"
                      disabled
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Tracked
                    </Button>
                  )}
                </div>
              </>
            ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
