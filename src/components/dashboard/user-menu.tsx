"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20 ring-2 ring-primary/30" />
    );
  }

  if (!session) {
    return (
      <Tooltip>
        <TooltipTrigger
          onClick={() => signIn("reddit")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30 transition-all hover:bg-primary/30 hover:ring-primary/50"
        >
          <LogIn className="h-4 w-4 text-primary" />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Sign in with Reddit
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full ring-2 ring-primary/30 transition-all hover:ring-primary/50"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-48">
        <div className="px-1.5 py-1.5">
          <p className="text-sm font-medium truncate">
            {session.user?.name ?? "Reddit User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Connected via Reddit
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
