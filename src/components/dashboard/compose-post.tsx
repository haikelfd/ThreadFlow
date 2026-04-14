"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Clock,
  Check,
  ChevronDown,
  Sparkles,
  Lightbulb,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockEligibility } from "@/lib/mock-data";

const popularSubreddits = [
  "r/startups",
  "r/SaaS",
  "r/Entrepreneur",
  "r/indiehackers",
  "r/SideProject",
  "r/smallbusiness",
  "r/marketing",
  "r/GrowthHacking",
];

const optimalTimes: Record<string, string> = {
  "r/startups": "Tue 9am EST",
  "r/SaaS": "Wed 10am EST",
  "r/Entrepreneur": "Mon 8am EST",
  "r/indiehackers": "Thu 11am EST",
  "r/SideProject": "Sat 10am EST",
  "r/smallbusiness": "Tue 2pm EST",
  "r/marketing": "Wed 9am EST",
  "r/GrowthHacking": "Mon 11am EST",
};

interface ComposePostProps {
  onClose: () => void;
}

export function ComposePost({ onClose }: ComposePostProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [showSubredditPicker, setShowSubredditPicker] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [sent, setSent] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const eligibility = subreddit
    ? mockEligibility.find((e) => e.subreddit === subreddit)
    : null;
  const canPost = eligibility ? eligibility.canPost : true;

  function handleSend() {
    if (!title.trim() || !subreddit || !canPost) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }

  const optimalTime = subreddit ? optimalTimes[subreddit] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-xl border border-border/60 bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {sent ? (
            <div className="flex flex-col items-center gap-3 p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--signal-green)]/20"
              >
                <Check className="h-7 w-7 text-[var(--signal-green)]" />
              </motion.div>
              <p className="font-semibold">
                {scheduleMode ? "Post Scheduled" : "Post Published"}
              </p>
              <p className="text-sm text-muted-foreground">
                {scheduleMode
                  ? `Scheduled for ${optimalTime} in ${subreddit}`
                  : `Posted to ${subreddit}`}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <h2 className="text-lg font-semibold">New Post</h2>
                <button
                  onClick={onClose}
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 p-5">
                {/* Subreddit picker */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowSubredditPicker(!showSubredditPicker)
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      subreddit
                        ? "border-primary/30 text-foreground"
                        : "border-border/60 text-muted-foreground"
                    )}
                  >
                    <span>{subreddit || "Choose subreddit..."}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {showSubredditPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover p-1 shadow-lg"
                      >
                        {popularSubreddits.map((sub) => {
                          const el = mockEligibility.find((e) => e.subreddit === sub);
                          const status = el?.status ?? "ready";
                          return (
                            <button
                              key={sub}
                              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                              onClick={() => {
                                setSubreddit(sub);
                                setShowSubredditPicker(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {status === "ready" ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--signal-green)]" />
                                ) : status === "limited" ? (
                                  <AlertTriangle className="h-3.5 w-3.5 text-[var(--signal-orange)]" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-destructive/60" />
                                )}
                                <span>{sub}</span>
                              </div>
                              {optimalTimes[sub] && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Peak: {optimalTimes[sub]}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optimal time hint */}
                {optimalTime && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 rounded-lg border border-[var(--signal-orange)]/20 bg-[var(--signal-orange)]/5 px-3 py-2"
                  >
                    <Lightbulb className="h-4 w-4 text-[var(--signal-orange)]" />
                    <span className="text-xs text-[var(--signal-orange)]">
                      Best time to post in {subreddit}:{" "}
                      <strong>{optimalTime}</strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 gap-1 px-2 text-xs text-[var(--signal-orange)] hover:text-[var(--signal-orange)]"
                      onClick={() => setScheduleMode(true)}
                    >
                      <Clock className="h-3 w-3" />
                      Schedule
                    </Button>
                  </motion.div>
                )}

                {/* Eligibility warning */}
                {eligibility && !eligibility.canPost && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5"
                  >
                    {eligibility.status === "locked" ? (
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal-orange)]" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">
                        You can&apos;t post in {subreddit} yet
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {eligibility.requirements
                          .filter((r) => !r.met)
                          .map((r) => r.label)
                          .join(" · ")}
                      </p>
                    </div>
                    <a
                      href="/dashboard/eligibility"
                      className="shrink-0 text-[11px] font-medium text-primary hover:underline"
                    >
                      View details
                    </a>
                  </motion.div>
                )}

                {/* Title */}
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  maxLength={300}
                />

                {/* Body */}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your post body... (Markdown supported)"
                  className="min-h-[150px] w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />

                {title.length > 0 && (
                  <div className="text-right text-xs text-muted-foreground/50">
                    {title.length}/300
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 border-t border-border/60 px-5 py-4">
                {scheduleMode && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-[var(--signal-orange)]/30 bg-[var(--signal-orange)]/10 text-[var(--signal-orange)]"
                  >
                    <Clock className="h-3 w-3" />
                    Scheduled: {optimalTime}
                    <button
                      onClick={() => setScheduleMode(false)}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground"
                  onClick={handleSend}
                  disabled={!title.trim() || !subreddit || !canPost}
                >
                  <Send className="h-3.5 w-3.5" />
                  {scheduleMode ? "Schedule" : "Post"}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
