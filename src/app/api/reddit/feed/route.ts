import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHomeFeed, getSubredditFeed } from "@/lib/reddit-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as { accessToken?: string } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subreddit = searchParams.get("subreddit");
  const sort = (searchParams.get("sort") ?? "hot") as "hot" | "new" | "top";
  const limit = parseInt(searchParams.get("limit") ?? "25", 10);

  try {
    const posts = subreddit
      ? await getSubredditFeed(session.accessToken, subreddit, sort, limit)
      : await getHomeFeed(session.accessToken, sort === "top" ? "best" : sort, limit);

    const formatted = posts.map((p: Record<string, unknown>) => ({
      id: p.id,
      title: p.title,
      selftext: p.selftext || "",
      subreddit: `r/${p.subreddit}`,
      author: p.author,
      score: p.score,
      numComments: p.num_comments,
      createdUtc: p.created_utc,
      permalink: p.permalink,
      flair: p.link_flair_text || null,
      thumbnail: p.thumbnail !== "self" && p.thumbnail !== "default" ? p.thumbnail : null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Feed error:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
