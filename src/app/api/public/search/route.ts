import { NextRequest, NextResponse } from "next/server";
import { searchKeyword } from "@/lib/ensemble-api";
import { searchPosts } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "q parameter required" }, { status: 400 });
  }

  const sort = (req.nextUrl.searchParams.get("sort") ?? "new") as "relevance" | "new" | "hot" | "top";
  const period = (req.nextUrl.searchParams.get("period") ?? "day") as "hour" | "day" | "week";
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  try {
    // Try EnsembleData first
    if (process.env.ENSEMBLE_TOKEN) {
      const result = await searchKeyword(query, sort, period, cursor);
      return NextResponse.json(result);
    }

    // Fallback to public Reddit JSON
    const posts = await searchPosts(query, { sort, time: period, limit: 25 });
    return NextResponse.json({ posts, nextCursor: null });
  } catch (err) {
    console.error("Search error:", err);
    try {
      const posts = await searchPosts(query, { sort, time: period, limit: 25 });
      return NextResponse.json({ posts, nextCursor: null });
    } catch {
      return NextResponse.json({ error: "Failed to search" }, { status: 500 });
    }
  }
}
