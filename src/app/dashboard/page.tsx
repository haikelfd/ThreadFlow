"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowBigUp,
  MessageCircle,
  FileText,
  TrendingUp,
  Reply,
  Clock,
  Radar,
  ArrowRight,
  Zap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";
import {
  mockPosts,
  mockInsights,
  mockKeywordMatches,
  mockKeywords,
} from "@/lib/mock-data";

// --- Animated counter ---
function AnimatedNumber({
  value,
  duration = 1,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const stepTime = Math.max((duration * 1000) / end, 15);
    const increment = Math.ceil(end / ((duration * 1000) / stepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// --- Engagement sparkline (last 7 days) ---
const engagementData = [
  { day: "Mon", score: 340, comments: 45 },
  { day: "Tue", score: 520, comments: 67 },
  { day: "Wed", score: 180, comments: 23 },
  { day: "Thu", score: 890, comments: 102 },
  { day: "Fri", score: 1240, comments: 134 },
  { day: "Sat", score: 430, comments: 56 },
  { day: "Sun", score: 670, comments: 78 },
];

// --- Metric expand panels ---

function ThreadLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={`/dashboard/activity?thread=${id}`}
      className={cn("block transition-all", className)}
    >
      {children}
    </Link>
  );
}

function KarmaPanel() {
  const bySubreddit = mockInsights
    .map((s) => ({ name: s.name, karma: s.totalScore }))
    .sort((a, b) => b.karma - a.karma);
  const topKarmaPost = [...mockPosts].sort((a, b) => b.score - a.score)[0];
  const max = bySubreddit[0]?.karma ?? 1;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Karma by Subreddit
        </h4>
        <div className="space-y-2">
          {bySubreddit.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-xs font-medium truncate">
                {s.name}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${(s.karma / max) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                {s.karma.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Highest Karma Post
        </h4>
        {topKarmaPost && (
          <ThreadLink id={topKarmaPost.id} className="rounded-lg border border-border/40 bg-muted/20 p-3 hover:border-primary/30 hover:bg-muted/40">
            <p className="text-sm font-medium leading-snug line-clamp-2">
              {topKarmaPost.title}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary/70">{topKarmaPost.subreddit}</span>
              <span className="flex items-center gap-0.5 font-semibold text-primary">
                <ArrowBigUp className="h-3 w-3" />
                {topKarmaPost.score.toLocaleString()}
              </span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground/40" />
            </div>
          </ThreadLink>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <div>
            <span className="text-lg font-bold text-foreground">
              {Math.round(
                mockPosts.reduce((a, p) => a + p.score, 0) / mockPosts.length
              )}
            </span>
            <p>Avg per post</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <span className="text-lg font-bold text-foreground">
              {Math.max(...mockPosts.map((p) => p.score)).toLocaleString()}
            </span>
            <p>Best single post</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsPanel() {
  const posts = mockPosts.filter((p) => !p.isComment);
  const comments = mockPosts.filter((p) => p.isComment);
  const recent = [...mockPosts]
    .sort((a, b) => b.createdUtc - a.createdUtc)
    .slice(0, 5);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Content Split
        </h4>
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
            <FileText className="mx-auto mb-1 h-5 w-5 text-primary/70" />
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-[11px] text-muted-foreground">Posts</p>
          </div>
          <div className="flex-1 rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
            <MessageSquare className="mx-auto mb-1 h-5 w-5 text-[var(--glow-blue)]" />
            <p className="text-2xl font-bold">{comments.length}</p>
            <p className="text-[11px] text-muted-foreground">Comments</p>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted/40">
          <div
            className="flex h-full"
          >
            <div
              className="rounded-l-full bg-primary/60"
              style={{
                width: `${(posts.length / mockPosts.length) * 100}%`,
              }}
            />
            <div
              className="bg-[var(--glow-blue)]/40"
              style={{
                width: `${(comments.length / mockPosts.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Recent Activity
        </h4>
        <div className="space-y-1.5">
          {recent.map((item) => (
            <ThreadLink
              key={item.id}
              id={item.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/30"
            >
              {item.isComment ? (
                <MessageSquare className="h-3 w-3 shrink-0 text-[var(--glow-blue)]" />
              ) : (
                <FileText className="h-3 w-3 shrink-0 text-primary/70" />
              )}
              <span className="flex-1 truncate font-medium">{item.title}</span>
              <span className="shrink-0 text-muted-foreground">
                <TimeAgo timestamp={item.createdUtc} />
              </span>
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
            </ThreadLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function RepliesPanel() {
  const byReplies = [...mockPosts]
    .sort((a, b) => b.numComments - a.numComments)
    .slice(0, 5);
  const totalReplies = mockPosts.reduce((a, p) => a + p.numComments, 0);
  const avgReplies = Math.round(totalReplies / mockPosts.length);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Most Discussed
        </h4>
        <div className="space-y-2">
          {byReplies.map((post, i) => (
            <ThreadLink
              key={post.id}
              id={post.id}
              className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/30"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-muted-foreground bg-muted">
                {i + 1}
              </span>
              <span className="flex-1 truncate text-xs font-medium">
                {post.title}
              </span>
              <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[var(--signal-green)]">
                <MessageCircle className="h-3 w-3" />
                {post.numComments}
              </span>
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
            </ThreadLink>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Reply Stats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
            <p className="text-2xl font-bold">{totalReplies}</p>
            <p className="text-[11px] text-muted-foreground">Total replies</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
            <p className="text-2xl font-bold">{avgReplies}</p>
            <p className="text-[11px] text-muted-foreground">Avg per post</p>
          </div>
          <div className="col-span-2 rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
            <p className="text-2xl font-bold">
              {Math.max(...mockPosts.map((p) => p.numComments))}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Best single thread
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveThreadsPanel() {
  const active = mockPosts.filter(
    (p) => p.status === "active" || p.hasNewReplies
  );

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Currently Active Threads
      </h4>
      <div className="space-y-2">
        {active.map((post) => (
          <ThreadLink
            key={post.id}
            id={post.id}
            className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 hover:border-primary/30 hover:bg-muted/40"
          >
            <div
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                post.hasNewReplies
                  ? "bg-[var(--signal-orange)] animate-pulse"
                  : "bg-[var(--signal-green)]"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug truncate">
                {post.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary/70">{post.subreddit}</span>
                <span className="flex items-center gap-0.5">
                  <ArrowBigUp className="h-3 w-3" />
                  {post.score.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="h-3 w-3" />
                  {post.numComments}
                </span>
              </div>
            </div>
            {post.hasNewReplies && (
              <Badge
                variant="outline"
                className="shrink-0 border-[var(--signal-orange)]/30 text-[10px] text-[var(--signal-orange)]"
              >
                New replies
              </Badge>
            )}
            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
          </ThreadLink>
        ))}
      </div>
    </div>
  );
}

function ResponseRatePanel() {
  const responded = mockPosts.filter((p) => p.unansweredCount === 0);
  const needsReply = mockPosts.filter((p) => p.unansweredCount > 0);
  const rate = Math.round((responded.length / mockPosts.length) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Response Breakdown
        </h4>
        {/* Visual ring */}
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted/40"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-[var(--signal-green)]"
                strokeWidth="3"
                strokeDasharray={`${rate} ${100 - rate}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{rate}%</span>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--signal-green)]" />
              <span>
                {responded.length} fully responded
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--signal-orange)]" />
              <span>
                {needsReply.length} need attention
              </span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Dragging Your Rate Down
        </h4>
        <div className="space-y-1.5">
          {needsReply
            .sort((a, b) => b.unansweredCount - a.unansweredCount)
            .map((post) => (
              <ThreadLink
                key={post.id}
                id={post.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/30"
              >
                <AlertCircle className="h-3 w-3 shrink-0 text-[var(--signal-orange)]" />
                <span className="flex-1 truncate font-medium">
                  {post.title}
                </span>
                <span className="shrink-0 font-semibold text-[var(--signal-orange)]">
                  {post.unansweredCount}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
              </ThreadLink>
            ))}
        </div>
      </div>
    </div>
  );
}

function PendingRepliesPanel() {
  const pending = mockPosts
    .filter((p) => p.unansweredCount > 0)
    .sort((a, b) => b.unansweredCount - a.unansweredCount);

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Threads Awaiting Your Reply
      </h4>
      <div className="space-y-2">
        {pending.map((post) => (
          <ThreadLink
            key={post.id}
            id={post.id}
            className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 hover:border-[var(--signal-orange)]/30 hover:bg-muted/40"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--signal-orange)]/15">
              <Reply className="h-4 w-4 text-[var(--signal-orange)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug truncate">
                {post.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary/70">{post.subreddit}</span>
                <span>&middot;</span>
                <TimeAgo timestamp={post.createdUtc} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="text-lg font-bold text-[var(--signal-orange)]">
                {post.unansweredCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                unanswered
              </span>
            </div>
          </ThreadLink>
        ))}
      </div>
    </div>
  );
}

// --- Metric card config ---

type MetricKey =
  | "karma"
  | "posts"
  | "replies"
  | "threads"
  | "rate"
  | "pending";

interface MetricConfig {
  key: MetricKey;
  label: string;
  value: number;
  icon: typeof ArrowBigUp;
  color: string;
  bg: string;
  suffix?: string;
  urgent?: boolean;
  panel: () => ReactNode;
}

export default function CommandCenter() {
  const [expanded, setExpanded] = useState<MetricKey | null>(null);

  const totalPosts = mockPosts.length;
  const totalKarma = mockPosts.reduce((a, p) => a + p.score, 0);
  const totalComments = mockPosts.reduce((a, p) => a + p.numComments, 0);
  const pendingReplies = mockPosts.reduce((a, p) => a + p.unansweredCount, 0);
  const activeThreads = mockPosts.filter(
    (p) => p.status === "active" || p.hasNewReplies
  ).length;
  const responseRate = Math.round(
    ((totalPosts -
      mockPosts.filter((p) => p.unansweredCount > 0).length) /
      totalPosts) *
      100
  );
  const topOpportunities = [...mockKeywordMatches]
    .filter((m) => !m.replied)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 3);
  const topPosts = [...mockPosts]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const actionItems = mockPosts.filter(
    (p) => p.unansweredCount > 0 || p.status === "reply_later"
  );
  const maxEngagement = Math.max(...engagementData.map((d) => d.score));
  const trackedKeywords = mockKeywords.filter((k) => k.isActive).length;
  const totalMatches = mockKeywordMatches.length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const metrics: MetricConfig[] = [
    {
      key: "karma",
      label: "Total Karma",
      value: totalKarma,
      icon: ArrowBigUp,
      color: "text-primary",
      bg: "bg-primary/10",
      panel: KarmaPanel,
    },
    {
      key: "posts",
      label: "Posts & Comments",
      value: totalPosts,
      icon: FileText,
      color: "text-[var(--glow-blue)]",
      bg: "bg-[var(--glow-blue)]/10",
      panel: PostsPanel,
    },
    {
      key: "replies",
      label: "Replies Received",
      value: totalComments,
      icon: MessageCircle,
      color: "text-[var(--signal-green)]",
      bg: "bg-[var(--signal-green)]/10",
      panel: RepliesPanel,
    },
    {
      key: "threads",
      label: "Active Threads",
      value: activeThreads,
      icon: TrendingUp,
      color: "text-[var(--signal-orange)]",
      bg: "bg-[var(--signal-orange)]/10",
      panel: ActiveThreadsPanel,
    },
    {
      key: "rate",
      label: "Response Rate",
      value: responseRate,
      icon: CheckCircle2,
      color: "text-[var(--signal-green)]",
      bg: "bg-[var(--signal-green)]/10",
      suffix: "%",
      panel: ResponseRatePanel,
    },
    {
      key: "pending",
      label: "Pending Replies",
      value: pendingReplies,
      icon: AlertCircle,
      color:
        pendingReplies > 0
          ? "text-[var(--signal-orange)]"
          : "text-muted-foreground",
      bg:
        pendingReplies > 0
          ? "bg-[var(--signal-orange)]/10"
          : "bg-muted/50",
      urgent: pendingReplies > 5,
      panel: PendingRepliesPanel,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s how your Reddit presence is doing today
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-[var(--signal-green)] animate-pulse" />
            Monitoring {trackedKeywords} keywords across{" "}
            {mockInsights.length} subreddits
          </div>
        </div>
      </motion.div>

      {/* Expandable metric cards */}
      <div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric, i) => {
            const isExpanded = expanded === metric.key;
            return (
              <motion.button
                key={metric.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                onClick={() =>
                  setExpanded(isExpanded ? null : metric.key)
                }
                className={cn(
                  "relative cursor-pointer rounded-xl border bg-card p-4 text-left transition-all",
                  isExpanded
                    ? "border-primary/40 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                    : "border-border/60 hover:border-primary/20",
                  metric.urgent && !isExpanded && "glow-signal"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      metric.bg
                    )}
                  >
                    <metric.icon
                      className={cn("h-4 w-4", metric.color)}
                    />
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200",
                      isExpanded && "rotate-180 text-primary"
                    )}
                  />
                </div>
                <p className="text-2xl font-bold tracking-tight">
                  <AnimatedNumber value={metric.value} />
                  {metric.suffix ?? ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {metric.label}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Expanded detail panel */}
        <AnimatePresence mode="wait">
          {expanded && (
            <motion.div
              key={expanded}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-xl border border-primary/20 bg-card"
            >
              <div className="p-5">
                {metrics.find((m) => m.key === expanded)?.panel()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main grid: 2 columns */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column — wider */}
        <div className="space-y-6 lg:col-span-3">
          {/* Engagement trend */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Engagement This Week</h2>
                <p className="text-xs text-muted-foreground">
                  Karma earned per day
                </p>
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-[var(--signal-green)]/30 bg-[var(--signal-green)]/10 text-xs text-[var(--signal-green)]"
              >
                <TrendingUp className="h-3 w-3" />
                +24% vs last week
              </Badge>
            </div>

            <div className="flex gap-2">
              {engagementData.map((day, i) => {
                const height = (day.score / maxEngagement) * 100;
                const isToday = i === engagementData.length - 1;
                return (
                  <div
                    key={day.day}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {day.score}
                    </span>
                    <div className="relative h-28 w-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{
                          delay: 0.5 + i * 0.06,
                          duration: 0.5,
                        }}
                        className={cn(
                          "absolute bottom-0 left-0 w-full rounded-md",
                          isToday
                            ? "bg-primary shadow-sm shadow-primary/20"
                            : "bg-primary/20 hover:bg-primary/35"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[11px]",
                        isToday
                          ? "font-semibold text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Action queue */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Action Queue</h2>
                {actionItems.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--signal-orange)]/20 px-1.5 text-xs font-medium text-[var(--signal-orange)]">
                    {actionItems.length}
                  </span>
                )}
              </div>
              <Link href="/dashboard/activity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {actionItems.slice(0, 4).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.04, duration: 0.25 }}
                >
                  <ThreadLink
                    id={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 hover:border-primary/20 hover:bg-muted/40"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        item.status === "reply_later"
                          ? "bg-[var(--signal-orange)]/15 text-[var(--signal-orange)]"
                          : "bg-primary/15 text-primary"
                      )}
                    >
                      {item.status === "reply_later" ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Reply className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug line-clamp-1">
                        {item.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-primary/70">
                          {item.subreddit}
                        </span>
                        {item.unansweredCount > 0 && (
                          <span className="text-[var(--signal-orange)]">
                            {item.unansweredCount} unanswered
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px]",
                        item.status === "reply_later"
                          ? "border-[var(--signal-orange)]/30 text-[var(--signal-orange)]"
                          : "border-primary/30 text-primary"
                      )}
                    >
                      {item.status === "reply_later"
                        ? "Reply Later"
                        : "Active"}
                    </Badge>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                  </ThreadLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column — narrower */}
        <div className="space-y-6 lg:col-span-2">
          {/* Keyword opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Top Opportunities</h2>
              </div>
              <Link href="/dashboard/monitor">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground"
                >
                  Monitor <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {topOpportunities.map((opp, i) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
                  className="rounded-lg border border-border/40 bg-muted/20 p-3 transition-all hover:border-primary/20"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary/80">
                      {opp.subreddit}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-0.5 text-[10px]",
                        opp.opportunityScore >= 85
                          ? "border-[var(--signal-green)]/30 text-[var(--signal-green)]"
                          : "border-[var(--signal-orange)]/30 text-[var(--signal-orange)]"
                      )}
                    >
                      <Zap className="h-2.5 w-2.5" />
                      {opp.opportunityScore}%
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {opp.postTitle}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <ArrowBigUp className="h-3 w-3" />
                      {opp.score}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="h-3 w-3" />
                      {opp.numComments}
                    </span>
                    <span>&middot;</span>
                    <TimeAgo timestamp={opp.createdUtc} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-primary/5 p-2.5 text-center text-xs text-primary/70">
              <Sparkles className="mb-0.5 inline h-3 w-3" />{" "}
              {totalMatches} total matches across {trackedKeywords}{" "}
              keywords
            </div>
          </motion.div>

          {/* Top performers */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Best Performers</h2>
              <Link href="/dashboard/insights">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground"
                >
                  Insights <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2.5">
              {topPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.55 + i * 0.05,
                    duration: 0.3,
                  }}
                  className="flex items-start gap-3"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                      i === 0
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug line-clamp-1">
                      {post.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-primary/70">
                        {post.subreddit}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ArrowBigUp className="h-3 w-3" />
                        {post.score.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" />
                        {post.numComments}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Subreddit reach */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <h2 className="mb-3 font-semibold">Subreddit Reach</h2>
            <div className="space-y-2.5">
              {mockInsights.slice(0, 5).map((sub, i) => {
                const maxScore = mockInsights[0]?.totalScore ?? 1;
                const pct = (sub.totalScore / maxScore) * 100;
                return (
                  <div key={sub.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-muted-foreground">
                        {sub.totalScore.toLocaleString()} karma
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          delay: 0.6 + i * 0.08,
                          duration: 0.5,
                        }}
                        className={cn(
                          "h-full rounded-full",
                          i === 0
                            ? "bg-primary"
                            : i === 1
                              ? "bg-primary/70"
                              : "bg-primary/40"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
