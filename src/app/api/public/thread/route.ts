import { NextRequest, NextResponse } from "next/server";
import { getThread } from "@/lib/reddit-public";

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get("subreddit");
  const postId = req.nextUrl.searchParams.get("id");

  if (!subreddit || !postId) {
    return NextResponse.json(
      { error: "subreddit and id required" },
      { status: 400 }
    );
  }

  try {
    const thread = await getThread(subreddit, postId);
    return NextResponse.json(thread);
  } catch (err) {
    console.error("Public thread error:", err);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}
