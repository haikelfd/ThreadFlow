import { NextRequest, NextResponse } from "next/server";
import { getSubredditAbout, getSubredditRules } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get("subreddit");
  if (!subreddit) {
    return NextResponse.json({ error: "subreddit required" }, { status: 400 });
  }

  try {
    const [about, rules] = await Promise.all([
      getSubredditAbout(subreddit),
      getSubredditRules(subreddit).catch(() => []),
    ]);

    return NextResponse.json({ ...about, rules });
  } catch (err) {
    console.error("Public subreddit error:", err);
    return NextResponse.json({ error: "Failed to fetch subreddit" }, { status: 500 });
  }
}
