import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "q parameter required" }, { status: 400 });
  }

  const subreddit = req.nextUrl.searchParams.get("subreddit") ?? undefined;
  const sort = (req.nextUrl.searchParams.get("sort") ?? "new") as "relevance" | "new" | "hot" | "top";
  const time = (req.nextUrl.searchParams.get("time") ?? "day") as "hour" | "day" | "week";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "25", 10);

  try {
    const results = await searchPosts(query, { subreddit, sort, time, limit });
    return NextResponse.json(results);
  } catch (err) {
    console.error("Public search error:", err);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
