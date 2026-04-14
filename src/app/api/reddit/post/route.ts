import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitPost } from "@/lib/reddit-api";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as { accessToken?: string } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { subreddit, title, body } = await req.json();

  if (!subreddit || !title) {
    return NextResponse.json(
      { error: "subreddit and title required" },
      { status: 400 }
    );
  }

  try {
    const result = await submitPost(
      session.accessToken,
      subreddit.replace("r/", ""),
      title,
      body ?? ""
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("Post error:", err);
    return NextResponse.json(
      { error: "Failed to submit post" },
      { status: 500 }
    );
  }
}
