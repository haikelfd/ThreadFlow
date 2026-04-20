import { NextRequest, NextResponse } from "next/server";
import { getSubredditPosts } from "@/lib/ensemble-api";
import { getSubredditFeed, getPopularFeed } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get("subreddit");
  const sort = (req.nextUrl.searchParams.get("sort") ?? "hot") as "hot" | "new" | "top";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "25", 10);
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  try {
    // Try EnsembleData first (better data, proper pagination)
    if (subreddit && process.env.ENSEMBLE_TOKEN) {
      const result = await getSubredditPosts(subreddit, sort, "day", cursor);
      return NextResponse.json(result);
    }

    // Fallback to public Reddit JSON
    const posts = subreddit
      ? await getSubredditFeed(subreddit, sort, limit)
      : await getPopularFeed(sort, limit);

    return NextResponse.json({ posts, nextCursor: null });
  } catch (err) {
    console.error("Feed error:", err);
    // Fallback to public JSON on EnsembleData failure
    try {
      const posts = subreddit
        ? await getSubredditFeed(subreddit, sort, limit)
        : await getPopularFeed(sort, limit);
      return NextResponse.json({ posts, nextCursor: null });
    } catch {
      return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
  }
}
