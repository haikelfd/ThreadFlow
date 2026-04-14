import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getSubredditAbout,
  getSubredditRules,
  getMySubreddits,
  subscribeSubreddit,
} from "@/lib/reddit-api";
import { getCached, parseRules } from "@/lib/subreddit-store";
import type { SubredditInfo } from "@/types/reddit";

// GET /api/reddit/subreddit-info?subreddit=startups
export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    accessToken?: string;
  } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subreddit = req.nextUrl.searchParams.get("subreddit");
  if (!subreddit) {
    return NextResponse.json({ error: "subreddit required" }, { status: 400 });
  }

  const cleanName = subreddit.replace(/^r\//, "");

  try {
    const [aboutData, rulesData, mySubreddits] = await Promise.all([
      getSubredditAbout(session.accessToken, cleanName),
      getSubredditRules(session.accessToken, cleanName),
      getMySubreddits(session.accessToken, 100),
    ]);

    const isSubscribed = (mySubreddits as Array<{ display_name: string }>).some(
      (s) => s.display_name.toLowerCase() === cleanName.toLowerCase()
    );

    const eligibility = getCached(cleanName);
    const contentRules = parseRules(rulesData);

    const info: SubredditInfo = {
      name: `r/${aboutData.display_name}`,
      title: aboutData.title ?? "",
      description: (aboutData.public_description ?? "").slice(0, 200),
      subscribers: aboutData.subscribers ?? 0,
      activeUsers: aboutData.accounts_active ?? aboutData.active_user_count ?? 0,
      createdUtc: aboutData.created_utc ?? 0,
      icon: aboutData.icon_img || aboutData.community_icon?.split("?")?.[0] || undefined,
      isSubscribed,
      isTracked: !!eligibility,
      fullname: aboutData.name ?? "",
      subredditType: aboutData.subreddit_type ?? "public",
      eligibility: eligibility ?? undefined,
    };

    // Attach rules summary to eligibility if we have it
    if (!info.eligibility && contentRules.length > 0) {
      info.eligibility = {
        subreddit: `r/${cleanName}`,
        status: aboutData.subreddit_type === "restricted" ? "locked" : "ready",
        userKarma: 0,
        userCommentKarma: 0,
        requirements: [],
        contentRules,
        restrictions: contentRules.filter((r) => r.severity === "ban").map((r) => r.title),
        canPost: aboutData.subreddit_type !== "restricted",
        canComment: aboutData.subreddit_type !== "private",
      };
    }

    return NextResponse.json(info);
  } catch (err) {
    console.error(`Error fetching info for r/${cleanName}:`, err);
    return NextResponse.json(
      { error: `Failed to fetch r/${cleanName}` },
      { status: 500 }
    );
  }
}

// POST /api/reddit/subreddit-info — subscribe/unsubscribe
export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    accessToken?: string;
  } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { fullname, action } = (await req.json()) as {
    fullname: string;
    action: "sub" | "unsub";
  };

  if (!fullname || !action) {
    return NextResponse.json(
      { error: "fullname and action required" },
      { status: 400 }
    );
  }

  try {
    await subscribeSubreddit(session.accessToken, fullname, action);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
