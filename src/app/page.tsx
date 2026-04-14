"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Zap,
  ArrowRight,
  MessageCircle,
  ArrowBigUp,
  Radar,
  Sparkles,
  Shield,
  PenSquare,
  Rss,
  Activity,
  Search,
  Eye,
  Target,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Rotating words ---
const rotatingWords = [
  "growth engine",
  "command center",
  "marketing hub",
  "engagement tool",
];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % rotatingWords.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={rotatingWords[index]}
          initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.35 }}
          className="gradient-text inline-block"
        >
          {rotatingWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// --- Animated counter ---
function CountUp({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ""), 10);

  useEffect(() => {
    if (!inView || !numericTarget) return;
    let current = 0;
    const step = Math.ceil(numericTarget / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= numericTarget) {
        current = numericTarget;
        clearInterval(timer);
      }
      setValue(current);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, numericTarget]);

  const display = target.includes("B")
    ? `${(value / 1).toLocaleString()}B+`
    : target.includes("M")
      ? `${(value / 1).toLocaleString()}M+`
      : target.includes("K")
        ? `${(value / 1).toLocaleString()}K+`
        : target === "0"
          ? "0"
          : `${value.toLocaleString()}${suffix}`;

  return <span ref={ref}>{inView ? display : target}</span>;
}

// --- Floating cards — pushed to far edges ---
const floatingCards = [
  {
    id: 1,
    content: "+234 karma on your post",
    sub: "r/startups",
    icon: ArrowBigUp,
    color: "text-[var(--signal-green)]",
    side: "left" as const,
    top: "18%",
    delay: 0.8,
  },
  {
    id: 2,
    content: "5 new replies awaiting",
    sub: "r/SaaS",
    icon: MessageCircle,
    color: "text-[var(--signal-orange)]",
    side: "right" as const,
    top: "22%",
    delay: 1.2,
  },
  {
    id: 3,
    content: "Keyword match: 95% score",
    sub: "r/Entrepreneur",
    icon: Radar,
    color: "text-primary",
    side: "left" as const,
    top: "55%",
    delay: 1.6,
  },
  {
    id: 4,
    content: "AI draft ready to send",
    sub: "Reply copilot",
    icon: Sparkles,
    color: "text-[var(--glow-blue)]",
    side: "right" as const,
    top: "50%",
    delay: 2.0,
  },
  {
    id: 5,
    content: "r/marketing: 3 ban rules",
    sub: "Access checker",
    icon: Shield,
    color: "text-[var(--signal-orange)]",
    side: "left" as const,
    top: "38%",
    delay: 2.4,
  },
  {
    id: 6,
    content: "Post trending — 1.2k upvotes",
    sub: "r/dataisbeautiful",
    icon: TrendingUp,
    color: "text-[var(--signal-green)]",
    side: "right" as const,
    top: "38%",
    delay: 2.8,
  },
];

// --- Problems ---
const problems = [
  {
    icon: Eye,
    title: "Posts disappear into the void",
    description:
      "You post something valuable, get a few replies, then lose track. By the time you check back, the thread is dead and the opportunity is gone.",
  },
  {
    icon: MessageCircle,
    title: "Conversations are impossible to follow",
    description:
      "Nested threads, collapsed comments, no notification priority. You miss the high-intent reply from someone ready to buy.",
  },
  {
    icon: Search,
    title: "Finding opportunities is manual labor",
    description:
      "Someone asks 'what's the best tool for X?' — your product. But you didn't see it. By the time you do, 200 comments beat you to it.",
  },
  {
    icon: Shield,
    title: "Rules change. Posts get silently removed.",
    description:
      "Every subreddit has different karma thresholds, link policies, and self-promotion rules. You only find out when your post vanishes.",
  },
];

// --- Features ---
const features = [
  {
    icon: Activity,
    title: "Command Center",
    description:
      "Every metric, every thread, every opportunity — one screen. Animated charts, action queues, and expandable KPI cards.",
    tag: "Overview",
    gradient: "from-primary/20 to-[var(--glow-blue)]/10",
  },
  {
    icon: Radar,
    title: "Keyword Monitor",
    description:
      "Track phrases like 'best CRM' across subreddits. Get scored opportunities ranked by engagement potential.",
    tag: "Proactive",
    gradient: "from-[var(--signal-green)]/15 to-primary/10",
  },
  {
    icon: Sparkles,
    title: "AI Reply Copilot",
    description:
      "Generate tone-aware drafts — Helpful, Thought Leader, or Casual. Each shows the reasoning behind it.",
    tag: "AI-Powered",
    gradient: "from-[var(--glow-blue)]/15 to-primary/10",
  },
  {
    icon: Shield,
    title: "Subreddit Access Checker",
    description:
      "See real posting rules, karma requirements, and ban-risk policies — fetched live from Reddit.",
    tag: "Protection",
    gradient: "from-[var(--signal-orange)]/15 to-destructive/5",
  },
  {
    icon: PenSquare,
    title: "Compose & Reply In-App",
    description:
      "Write posts, reply to threads without opening Reddit. Optimal posting time suggestions. Schedule for peak hours.",
    tag: "Action",
    gradient: "from-primary/15 to-[var(--glow-blue)]/10",
  },
  {
    icon: Rss,
    title: "Reddit Feed Built In",
    description:
      "Browse subreddits inside ThreadFlow. Hover any name to see stats, access status, and rules. Join with one click.",
    tag: "Discovery",
    gradient: "from-[var(--signal-orange)]/10 to-primary/10",
  },
];

// --- Stats ---
const stats = [
  { value: "52M+", label: "Daily active Reddit users" },
  { value: "100K+", label: "Active communities" },
  { value: "13B+", label: "Posts & comments" },
  { value: "0", label: "Tools built for Reddit marketers" },
];

// --- Steps ---
const steps = [
  {
    step: "1",
    title: "Connect your Reddit account",
    description:
      "One-click OAuth login. We sync your posts, comments, subscribed subreddits, and karma data. Takes 30 seconds.",
    icon: Zap,
  },
  {
    step: "2",
    title: "Set up your keyword radar",
    description:
      "Tell ThreadFlow what to watch for — product names, competitor names, problem keywords. We poll Reddit every 10 minutes.",
    icon: Target,
  },
  {
    step: "3",
    title: "Engage with AI assistance",
    description:
      "See an opportunity? Hit reply. The AI copilot generates tone-aware drafts. You edit, send, and track — never on reddit.com.",
    icon: BrainCircuit,
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -25, 20, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--glow-blue)]/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 15, -10, 0], y: [0, -10, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[var(--signal-orange)]/5 blur-[100px]"
        />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
        {/* Floating cards — pinned to far left/right edges */}
        <div className="pointer-events-none absolute inset-0 hidden xl:block">
          {floatingCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, x: card.side === "left" ? -30 : 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: card.delay, duration: 0.6, type: "spring", stiffness: 100 }}
              className="absolute"
              style={{
                [card.side]: "3%",
                top: card.top,
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  delay: card.delay + 0.6,
                  duration: 3 + card.id * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
                  <card.icon className={cn("h-4 w-4 shrink-0", card.color)} />
                  <div>
                    <p className="text-sm font-medium whitespace-nowrap">{card.content}</p>
                    <p className="text-[11px] text-muted-foreground">{card.sub}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-8 flex items-center justify-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-lg shadow-primary/20">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ThreadFlow</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Reddit is your
            <br />
            <RotatingWord />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Stop losing leads in Reddit threads. ThreadFlow gives marketers and
            founders a single dashboard to monitor keywords, reply with AI,
            track every conversation, and never miss an opportunity again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-12 gap-2 bg-primary px-8 text-base text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-border/50 px-8 text-base text-muted-foreground hover:text-foreground"
              >
                Explore Demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-4 text-xs text-muted-foreground/50"
          >
            No credit card required. Connect your Reddit account in 30 seconds.
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-muted-foreground/30"
          >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <div className="h-6 w-px bg-gradient-to-b from-muted-foreground/30 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="relative z-10 overflow-hidden border-t border-border/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive">
                The Problem
              </Badge>
            </motion.div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Reddit is the most powerful organic channel.
              <br />
              <span className="text-muted-foreground">
                It&apos;s also the hardest to manage.
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Millions of potential customers are asking questions, comparing
              products, and making buying decisions on Reddit right now. But
              the platform wasn&apos;t built for marketers.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-destructive/20 hover:shadow-lg hover:shadow-destructive/5"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive/15"
                >
                  <problem.icon className="h-5 w-5" />
                </motion.div>
                <h3 className="mb-2 font-semibold">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-10 border-y border-border/30 bg-card/30 py-16 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-8 px-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 150, damping: 12 }}
              className="text-center"
            >
              <p className={cn(
                "text-4xl font-bold tracking-tight sm:text-5xl",
                stat.value === "0" ? "gradient-text" : ""
              )}>
                {stat.value === "0" ? "0" : <CountUp target={stat.value} />}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                The Solution
              </Badge>
            </motion.div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">own Reddit as a channel</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              ThreadFlow replaces the Reddit tab you keep open all day with a
              single dashboard designed for business. Monitor, engage, protect,
              and grow — without ever opening reddit.com.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    feature.gradient
                  )}
                />
                {/* Animated glow on hover */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/0 blur-[60px] transition-all duration-500 group-hover:bg-primary/10" />

                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
                    >
                      <feature.icon className="h-5 w-5" />
                    </motion.div>
                    <Badge
                      variant="outline"
                      className="border-border/50 text-[10px] text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary"
                    >
                      {feature.tag}
                    </Badge>
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-10 border-t border-border/30 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <Badge variant="outline" className="mb-4 border-border/50">
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From chaos to clarity in 3 steps
            </h2>
          </motion.div>

          <div className="relative">
            {/* Animated connector line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "calc(100% - 64px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute left-8 top-8 hidden w-px overflow-hidden sm:block"
            >
              <div className="h-full w-full bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />
            </motion.div>

            <div className="space-y-0">
              {steps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
                  className="relative flex gap-6 pb-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.3 + i * 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                    }}
                    className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-card shadow-lg shadow-primary/10"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(var(--primary), 0)",
                          "0 0 0 8px rgba(var(--primary), 0.1)",
                          "0 0 0 0 rgba(var(--primary), 0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                      className="flex h-full w-full items-center justify-center rounded-2xl"
                    >
                      <item.icon className="h-7 w-7 text-primary" />
                    </motion.div>
                  </motion.div>
                  <div className="pt-2">
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.2 }}
                      className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary"
                    >
                      Step {item.step}
                    </motion.p>
                    <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative z-10 overflow-hidden border-t border-border/30 py-24">
        {/* Animated glow behind CTA */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              Stop browsing Reddit.
              <br />
              <span className="gradient-text">Start owning it.</span>
            </motion.h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Every minute you spend manually scrolling Reddit is a minute your
              competitor is using ThreadFlow to find and close the same leads.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group h-14 gap-2 bg-primary px-10 text-lg text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
                >
                  Get Started Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-xs text-muted-foreground/50"
            >
              Free to start. No credit card. Connect Reddit in 30 seconds.
            </motion.p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mx-auto mt-24 max-w-5xl border-t border-border/20 px-6 pt-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground/40">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary/40" />
              <span>ThreadFlow</span>
            </div>
            <span>Built for Reddit marketers</span>
          </div>
        </div>
      </section>
    </div>
  );
}
