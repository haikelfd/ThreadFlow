// Reddit public JSON API — no auth, no API key needed.
// Works by appending .json to any Reddit URL.
// Rate limited to ~10 requests/minute per IP.

const BASE = "https://www.reddit.com";
const HEADERS = {
  "User-Agent": "ThreadFlow/1.0 (web dashboard)",
  Accept: "application/json",
};

async function fetchReddit(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: HEADERS,
    next: { revalidate: 60 }, // cache for 1 minute
  });

  if (!res.ok) {
    throw new Error(`Reddit ${res.status}: ${path}`);
  }

  return res.json();
}

// --- Feeds ---

export async function getSubredditFeed(
  subreddit: string,
  sort: "hot" | "new" | "top" | "rising" = "hot",
  limit = 25
) {
  const clean = subreddit.replace(/^r\//, "");
  const data = await fetchReddit(`/r/${clean}/${sort}.json`, {
    limit: String(limit),
    raw_json: "1",
  });
  return (data.data?.children ?? []).map(
    (c: { data: Record<string, unknown> }) => formatPost(c.data)
  );
}

export async function getPopularFeed(
  sort: "hot" | "new" | "top" = "hot",
  limit = 25
) {
  const data = await fetchReddit(`/${sort}.json`, {
    limit: String(limit),
    raw_json: "1",
  });
  return (data.data?.children ?? []).map(
    (c: { data: Record<string, unknown> }) => formatPost(c.data)
  );
}

// --- Search ---

export async function searchPosts(
  query: string,
  options: {
    subreddit?: string;
    sort?: "relevance" | "new" | "hot" | "top";
    time?: "hour" | "day" | "week" | "month" | "all";
    limit?: number;
  } = {}
) {
  const { subreddit, sort = "new", time = "day", limit = 25 } = options;
  const clean = subreddit?.replace(/^r\//, "");
  const path = clean ? `/r/${clean}/search.json` : "/search.json";

  const data = await fetchReddit(path, {
    q: query,
    sort,
    t: time,
    limit: String(limit),
    restrict_sr: clean ? "true" : "false",
    type: "link",
    raw_json: "1",
  });

  return (data.data?.children ?? []).map(
    (c: { data: Record<string, unknown> }) => formatPost(c.data)
  );
}

// --- Subreddit info ---

export async function getSubredditAbout(subreddit: string) {
  const clean = subreddit.replace(/^r\//, "");
  const data = await fetchReddit(`/r/${clean}/about.json`);
  const d = data.data ?? {};
  return {
    name: `r/${d.display_name ?? clean}`,
    title: d.title ?? "",
    description: (d.public_description ?? "").slice(0, 300),
    subscribers: d.subscribers ?? 0,
    activeUsers: d.accounts_active ?? d.active_user_count ?? 0,
    createdUtc: d.created_utc ?? 0,
    icon: d.icon_img || d.community_icon?.split("?")?.[0] || null,
    subredditType: d.subreddit_type ?? "public",
    fullname: d.name ?? "",
    over18: d.over18 ?? false,
  };
}

export async function getSubredditRules(subreddit: string) {
  const clean = subreddit.replace(/^r\//, "");
  const data = await fetchReddit(`/r/${clean}/about/rules.json`);
  return (data.rules ?? []).map(
    (rule: { short_name: string; description: string; violation_reason: string; kind: string }, i: number) => ({
      id: `rule_${i}`,
      title: rule.short_name,
      description: rule.description || rule.short_name,
      kind: rule.kind,
      violation_reason: rule.violation_reason,
    })
  );
}

// --- Thread / comments ---

export async function getThread(subreddit: string, postId: string, limit = 50) {
  const clean = subreddit.replace(/^r\//, "");
  const data = await fetchReddit(`/r/${clean}/comments/${postId}.json`, {
    limit: String(limit),
    depth: "5",
    sort: "top",
    raw_json: "1",
  });

  const post = data[0]?.data?.children?.[0]?.data;
  const comments = (data[1]?.data?.children ?? [])
    .filter((c: { kind: string }) => c.kind === "t1")
    .map((c: { data: Record<string, unknown> }) => formatComment(c.data, 0));

  return {
    post: post ? formatPost(post) : null,
    comments,
  };
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
    score: p.score as number,
    numComments: p.num_comments as number,
    createdUtc: p.created_utc as number,
    permalink: p.permalink as string,
    url: p.url as string,
    flair: (p.link_flair_text as string) || null,
    thumbnail:
      p.thumbnail !== "self" && p.thumbnail !== "default" && p.thumbnail !== "nsfw"
        ? (p.thumbnail as string)
        : null,
    isComment: false,
  };
}

function formatComment(
  c: Record<string, unknown>,
  depth: number
): Record<string, unknown> {
  const replies: Record<string, unknown>[] = [];
  const replyData = c.replies as { data?: { children?: { kind: string; data: Record<string, unknown> }[] } } | undefined;

  if (replyData?.data?.children) {
    for (const child of replyData.data.children) {
      if (child.kind === "t1") {
        replies.push(formatComment(child.data, depth + 1));
      }
    }
  }

  return {
    id: c.id,
    body: c.body,
    author: c.author,
    score: c.score,
    createdUtc: c.created_utc,
    permalink: c.permalink,
    subreddit: `r/${c.subreddit}`,
    parentId: c.parent_id,
    depth,
    fullname: c.name,
    replies,
  };
}
