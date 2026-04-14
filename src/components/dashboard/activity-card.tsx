"use client";

import { motion } from "framer-motion";
import {
  ArrowBigUp,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  MessageSquare,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/store";
import { TimeAgo } from "@/components/time-ago";
import { SubredditHoverCard } from "@/components/subreddit-hover-card";
import type { RedditPost, PostStatus } from "@/types/reddit";

const statusConfig: Record<
  PostStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-[var(--signal-green)]/15 text-[var(--signal-green)] border-[var(--signal-green)]/30",
  },
  reply_later: {
    label: "Reply Later",
    className: "bg-[var(--signal-orange)]/15 text-[var(--signal-orange)] border-[var(--signal-orange)]/30",
  },
  important: {
    label: "Important",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  done: {
    label: "Done",
    className: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  },
};

interface ActivityCardProps {
  post: RedditPost;
  index: number;
  onOpenThread?: (post: RedditPost) => void;
}

export function ActivityCard({ post, index, onOpenThread }: ActivityCardProps) {
  const { statusOverrides, savedIds, setStatus, toggleSaved } = useAppState();
  const currentStatus = statusOverrides[post.id] ?? post.status;
  const isSaved = savedIds.has(post.id);
  const status = statusConfig[currentStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-primary/30",
        post.hasNewReplies && "glow-card"
      )}
      onClick={() => onOpenThread?.(post)}
    >
      {/* New replies indicator */}
      {post.hasNewReplies && (
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--signal-orange)] shadow-lg shadow-[var(--signal-orange)]/40" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Top row: type icon, subreddit, time */}
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {post.isComment ? (
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 shrink-0" />
            )}
            <SubredditHoverCard subreddit={post.subreddit}>
              <span className="font-medium text-primary/80 cursor-pointer hover:underline">
                {post.subreddit}
              </span>
            </SubredditHoverCard>
            <span className="text-muted-foreground/50">&middot;</span>
            <TimeAgo timestamp={post.createdUtc} />
          </div>

          {/* Title */}
          <h3 className="mb-2 font-medium leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
            {post.title}
          </h3>

          {/* Preview */}
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.selftext}
          </p>

          {/* Bottom row: engagement + status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ArrowBigUp className="h-4 w-4" />
              <span>{post.score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{post.numComments}</span>
            </div>
            {post.unansweredCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-[var(--signal-orange)]">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{post.unansweredCount} unanswered</span>
              </div>
            )}
            <Badge variant="outline" className={cn("ml-auto text-xs", status.className)}>
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => toggleSaved(post.id)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatus(post.id, "active")}>
                Mark Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatus(post.id, "reply_later")}
              >
                Reply Later
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatus(post.id, "important")}
              >
                Important
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatus(post.id, "done")}>
                Mark Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
