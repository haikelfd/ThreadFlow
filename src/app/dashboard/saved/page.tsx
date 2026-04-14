"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { ConversationThread } from "@/components/dashboard/conversation-thread";
import { useAppState } from "@/lib/store";
import { mockPosts } from "@/lib/mock-data";
import type { RedditPost } from "@/types/reddit";

export default function SavedPage() {
  const { savedIds } = useAppState();
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const savedPosts = mockPosts.filter((p) => savedIds.has(p.id));

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
          <Bookmark className="h-6 w-6 text-primary" />
          Saved
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Threads you&apos;ve bookmarked for follow-up
        </p>
      </div>

      {savedPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center"
        >
          <Bookmark className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No saved threads yet</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Click the bookmark icon on any post to save it here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {savedPosts.map((post, i) => (
            <ActivityCard
              key={post.id}
              post={post}
              index={i}
              onOpenThread={setSelectedPost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
