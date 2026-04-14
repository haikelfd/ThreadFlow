"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowBigUp,
  ArrowLeft,
  MessageCircle,
  AlertCircle,
  User,
  Reply,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";
import { SubredditHoverCard } from "@/components/subreddit-hover-card";
import { ComposeReply } from "@/components/dashboard/compose-reply";
import type { RedditPost, RedditComment } from "@/types/reddit";
import { mockComments } from "@/lib/mock-data";

interface ConversationThreadProps {
  post: RedditPost;
  onBack: () => void;
}

function CommentNode({
  comment,
  index,
  onReply,
  replyingToId,
  post,
  onCancelReply,
  onSentReply,
}: {
  comment: RedditComment;
  index: number;
  onReply: (comment: RedditComment) => void;
  replyingToId: string | null;
  post: RedditPost;
  onCancelReply: () => void;
  onSentReply: () => void;
}) {
  const isReplying = replyingToId === comment.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn("relative", comment.depth > 0 && "ml-6")}
    >
      {/* Connector line */}
      {comment.depth > 0 && (
        <div className="absolute -left-3 top-0 h-full w-px bg-border/50" />
      )}

      <div
        className={cn(
          "group rounded-lg border p-4 transition-colors",
          comment.isOwnComment
            ? "border-primary/30 bg-primary/5"
            : !comment.isOwnComment && comment.replies.length === 0
              ? "border-[var(--signal-orange)]/20 bg-[var(--signal-orange)]/5"
              : "border-border/50 bg-card/50"
        )}
      >
        {/* Author + meta */}
        <div className="mb-2 flex items-center gap-2 text-sm">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              comment.isOwnComment ? "bg-primary/20" : "bg-muted"
            )}
          >
            <User className="h-3.5 w-3.5" />
          </div>
          <span
            className={cn(
              "font-medium",
              comment.isOwnComment && "text-primary"
            )}
          >
            {comment.author}
            {comment.isOwnComment && (
              <Badge
                variant="outline"
                className="ml-1.5 border-primary/30 bg-primary/10 text-[10px] text-primary"
              >
                You
              </Badge>
            )}
          </span>
          <TimeAgo timestamp={comment.createdUtc} className="text-muted-foreground" />
          <div className="ml-auto flex items-center gap-1 text-muted-foreground">
            <ArrowBigUp className="h-3.5 w-3.5" />
            <span className="text-xs">{comment.score}</span>
          </div>
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed text-foreground/90">
          {comment.body}
        </p>

        {/* Reply button + unanswered indicator */}
        <div className="mt-2 flex items-center gap-2">
          {!comment.isOwnComment && comment.replies.length === 0 && (
            <div className="flex items-center gap-1 text-xs text-[var(--signal-orange)]">
              <AlertCircle className="h-3 w-3" />
              <span>Awaiting your reply</span>
            </div>
          )}
          {!comment.isOwnComment && (
            <button
              onClick={() => onReply(comment)}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
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
            className="mt-2 overflow-hidden"
          >
            <div className="ml-6">
              <ComposeReply
                parentAuthor={comment.author}
                parentBody={comment.body}
                subreddit={post.subreddit}
                threadTitle={post.title}
                onSend={onSentReply}
                onCancel={onCancelReply}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Child replies */}
      {comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply, i) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              index={index + i + 1}
              onReply={onReply}
              replyingToId={replyingToId}
              post={post}
              onCancelReply={onCancelReply}
              onSentReply={onSentReply}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function ConversationThread({ post, onBack }: ConversationThreadProps) {
  const comments = mockComments;
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="thread"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </Button>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <SubredditHoverCard subreddit={post.subreddit}>
                <span className="font-medium text-primary/80 cursor-pointer hover:underline">
                  {post.subreddit}
                </span>
              </SubredditHoverCard>
              <span>&middot;</span>
              <TimeAgo timestamp={post.createdUtc} />
            </div>
            <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {post.selftext}
            </p>
            <Separator className="my-4" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ArrowBigUp className="h-4 w-4" />
                <span>{post.score.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.numComments} comments</span>
              </div>
              {post.unansweredCount > 0 && (
                <div className="flex items-center gap-1 text-[var(--signal-orange)]">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{post.unansweredCount} unanswered</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            Conversation
          </h3>
          <ScrollArea className="max-h-[calc(100vh-400px)]">
            <div className="space-y-3 pr-4">
              {comments.map((comment, i) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  index={i}
                  onReply={(c) => setReplyingToId(c.id)}
                  replyingToId={replyingToId}
                  post={post}
                  onCancelReply={() => setReplyingToId(null)}
                  onSentReply={() => setReplyingToId(null)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
