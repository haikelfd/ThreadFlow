import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getThreadComments } from "@/lib/reddit-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as {
    accessToken?: string;
    redditUsername?: string;
  } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const permalink = req.nextUrl.searchParams.get("permalink");
  if (!permalink) {
    return NextResponse.json({ error: "permalink required" }, { status: 400 });
  }

  try {
    const { post, comments } = await getThreadComments(
      session.accessToken,
      permalink
    );

    // Recursively flatten the comment tree with depth info
    function flattenComments(
      list: Record<string, unknown>[],
      depth = 0
    ): Record<string, unknown>[] {
      const result: Record<string, unknown>[] = [];
      for (const c of list) {
        result.push({
          id: c.id,
          body: c.body,
          author: c.author,
          score: c.score,
          createdUtc: c.created_utc,
          permalink: c.permalink,
          subreddit: `r/${c.subreddit}`,
          parentId: c.parent_id,
          isOwnComment: c.author === session!.redditUsername,
          depth,
          fullname: c.name,
          replies: [],
        });

        const replies = c.replies as { data?: { children?: { kind: string; data: Record<string, unknown> }[] } } | undefined;
        if (replies?.data?.children) {
          const childComments = replies.data.children
            .filter((r) => r.kind === "t1")
            .map((r) => r.data);
          result.push(...flattenComments(childComments, depth + 1));
        }
      }
      return result;
    }

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        selftext: post.selftext,
        subreddit: `r/${post.subreddit}`,
        author: post.author,
        score: post.score,
        numComments: post.num_comments,
        createdUtc: post.created_utc,
        permalink: post.permalink,
        fullname: post.name,
      },
      comments: flattenComments(comments),
    });
  } catch (err) {
    console.error("Thread error:", err);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}
