// Subreddit eligibility store.
// Caches fetched rules per subreddit. In production, use a database.

import type { SubredditEligibility, ContentRule, SubredditRequirement } from "@/types/reddit";

const cache = new Map<string, { data: SubredditEligibility; fetchedAt: number }>();

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export function getCached(subreddit: string): SubredditEligibility | null {
  const entry = cache.get(subreddit);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    cache.delete(subreddit);
    return null;
  }
  return entry.data;
}

export function setCache(subreddit: string, data: SubredditEligibility) {
  cache.set(subreddit, { data, fetchedAt: Date.now() });
}

export function getAllCached(): SubredditEligibility[] {
  const now = Date.now();
  const result: SubredditEligibility[] = [];
  for (const [key, entry] of cache.entries()) {
    if (now - entry.fetchedAt > CACHE_TTL) {
      cache.delete(key);
    } else {
      result.push(entry.data);
    }
  }
  return result;
}

export function clearCache(subreddit?: string) {
  if (subreddit) {
    cache.delete(subreddit);
  } else {
    cache.clear();
  }
}

// --- Parse Reddit API responses into our types ---

export function parseRules(
  rulesData: { rules?: Array<{ short_name: string; description: string; violation_reason: string }> }
): ContentRule[] {
  if (!rulesData?.rules) return [];

  return rulesData.rules.map((rule, i) => {
    const lower = (rule.description || rule.short_name).toLowerCase();

    // Detect severity from language
    let severity: ContentRule["severity"] = "remove";
    if (lower.includes("ban") || lower.includes("permanent")) {
      severity = "ban";
    } else if (lower.includes("warn") || lower.includes("first offense")) {
      severity = "warn";
    }

    // Detect category
    let category: ContentRule["category"] = "behavior";
    if (lower.includes("link") || lower.includes("url") || lower.includes("external")) {
      category = "links";
    } else if (lower.includes("self-promot") || lower.includes("self promot") || lower.includes("promo") || lower.includes("advertis") || lower.includes("shill")) {
      category = "self_promotion";
    } else if (lower.includes("spam") || lower.includes("affiliate") || lower.includes("referral")) {
      category = "spam";
    } else if (lower.includes("flair") || lower.includes("title") || lower.includes("format")) {
      category = "formatting";
    } else if (lower.includes("content") || lower.includes("post") || lower.includes("topic")) {
      category = "content_type";
    }

    return {
      id: `rule_${i}`,
      title: rule.short_name,
      description: rule.description || rule.short_name,
      severity,
      category,
    };
  });
}

export function parseRequirements(
  aboutData: Record<string, unknown>,
  postReqs: Record<string, unknown> | null,
  userKarma: { total: number; comment: number; subredditKarma: number }
): { requirements: SubredditRequirement[]; canPost: boolean; canComment: boolean } {
  const requirements: SubredditRequirement[] = [];
  let canPost = true;
  let canComment = true;

  // Check subreddit type
  const subType = aboutData.subreddit_type as string;
  if (subType === "restricted" || subType === "private") {
    requirements.push({
      type: "approved_only",
      label: subType === "private" ? "Private subreddit — invite only" : "Restricted — approved posters only",
      met: false,
    });
    canPost = false;
    if (subType === "private") canComment = false;
  }

  // Min account age (from comment_score_hide_mins or general patterns)
  const minAge = aboutData.min_comment_karma as number | undefined;
  if (minAge && minAge > 0) {
    requirements.push({
      type: "min_comment_karma",
      label: `Minimum ${minAge} comment karma`,
      threshold: minAge,
      met: userKarma.comment >= minAge,
      current: userKarma.comment,
      progress: Math.min(100, Math.round((userKarma.comment / minAge) * 100)),
    });
    if (userKarma.comment < minAge) canPost = false;
  }

  // Post requirements from the API
  if (postReqs) {
    if (postReqs.is_flair_required) {
      requirements.push({
        type: "flair_required",
        label: "Post flair required",
        met: true, // They can select flair, just need to know
      });
    }

    const minTitleLen = postReqs.title_text_min_length as number | undefined;
    if (minTitleLen && minTitleLen > 0) {
      requirements.push({
        type: "custom",
        label: `Title must be at least ${minTitleLen} characters`,
        met: true,
      });
    }

    const bodyReq = postReqs.body_restriction_policy as string | undefined;
    if (bodyReq === "required") {
      requirements.push({
        type: "custom",
        label: "Post body text is required",
        met: true,
      });
    }
  }

  // If no explicit requirements found, add a basic karma check
  if (requirements.length === 0) {
    requirements.push({
      type: "min_karma",
      label: "Minimum karma (estimated)",
      threshold: 1,
      met: userKarma.total >= 1,
      current: userKarma.total,
      progress: 100,
    });
  }

  return { requirements, canPost, canComment };
}

export function determineStatus(canPost: boolean, canComment: boolean): SubredditEligibility["status"] {
  if (canPost && canComment) return "ready";
  if (canComment) return "limited";
  return "locked";
}
