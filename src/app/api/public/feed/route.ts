import { NextRequest, NextResponse } from "next/server";
import { getSubredditFeed, getPopularFeed } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get("subreddit");
  const sort = (req.nextUrl.searchParams.get("sort") ?? "hot") as "hot" | "new" | "top";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "25", 10);

  try {
    const posts = subreddit
      ? await getSubredditFeed(subreddit, sort, limit)
      : await getPopularFeed(sort, limit);

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Public feed error:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
