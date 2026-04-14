export type PostStatus = "active" | "reply_later" | "important" | "done";

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
  url: string;
  isComment: boolean;
  parentId?: string;
  status: PostStatus;
  hasNewReplies: boolean;
  unansweredCount: number;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  createdUtc: number;
  permalink: string;
  subreddit: string;
  parentId: string;
  replies: RedditComment[];
  isOwnComment: boolean;
  depth: number;
}

export interface ConversationThread {
  id: string;
  post: RedditPost;
  comments: RedditComment[];
  lastActivity: number;
  participantCount: number;
}

export interface SubredditInsight {
  name: string;
  postCount: number;
  totalScore: number;
  avgScore: number;
  totalComments: number;
}

export interface ActivitySignal {
  id: string;
  type: "new_reply" | "unanswered" | "trending";
  postId: string;
  title: string;
  subreddit: string;
  message: string;
  timestamp: number;
}

// --- Keyword Monitoring ---

export interface TrackedKeyword {
  id: string;
  keyword: string;
  subreddits: string[]; // empty = all
  createdAt: number;
  matchCount: number;
  isActive: boolean;
}

export interface KeywordMatch {
  id: string;
  keywordId: string;
  keyword: string;
  postTitle: string;
  postBody: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
  opportunityScore: number; // 0-100, higher = better engagement opportunity
  isComment: boolean;
  replied: boolean;
}

// --- Compose & Reply ---

export type ReplyTone = "helpful" | "thought_leader" | "casual";

export interface AiSuggestion {
  id: string;
  tone: ReplyTone;
  body: string;
  reasoning: string;
}

export interface ComposeState {
  replyingTo: { id: string; author: string; body: string; subreddit: string } | null;
  composingPost: boolean;
  draftBody: string;
}

// --- Subreddit Eligibility ---

export interface SubredditEligibility {
  subreddit: string;
  status: "ready" | "limited" | "locked";
  userKarma: number;
  userCommentKarma: number;
  requirements: SubredditRequirement[];
  contentRules: ContentRule[];
  restrictions: string[];
  canPost: boolean;
  canComment: boolean;
}

export interface SubredditRequirement {
  type: "min_karma" | "min_comment_karma" | "min_account_age" | "min_subreddit_karma" | "flair_required" | "approved_only" | "custom";
  label: string;
  threshold?: number;
  met: boolean;
  current?: number;
  progress?: number; // 0-100
}

export type RuleSeverity = "ban" | "remove" | "warn";

export interface ContentRule {
  id: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  category: "self_promotion" | "links" | "content_type" | "formatting" | "behavior" | "spam";
}

// --- Subreddit Info (for hover cards) ---

export interface SubredditInfo {
  name: string;            // "r/startups"
  title: string;           // "Startups - pair your skills with ideas"
  description: string;
  subscribers: number;
  activeUsers: number;
  createdUtc: number;
  icon?: string;
  isSubscribed: boolean;
  isTracked: boolean;
  fullname: string;        // t5_xxx for API calls
  subredditType: "public" | "restricted" | "private";
  eligibility?: SubredditEligibility;
}

// --- Reddit Feed ---

export interface FeedPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
  thumbnail?: string;
  flair?: string;
  pinned?: boolean;
}
