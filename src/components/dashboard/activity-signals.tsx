"use client";

import { motion } from "framer-motion";
import { Bell, MessageCircle, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";
import { SubredditHoverCard } from "@/components/subreddit-hover-card";
import type { ActivitySignal } from "@/types/reddit";

const signalIcons = {
  new_reply: MessageCircle,
  unanswered: AlertCircle,
  trending: TrendingUp,
};

const signalColors = {
  new_reply: "text-[var(--glow-blue)]",
  unanswered: "text-[var(--signal-orange)]",
  trending: "text-[var(--signal-green)]",
};

interface ActivitySignalsProps {
  signals: ActivitySignal[];
}

export function ActivitySignals({ signals }: ActivitySignalsProps) {
  if (signals.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span>Activity Signals</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--signal-orange)]/20 text-xs text-[var(--signal-orange)]">
          {signals.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {signals.map((signal, i) => {
          const Icon = signalIcons[signal.type];
          const color = signalColors[signal.type];

          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={cn(
                "flex min-w-[250px] shrink-0 cursor-pointer items-start gap-3 rounded-lg border border-border/50 bg-card/80 p-3.5 transition-all hover:border-primary/30 hover:bg-card",
                signal.type === "trending" && "glow-signal"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-current/10",
                  color
                )}
              >
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-1">
                  {signal.message}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  <SubredditHoverCard subreddit={signal.subreddit}>
                    <span className="cursor-pointer hover:underline">{signal.subreddit}</span>
                  </SubredditHoverCard>
                  {" "}&middot;{" "}
                  <TimeAgo timestamp={signal.timestamp} />
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
