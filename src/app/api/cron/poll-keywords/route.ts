import { NextRequest, NextResponse } from "next/server";
import { searchReddit } from "@/lib/reddit-api";
import {
  getKeywords,
  addMatches,
  setLastPoll,
} from "@/lib/keyword-store";
import type { KeywordMatch } from "@/types/reddit";

// Secure the cron with a secret
function authorized(req: NextRequest): boolean {
  const secret = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) return true; // skip in dev
  return secret === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keywords = getKeywords().filter((k) => k.isActive);

  if (keywords.length === 0) {
    return NextResponse.json({ message: "No active keywords", matched: 0 });
  }

  let totalNew = 0;

  for (const kw of keywords) {
    try {
      // Search across specified subreddits, or all of Reddit
      const subreddits = kw.subreddits.length > 0 ? kw.subreddits : [undefined];

      for (const subreddit of subreddits) {
        const results = await searchReddit(kw.keyword, {
          subreddit: subreddit?.replace("r/", ""),
          sort: "new",
          time: "hour",
          limit: 10,
        });

        const matches: KeywordMatch[] = results.map(
          (post: Record<string, unknown>) => ({
            id: `km_${post.id}`,
            keywordId: kw.id,
            keyword: kw.keyword,
            postTitle: post.title as string,
            postBody: (post.selftext as string) || "",
            subreddit: `r/${post.subreddit}`,
            author: post.author as string,
            score: post.score as number,
            numComments: post.num_comments as number,
            createdUtc: post.created_utc as number,
            permalink: post.permalink as string,
            opportunityScore: calculateOpportunityScore(post),
            isComment: false,
            replied: false,
          })
        );

        totalNew += addMatches(matches);
      }
    } catch (err) {
      console.error(`Error polling keyword "${kw.keyword}":`, err);
    }
  }

  setLastPoll(Date.now());

  return NextResponse.json({
    message: `Polled ${keywords.length} keywords`,
    matched: totalNew,
    timestamp: new Date().toISOString(),
  });
}

// Score based on recency, engagement, and comment count
function calculateOpportunityScore(post: Record<string, unknown>): number {
  const ageHours =
    (Date.now() / 1000 - (post.created_utc as number)) / 3600;
  const score = post.score as number;
  const comments = post.num_comments as number;

  // Fresher = better (max 40 points)
  const recencyScore = Math.max(0, 40 - ageHours * 4);
  // More engagement = hotter topic (max 30 points)
  const engagementScore = Math.min(30, Math.log10(Math.max(1, score)) * 10);
  // More comments = active discussion (max 30 points)
  const discussionScore = Math.min(30, Math.log10(Math.max(1, comments)) * 12);

  return Math.round(recencyScore + engagementScore + discussionScore);
}
