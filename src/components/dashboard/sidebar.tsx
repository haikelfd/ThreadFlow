"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  MessageSquare,
  Bookmark,
  BarChart3,
  Zap,
  Radar,
  PenSquare,
  Rss,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComposePost } from "@/components/dashboard/compose-post";
import { UserMenu } from "@/components/dashboard/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/activity", icon: Activity, label: "Activity" },
  { href: "/dashboard/monitor", icon: Radar, label: "Monitor" },
  { href: "/dashboard/conversations", icon: MessageSquare, label: "Conversations" },
  { href: "/dashboard/saved", icon: Bookmark, label: "Saved" },
  { href: "/dashboard/insights", icon: BarChart3, label: "Insights" },
  { href: "/dashboard/eligibility", icon: Shield, label: "Subreddit Access" },
  { href: "/dashboard/feed", icon: Rss, label: "Reddit Feed", separator: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [composing, setComposing] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col items-center border-r border-border bg-sidebar py-6">
        {/* Logo */}
        <Link href="/dashboard" className="mb-6 flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
        </Link>

        {/* Compose button */}
        <Tooltip>
          <TooltipTrigger
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:brightness-110"
            onClick={() => setComposing(true)}
          >
            <PenSquare className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            New Post
          </TooltipContent>
        </Tooltip>

        {/* Nav */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <div key={item.href} className="flex flex-col items-center gap-2">
                {(item as { separator?: boolean }).separator && (
                  <div className="my-1 h-px w-6 bg-border/60" />
                )}
                <Tooltip>
                  <TooltipTrigger
                    render={<Link href={item.href} />}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </nav>

        {/* Bottom: theme toggle + user */}
        <div className="mt-auto flex flex-col items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </aside>

      {/* Compose modal */}
      {composing && <ComposePost onClose={() => setComposing(false)} />}
    </>
  );
}
