// EnsembleData Reddit API client
// Docs: https://ensembledata.com/apis/docs
// Endpoints: keyword/search, subreddit/posts, post/comments
// Free tier: 50 units/day

const BASE = "https://ensembledata.com/apis";

function getToken() {
  return process.env.ENSEMBLE_TOKEN ?? "";
}

async function fetchEnsemble(path: string, params: Record<string, string>) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("token", getToken());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    next: { revalidate: 120 }, // cache 2 minutes
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EnsembleData ${res.status}: ${text}`);
  }

  return res.json();
}

// --- Subreddit feed ---

export async function getSubredditPosts(
  subreddit: string,
  sort: "hot" | "new" | "top" | "rising" = "hot",
  period: "hour" | "day" | "week" | "month" | "year" | "all" = "day",
  cursor?: string
) {
  const clean = subreddit.replace(/^r\//, "");
  const params: Record<string, string> = { name: clean, sort, period };
  if (cursor) params.cursor = cursor;

  const data = await fetchEnsemble("/reddit/subreddit/posts", params);
  const posts = (data.data?.posts ?? []).map(
    (item: { data: Record<string, unknown> }) => formatPost(item.data)
  );
  const nextCursor = data.data?.nextCursor ?? null;

  return { posts, nextCursor };
}

// --- Keyword search ---

export async function searchKeyword(
  keyword: string,
  sort: "relevance" | "hot" | "new" | "top" | "comments" = "new",
  period: "hour" | "day" | "week" | "month" | "year" | "all" = "day",
  cursor?: string
) {
  const params: Record<string, string> = { name: keyword, sort, period, cursor: cursor ?? "" };

  const data = await fetchEnsemble("/reddit/keyword/search", params);
  const posts = (data.data?.posts ?? []).map(
    (item: { data: Record<string, unknown> }) => formatPost(item.data)
  );
  const nextCursor = data.data?.nextCursor ?? null;

  return { posts, nextCursor };
}

// --- Post comments ---

export async function getPostComments(permalink: string) {
  const data = await fetchEnsemble("/reddit/post/comments", { permalink });
  const comments = (data.data?.comments ?? []).map(
    (item: { data: Record<string, unknown> }) => formatComment(item.data, 0)
  );
  return comments;
}

// --- Format helpers ---

function formatPost(p: Record<string, unknown>) {
  return {
    id: p.id as string,
    fullname: p.name as string,
    title: p.title as string,
    selftext: (p.selftext as string) || "",
    subreddit: `r/${p.subreddit}`,
    author: p.author as string,
    score: (p.score as number) ?? (p.ups as number) ?? 0,
    numComments: (p.num_comments as number) ?? 0,
    createdUtc: p.created_utc as number,
    permalink: p.permalink as string,
    url: (p.url as string) ?? "",
    flair: (p.link_flair_text as string) || null,
    thumbnail:
      p.thumbnail !== "self" &&
      p.thumbnail !== "default" &&
      p.thumbnail !== "nsfw" &&
      p.thumbnail !== ""
        ? (p.thumbnail as string)
        : null,
    upvoteRatio: (p.upvote_ratio as number) ?? 0,
    isComment: false,
  };
}

function formatComment(
  c: Record<string, unknown>,
  depth: number
): Record<string, unknown> {
  const replies: Record<string, unknown>[] = [];

  // Handle nested replies
  const replyData = c.replies as
    | { data?: { children?: { kind: string; data: Record<string, unknown> }[] } }
    | string
    | undefined;

  if (replyData && typeof replyData === "object" && replyData.data?.children) {
    for (const child of replyData.data.children) {
      if (child.kind === "t1") {
        replies.push(formatComment(child.data, depth + 1));
      }
    }
  }

  return {
    id: c.id,
    fullname: c.name,
    body: c.body,
    author: c.author,
    score: c.score ?? c.ups ?? 0,
    createdUtc: c.created_utc,
    permalink: c.permalink,
    subreddit: `r/${c.subreddit}`,
    parentId: c.parent_id,
    depth,
    replies,
  };
}
