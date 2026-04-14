import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getSubredditAbout,
  getSubredditRules,
  getSubredditRequirements,
  getMyKarmaBreakdown,
} from "@/lib/reddit-api";
import {
  getCached,
  setCache,
  getAllCached,
  parseRules,
  parseRequirements,
  determineStatus,
} from "@/lib/subreddit-store";
import type { SubredditEligibility } from "@/types/reddit";

// GET /api/reddit/subreddit-rules?subreddit=startups
// GET /api/reddit/subreddit-rules (returns all cached)
export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    accessToken?: string;
    redditUsername?: string;
  } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subreddit = req.nextUrl.searchParams.get("subreddit");

  // Return all cached if no specific subreddit
  if (!subreddit) {
    return NextResponse.json(getAllCached());
  }

  const cleanName = subreddit.replace(/^r\//, "");

  // Check cache first
  const cached = getCached(cleanName);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Fetch everything from Reddit in parallel
    const [aboutData, rulesData, postReqs, karmaBreakdown] = await Promise.all([
      getSubredditAbout(session.accessToken, cleanName),
      getSubredditRules(session.accessToken, cleanName),
      getSubredditRequirements(session.accessToken, cleanName),
      getMyKarmaBreakdown(session.accessToken),
    ]);

    // Find user's karma in this subreddit
    const subKarma = (karmaBreakdown as Array<{ sr: string; comment_karma: number; link_karma: number }>)
      ?.find((k) => k.sr.toLowerCase() === cleanName.toLowerCase());

    const userKarma = {
      total: (subKarma?.link_karma ?? 0) + (subKarma?.comment_karma ?? 0),
      comment: subKarma?.comment_karma ?? 0,
      subredditKarma: (subKarma?.link_karma ?? 0) + (subKarma?.comment_karma ?? 0),
    };

    // Parse rules and requirements
    const contentRules = parseRules(rulesData);
    const { requirements, canPost, canComment } = parseRequirements(
      aboutData,
      postReqs,
      userKarma
    );

    // Total karma across all subreddits
    const totalKarma = (karmaBreakdown as Array<{ link_karma: number; comment_karma: number }>)
      ?.reduce((acc, k) => acc + k.link_karma + k.comment_karma, 0) ?? 0;
    const totalCommentKarma = (karmaBreakdown as Array<{ comment_karma: number }>)
      ?.reduce((acc, k) => acc + k.comment_karma, 0) ?? 0;

    const eligibility: SubredditEligibility = {
      subreddit: `r/${cleanName}`,
      status: determineStatus(canPost, canComment),
      userKarma: totalKarma,
      userCommentKarma: totalCommentKarma,
      requirements,
      contentRules,
      restrictions: contentRules
        .filter((r) => r.severity === "ban")
        .map((r) => r.title),
      canPost,
      canComment,
    };

    // Cache it
    setCache(cleanName, eligibility);

    return NextResponse.json(eligibility);
  } catch (err) {
    console.error(`Error fetching rules for r/${cleanName}:`, err);
    return NextResponse.json(
      { error: `Failed to fetch rules for r/${cleanName}` },
      { status: 500 }
    );
  }
}

// POST /api/reddit/subreddit-rules — batch fetch multiple subreddits
export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    accessToken?: string;
  } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { subreddits } = (await req.json()) as { subreddits: string[] };

  if (!subreddits?.length) {
    return NextResponse.json({ error: "subreddits array required" }, { status: 400 });
  }

  // Fetch each, returning cached where available
  const results: SubredditEligibility[] = [];

  for (const sub of subreddits) {
    const cleanName = sub.replace(/^r\//, "");
    const cached = getCached(cleanName);
    if (cached) {
      results.push(cached);
      continue;
    }

    // Fetch fresh — redirect to the GET handler logic
    try {
      const res = await fetch(
        `${req.nextUrl.origin}/api/reddit/subreddit-rules?subreddit=${cleanName}`,
        {
          headers: { cookie: req.headers.get("cookie") ?? "" },
        }
      );
      if (res.ok) {
        results.push(await res.json());
      }
    } catch {
      // Skip failures, return what we can
    }
  }

  return NextResponse.json(results);
}
