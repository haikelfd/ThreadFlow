// Reddit API client.
// Handles authenticated requests using the user's OAuth token
// and app-only requests using client credentials for cron jobs.

const REDDIT_API = "https://oauth.reddit.com";
const REDDIT_AUTH = "https://www.reddit.com/api/v1/access_token";

// --- App-only token (for cron jobs, no user context) ---

let appToken: { token: string; expiresAt: number } | null = null;

async function getAppToken(): Promise<string> {
  if (appToken && Date.now() < appToken.expiresAt) {
    return appToken.token;
  }

  const clientId = process.env.REDDIT_CLIENT_ID!;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(REDDIT_AUTH, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "ThreadFlow/1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Reddit auth failed: ${res.status}`);

  const data = await res.json();
  appToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };
  return appToken.token;
}

// --- Core request helpers ---

async function redditGet(
  path: string,
  accessToken: string,
  params?: Record<string, string>
) {
  const url = new URL(`${REDDIT_API}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "ThreadFlow/1.0",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit API ${res.status}: ${text}`);
  }

  return res.json();
}

async function redditPost(
  path: string,
  accessToken: string,
  body: Record<string, string>
) {
  const res = await fetch(`${REDDIT_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "ThreadFlow/1.0",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit API POST ${res.status}: ${text}`);
  }

  return res.json();
}

// --- User data ---

export async function getMyProfile(accessToken: string) {
  return redditGet("/api/v1/me", accessToken);
}

export async function getMySubreddits(accessToken: string, limit = 100) {
  const data = await redditGet("/subreddits/mine/subscriber", accessToken, {
    limit: String(limit),
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

export async function getMyPosts(accessToken: string, username: string, limit = 25) {
  const data = await redditGet(`/user/${username}/submitted`, accessToken, {
    limit: String(limit),
    sort: "new",
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

export async function getMyComments(accessToken: string, username: string, limit = 25) {
  const data = await redditGet(`/user/${username}/comments`, accessToken, {
    limit: String(limit),
    sort: "new",
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

// --- Feed ---

export async function getSubredditFeed(
  accessToken: string,
  subreddit: string,
  sort: "hot" | "new" | "top" = "hot",
  limit = 25
) {
  const data = await redditGet(`/r/${subreddit}/${sort}`, accessToken, {
    limit: String(limit),
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

export async function getHomeFeed(
  accessToken: string,
  sort: "hot" | "new" | "best" = "best",
  limit = 25
) {
  const data = await redditGet(`/${sort}`, accessToken, {
    limit: String(limit),
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

// --- Thread / Comments ---

export async function getThreadComments(
  accessToken: string,
  permalink: string,
  limit = 50
) {
  // permalink format: /r/subreddit/comments/id/slug
  const data = await redditGet(permalink, accessToken, {
    limit: String(limit),
    depth: "5",
    sort: "top",
  });
  // Reddit returns [post, comments] as an array
  const post = data[0]?.data?.children?.[0]?.data;
  const comments = (data[1]?.data?.children ?? [])
    .filter((c: { kind: string }) => c.kind === "t1")
    .map((c: { data: Record<string, unknown> }) => c.data);
  return { post, comments };
}

// --- Search (keyword monitoring) ---

export async function searchReddit(
  keyword: string,
  options: {
    subreddit?: string;
    sort?: "relevance" | "new" | "hot" | "top";
    time?: "hour" | "day" | "week";
    limit?: number;
  } = {}
) {
  const { subreddit, sort = "new", time = "hour", limit = 25 } = options;
  const token = await getAppToken();

  const path = subreddit
    ? `/r/${subreddit}/search`
    : "/search";

  const params: Record<string, string> = {
    q: keyword,
    sort,
    t: time,
    limit: String(limit),
    restrict_sr: subreddit ? "true" : "false",
    type: "link",
  };

  const data = await redditGet(path, token, params);
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

// --- Actions (post, reply, vote) ---

export async function submitReply(
  accessToken: string,
  parentFullname: string, // t1_ or t3_ prefix
  body: string
) {
  return redditPost("/api/comment", accessToken, {
    thing_id: parentFullname,
    text: body,
    api_type: "json",
  });
}

export async function submitPost(
  accessToken: string,
  subreddit: string,
  title: string,
  body: string
) {
  return redditPost("/api/submit", accessToken, {
    sr: subreddit,
    kind: "self",
    title,
    text: body,
    api_type: "json",
  });
}

export async function vote(
  accessToken: string,
  fullname: string,
  direction: 1 | 0 | -1
) {
  return redditPost("/api/vote", accessToken, {
    id: fullname,
    dir: String(direction),
  });
}

// --- Subreddit info + rules ---

export async function getSubredditAbout(accessToken: string, subreddit: string) {
  const data = await redditGet(`/r/${subreddit}/about`, accessToken);
  return data.data;
}

export async function getSubredditRules(accessToken: string, subreddit: string) {
  return redditGet(`/r/${subreddit}/about/rules`, accessToken);
}

export async function getSubredditRequirements(accessToken: string, subreddit: string) {
  // This endpoint returns posting requirements (title length, body, flair, etc.)
  try {
    return await redditGet(`/api/v1/${subreddit}/post_requirements`, accessToken);
  } catch {
    return null;
  }
}

export async function getMyKarmaBreakdown(accessToken: string) {
  const data = await redditGet("/api/v1/me/karma", accessToken);
  return data.data; // Array of { sr: string, comment_karma: number, link_karma: number }
}

// --- Subscribe/Unsubscribe ---

export async function subscribeSubreddit(
  accessToken: string,
  subredditFullname: string, // t5_xxx
  action: "sub" | "unsub" = "sub"
) {
  return redditPost("/api/subscribe", accessToken, {
    sr: subredditFullname,
    action,
  });
}

// --- Inbox (for detecting new replies) ---

export async function getInbox(accessToken: string, limit = 25) {
  const data = await redditGet("/message/inbox", accessToken, {
    limit: String(limit),
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}

export async function getUnread(accessToken: string, limit = 25) {
  const data = await redditGet("/message/unread", accessToken, {
    limit: String(limit),
  });
  return data.data.children.map((c: { data: Record<string, unknown> }) => c.data);
}
