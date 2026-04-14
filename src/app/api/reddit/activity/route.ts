import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMyPosts, getMyComments, getUnread } from "@/lib/reddit-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as {
    accessToken?: string;
    redditUsername?: string;
  } | null;
  if (!session?.accessToken || !session.redditUsername) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "all"; // all | posts | comments | unread
  const limit = parseInt(searchParams.get("limit") ?? "25", 10);

  try {
    if (type === "unread") {
      const unread = await getUnread(session.accessToken, limit);
      return NextResponse.json(unread);
    }

    const [posts, comments] = await Promise.all([
      type !== "comments"
        ? getMyPosts(session.accessToken, session.redditUsername, limit)
        : Promise.resolve([]),
      type !== "posts"
        ? getMyComments(session.accessToken, session.redditUsername, limit)
        : Promise.resolve([]),
    ]);

    // Normalize into unified format
    const activity = [
      ...posts.map((p: Record<string, unknown>) => ({
        id: p.id,
        title: p.title,
        selftext: p.selftext || "",
        subreddit: `r/${p.subreddit}`,
        author: p.author,
        score: p.score,
        numComments: p.num_comments,
        createdUtc: p.created_utc,
        permalink: p.permalink,
        isComment: false,
        fullname: p.name, // t3_xxx
      })),
      ...comments.map((c: Record<string, unknown>) => ({
        id: c.id,
        title: `Re: ${c.link_title ?? ""}`,
        selftext: c.body || "",
        subreddit: `r/${c.subreddit}`,
        author: c.author,
        score: c.score,
        numComments: 0,
        createdUtc: c.created_utc,
        permalink: c.permalink,
        isComment: true,
        parentId: c.parent_id,
        fullname: c.name, // t1_xxx
      })),
    ].sort(
      (a, b) => (b.createdUtc as number) - (a.createdUtc as number)
    );

    return NextResponse.json(activity);
  } catch (err) {
    console.error("Activity error:", err);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
