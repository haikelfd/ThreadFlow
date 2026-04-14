"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimeAgo } from "@/components/time-ago";
import { SubredditHoverCard } from "@/components/subreddit-hover-card";
import { ConversationThread } from "@/components/dashboard/conversation-thread";
import { mockThreads } from "@/lib/mock-data";
import type { RedditPost } from "@/types/reddit";

export default function ConversationsPage() {
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);

  if (selectedPost) {
    return (
      <ConversationThread
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <MessageSquare className="h-6 w-6 text-primary" />
          Conversations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active threads you&apos;re participating in
        </p>
      </div>

      <div className="space-y-3">
        {mockThreads.map((thread, i) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="group cursor-pointer rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30"
            onClick={() => setSelectedPost(thread.post)}
          >
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <SubredditHoverCard subreddit={thread.post.subreddit}>
                <span className="font-medium text-primary/80 cursor-pointer hover:underline">
                  {thread.post.subreddit}
                </span>
              </SubredditHoverCard>
              <span>&middot;</span>
              <TimeAgo timestamp={thread.lastActivity} />
              <Badge
                variant="outline"
                className="ml-auto border-border/50 text-xs"
              >
                {thread.participantCount} participants
              </Badge>
            </div>
            <h3 className="mb-1 font-medium group-hover:text-primary/90 transition-colors">
              {thread.post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {thread.comments.length} messages in thread
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
