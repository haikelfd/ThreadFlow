"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  Lightbulb,
  Target,
  MessageCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getAiSuggestions,
  getToneDescription,
  toneLabels,
} from "@/lib/ai-copilot";
import type { AiSuggestion, ReplyTone } from "@/types/reddit";

const toneIcons: Record<ReplyTone, typeof Lightbulb> = {
  helpful: Lightbulb,
  thought_leader: Target,
  casual: MessageCircle,
};

interface ComposeReplyProps {
  parentAuthor: string;
  parentBody: string;
  subreddit: string;
  threadTitle: string;
  onSend: (body: string) => void;
  onCancel: () => void;
}

export function ComposeReply({
  parentAuthor,
  parentBody,
  subreddit,
  threadTitle,
  onSend,
  onCancel,
}: ComposeReplyProps) {
  const [body, setBody] = useState("");
  const [showCopilot, setShowCopilot] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [activeTone, setActiveTone] = useState<ReplyTone | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(80, el.scrollHeight)}px`;
    }
  }, [body]);

  function handleGenerateSuggestions() {
    setIsGenerating(true);
    setShowCopilot(true);

    // Simulate AI generation delay
    setTimeout(() => {
      const results = getAiSuggestions({
        subreddit,
        parentBody,
        parentAuthor,
        threadTitle,
      });
      setSuggestions(results);
      setIsGenerating(false);
    }, 800);
  }

  function handleUseSuggestion(suggestion: AiSuggestion) {
    setBody(suggestion.body);
    setActiveTone(suggestion.tone);
  }

  function handleSend() {
    if (!body.trim()) return;
    setSent(true);
    setTimeout(() => {
      onSend(body);
    }, 600);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-lg border border-[var(--signal-green)]/30 bg-[var(--signal-green)]/5 p-4"
      >
        <Check className="h-5 w-5 text-[var(--signal-green)]" />
        <span className="text-sm font-medium text-[var(--signal-green)]">
          Reply sent to {parentAuthor}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/30 bg-card p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Replying to</span>
          <span className="font-medium text-foreground">{parentAuthor}</span>
          <span className="text-primary/60">in {subreddit}</span>
        </div>
        <button
          onClick={onCancel}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quoted parent */}
      <div className="mb-3 rounded-md border-l-2 border-muted-foreground/30 bg-muted/30 px-3 py-2 text-sm text-muted-foreground line-clamp-2">
        {parentBody}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setActiveTone(null);
        }}
        placeholder="Write your reply... (Markdown supported)"
        className="mb-3 w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
        rows={3}
      />

      {/* AI Copilot Section */}
      <AnimatePresence>
        {showCopilot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <Separator className="mb-3" />
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Copilot</span>
              {activeTone && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-xs text-primary"
                >
                  {toneLabels[activeTone]} tone applied
                </Badge>
              )}
            </div>

            {isGenerating ? (
              <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 p-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">
                  Analyzing thread context and generating suggestions...
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion) => {
                  const ToneIcon = toneIcons[suggestion.tone];
                  const isApplied =
                    activeTone === suggestion.tone &&
                    body === suggestion.body;
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "group cursor-pointer rounded-lg border p-3 transition-all",
                        isApplied
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/40 bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
                      )}
                      onClick={() => handleUseSuggestion(suggestion)}
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <ToneIcon
                          className={cn(
                            "h-3.5 w-3.5",
                            isApplied
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isApplied
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {toneLabels[suggestion.tone]}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                          Click to use
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                        {suggestion.body}
                      </p>
                      <p className="mt-1.5 text-[11px] italic text-muted-foreground/60">
                        {suggestion.reasoning}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleGenerateSuggestions}
        >
          {showCopilot && suggestions.length > 0 ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              AI Suggest
            </>
          )}
        </Button>

        {showCopilot && suggestions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowCopilot(false)}
          >
            {showCopilot ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground"
          onClick={handleSend}
          disabled={!body.trim()}
        >
          <Send className="h-3.5 w-3.5" />
          Reply
        </Button>
      </div>
    </motion.div>
  );
}
