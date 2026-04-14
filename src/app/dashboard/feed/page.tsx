"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Reply,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";
import { SubredditHoverCard } from "@/components/subreddit-hover-card";
import { ComposeReply } from "@/components/dashboard/compose-reply";
import { mockFeedPosts } from "@/lib/mock-data";
import type { FeedPost } from "@/types/reddit";

type SortMode = "hot" | "new" | "top";

const subredditFilters = [
  "All",
  "r/startups",
  "r/SaaS",
  "r/Entrepreneur",
  "r/indiehackers",
  "r/marketing",
  "r/sales",
  "r/GrowthHacking",
];

// Generate fake comments per post for the feed
function getFeedComments(postId: string) {
  const pool = [
    { author: "growth_hacker_99", body: "This is exactly the kind of content I come to Reddit for. Saved and shared with my team.", score: 234 },
    { author: "startup_skeptic", body: "Interesting data but I'd love to see the methodology. Sample size of 500 is decent but were these all from the same industry?", score: 89 },
    { author: "marketing_maria", body: "We tried something similar last quarter and saw a 15% lift. The key was consistency — doing it once isn't enough.", score: 156 },
    { author: "dev_turned_founder", body: "As someone who just went through this, I can confirm the advice here is solid. Wish I'd read this 6 months ago.", score: 312 },
    { author: "bootstrapper_ben", body: "Hot take but I disagree with point #3. In my experience, the opposite approach works better for B2B.", score: 67 },
    { author: "saas_sarah", body: "Can you share more about the tools you used? I'm building something similar and would love to compare notes.", score: 178 },
    { author: "reddit_lurker_42", body: "Finally someone says what we're all thinking. This industry has too many people pretending everything is going great.", score: 445 },
    { author: "data_driven_dan", body: "The numbers check out. We ran a similar analysis internally and got nearly identical results.", score: 93 },
  ];
  // Deterministic selection based on postId
  const seed = postId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 3 + (seed % 4);
  const start = seed % pool.length;
  return Array.from({ length: count }, (_, i) => ({
    ...pool[(start + i) % pool.length],
    id: `${postId}_c${i}`,
  }));
}

function FeedCard({ post, index }: { post: FeedPost; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replying, setReplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const comments = getFeedComments(post.id);
  const displayScore =
    post.score + (voted === "up" ? 1 : voted === "down" ? -1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="rounded-xl border border-border/60 bg-card transition-all hover:border-border/80"
    >
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 px-3 py-4">
          <button
            onClick={() => setVoted(voted === "up" ? null : "up")}
            className={cn(
              "rounded p-0.5 transition-colors",
              voted === "up"
                ? "text-[var(--signal-orange)]"
                : "text-muted-foreground/50 hover:text-[var(--signal-orange)]"
            )}
          >
            <ArrowBigUp
              className="h-5 w-5"
              fill={voted === "up" ? "currentColor" : "none"}
            />
          </button>
          <span
            className={cn(
              "text-xs font-bold",
              voted === "up"
                ? "text-[var(--signal-orange)]"
                : voted === "down"
                  ? "text-[var(--glow-blue)]"
                  : "text-muted-foreground"
            )}
          >
            {displayScore >= 1000
              ? `${(displayScore / 1000).toFixed(1)}k`
              : displayScore}
          </span>
          <button
            onClick={() => setVoted(voted === "down" ? null : "down")}
            className={cn(
              "rounded p-0.5 transition-colors",
              voted === "down"
                ? "text-[var(--glow-blue)]"
                : "text-muted-foreground/50 hover:text-[var(--glow-blue)]"
            )}
          >
            <ArrowBigDown
              className="h-5 w-5"
              fill={voted === "down" ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 py-3 pr-4">
          {/* Meta */}
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <SubredditHoverCard subreddit={post.subreddit}>
              <span className="font-semibold text-primary/80 cursor-pointer hover:underline">
                {post.subreddit}
              </span>
            </SubredditHoverCard>
            <span>&middot;</span>
            <span>u/{post.author}</span>
            <span>&middot;</span>
            <TimeAgo timestamp={post.createdUtc} />
            {post.flair && (
              <Badge
                variant="outline"
                className="ml-1 border-primary/20 bg-primary/5 text-[10px] text-primary/70"
              >
                {post.flair}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3
            className="mb-1 cursor-pointer text-[15px] font-semibold leading-snug hover:text-primary/90 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {post.title}
          </h3>

          {/* Body preview / expanded */}
          {!expanded && (
            <p
              className="mb-2 cursor-pointer text-sm text-muted-foreground line-clamp-2 leading-relaxed"
              onClick={() => setExpanded(true)}
            >
              {post.selftext}
            </p>
          )}
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3"
            >
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                {post.selftext}
              </p>
              <button
                onClick={() => setExpanded(false)}
                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="h-3 w-3" />
                Collapse
              </button>
            </motion.div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                showComments
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              onClick={() => {
                setShowComments(!showComments);
                if (!expanded) setExpanded(true);
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{post.numComments} Comments</span>
            </button>

            <button
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => {
                setExpanded(true);
                setReplying(!replying);
              }}
            >
              <Reply className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>

            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                saved
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              onClick={() => setSaved(!saved)}
            >
              {saved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              <span>{saved ? "Saved" : "Save"}</span>
            </button>

            <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>

          {/* Inline reply */}
          <AnimatePresence>
            {replying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <ComposeReply
                  parentAuthor={post.author}
                  parentBody={post.selftext}
                  subreddit={post.subreddit}
                  threadTitle={post.title}
                  onSend={() => setReplying(false)}
                  onCancel={() => setReplying(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comments section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 border-t border-border/40 pt-3"
            >
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Top comments ({comments.length} shown)
              </div>
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-border/30 bg-muted/15 p-3"
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        u/{comment.author}
                      </span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-0.5">
                        <ArrowBigUp className="h-3 w-3" />
                        {comment.score}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {comment.body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground/60">
                View all {post.numComments} comments on Reddit
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FeedPage() {
  const [sort, setSort] = useState<SortMode>("hot");
  const [subredditFilter, setSubredditFilter] = useState("All");

  const filteredPosts =
    subredditFilter === "All"
      ? mockFeedPosts
      : mockFeedPosts.filter((p) => p.subreddit === subredditFilter);

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === "new") return b.createdUtc - a.createdUtc;
    if (sort === "top") return b.score - a.score;
    // "hot" — blend of score and recency
    const ageA = (Date.now() / 1000 - a.createdUtc) / 3600;
    const ageB = (Date.now() / 1000 - b.createdUtc) / 3600;
    return b.score / (ageB + 2) - a.score / (ageA + 2);
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <svg className="h-6 w-6 text-[var(--signal-orange)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm6.244 13.257a1.5 1.5 0 0 1-.018 2.015 8.3 8.3 0 0 1-2.136 1.67c-1.678.98-3.59 1.394-5.466 1.12a8.26 8.26 0 0 1-4.624-2.4 1.5 1.5 0 0 1 2.12-2.12 5.26 5.26 0 0 0 2.945 1.53 5.4 5.4 0 0 0 3.479-.712 5.3 5.3 0 0 0 1.363-1.067 1.5 1.5 0 0 1 2.337-.036zM8.5 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM18.69 7.31a2 2 0 1 1 2.83 2.83 2 2 0 0 1-2.83-2.83zM12 3a1.5 1.5 0 0 1 1.5 1.5V6h1a1 1 0 1 1 0 2h-5a1 1 0 0 1 0-2h1V4.5A1.5 1.5 0 0 1 12 3z" />
          </svg>
          Reddit Feed
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse Reddit without leaving ThreadFlow — reply with AI assist
        </p>
      </div>

      {/* Sort tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1 w-fit">
        {([
          { key: "hot" as SortMode, icon: Flame, label: "Hot" },
          { key: "new" as SortMode, icon: Clock, label: "New" },
          { key: "top" as SortMode, icon: TrendingUp, label: "Top" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all",
              sort === tab.key
                ? "bg-primary/15 font-medium text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subreddit filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {subredditFilters.map((sub) => (
          <button
            key={sub}
            onClick={() => setSubredditFilter(sub)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs transition-all",
              subredditFilter === sub
                ? "border-primary/40 bg-primary/10 font-medium text-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/30"
            )}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {sortedPosts.map((post, i) => (
          <FeedCard key={post.id} post={post} index={i} />
        ))}

        {sortedPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
            <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No posts found in {subredditFilter}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
