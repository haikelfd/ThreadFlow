"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={() => setTheme(next)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label} — click to switch
      </TooltipContent>
    </Tooltip>
  );
}
