"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { ActivitySignals } from "@/components/dashboard/activity-signals";
import { ConversationThread } from "@/components/dashboard/conversation-thread";
import { mockPosts, mockSignals } from "@/lib/mock-data";
import type { RedditPost } from "@/types/reddit";

function ActivityContent() {
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");

  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);

  // Auto-open thread from query param
  useEffect(() => {
    if (threadParam) {
      const post = mockPosts.find((p) => p.id === threadParam);
      if (post) setSelectedPost(post);
    }
  }, [threadParam]);

  if (selectedPost) {
    return (
      <ConversationThread
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="feed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Activity className="h-6 w-6 text-primary" />
            Activity Feed
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recent Reddit posts and comments
          </p>
        </div>

        {/* Signals */}
        <ActivitySignals signals={mockSignals} />

        {/* Feed */}
        <div className="space-y-3">
          {mockPosts.map((post, i) => (
            <ActivityCard
              key={post.id}
              post={post}
              index={i}
              onOpenThread={setSelectedPost}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityContent />
    </Suspense>
  );
}
