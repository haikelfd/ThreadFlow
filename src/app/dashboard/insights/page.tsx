"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ArrowBigUp,
  MessageCircle,
  FileText,
  TrendingUp,
} from "lucide-react";
import { mockInsights, mockPosts } from "@/lib/mock-data";

export default function InsightsPage() {
  const totalPosts = mockPosts.length;
  const totalScore = mockPosts.reduce((acc, p) => acc + p.score, 0);
  const totalComments = mockPosts.reduce((acc, p) => acc + p.numComments, 0);
  const avgScore = Math.round(totalScore / totalPosts);

  const sortedInsights = [...mockInsights].sort(
    (a, b) => b.avgScore - a.avgScore
  );
  const topPosts = [...mockPosts].sort((a, b) => b.score - a.score).slice(0, 5);
  const maxBarScore = sortedInsights[0]?.avgScore ?? 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="h-6 w-6 text-primary" />
          Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How your Reddit content is performing
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Posts",
            value: totalPosts,
            icon: FileText,
          },
          {
            label: "Total Karma",
            value: totalScore.toLocaleString(),
            icon: ArrowBigUp,
          },
          {
            label: "Comments Received",
            value: totalComments,
            icon: MessageCircle,
          },
          {
            label: "Avg Score",
            value: avgScore.toLocaleString(),
            icon: TrendingUp,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subreddit performance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-xl border border-border/60 bg-card p-5"
        >
          <h3 className="mb-4 font-semibold">Most Active Subreddits</h3>
          <div className="space-y-3">
            {sortedInsights.map((sub, i) => (
              <div key={sub.name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm font-medium text-primary/80">
                  {sub.name}
                </span>
                <div className="flex-1">
                  <div className="h-6 overflow-hidden rounded-md bg-muted/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(sub.avgScore / maxBarScore) * 100}%`,
                      }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                      className="flex h-full items-center rounded-md bg-primary/20 px-2"
                    >
                      <span className="text-xs font-medium text-primary">
                        avg {sub.avgScore}
                      </span>
                    </motion.div>
                  </div>
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                  {sub.postCount} posts
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top posts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="rounded-xl border border-border/60 bg-card p-5"
        >
          <h3 className="mb-4 font-semibold">Top Performing Posts</h3>
          <div className="space-y-3">
            {topPosts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug line-clamp-1">
                    {post.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary/70">{post.subreddit}</span>
                    <span>&middot;</span>
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
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
