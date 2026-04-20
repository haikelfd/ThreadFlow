import { NextRequest, NextResponse } from "next/server";
import { getPostComments } from "@/lib/ensemble-api";
import { getThread } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get("subreddit");
  const postId = req.nextUrl.searchParams.get("id");
  const permalink = req.nextUrl.searchParams.get("permalink");

  if (!permalink && (!subreddit || !postId)) {
    return NextResponse.json(
      { error: "permalink or (subreddit + id) required" },
      { status: 400 }
    );
  }

  try {
    // Try EnsembleData first
    if (process.env.ENSEMBLE_TOKEN && permalink) {
      const comments = await getPostComments(permalink);
      return NextResponse.json({ comments });
    }

    // Fallback to public Reddit JSON
    if (subreddit && postId) {
      const thread = await getThread(subreddit, postId);
      return NextResponse.json(thread);
    }

    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  } catch (err) {
    console.error("Thread error:", err);
    // Fallback
    try {
      if (subreddit && postId) {
        const thread = await getThread(subreddit, postId);
        return NextResponse.json(thread);
      }
    } catch {}
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}
