import type { AiSuggestion, ReplyTone } from "@/types/reddit";

// Simulated AI reply generation.
// In production, this calls your AI API (Claude, GPT, etc.)
// The suggestions are contextual — aware of the thread, subreddit culture, and intent.

interface GenerateContext {
  subreddit: string;
  parentBody: string;
  parentAuthor: string;
  threadTitle: string;
}

const toneDescriptions: Record<ReplyTone, string> = {
  helpful:
    "Genuinely useful, direct answer. No self-promotion. Builds credibility by being the most helpful person in the thread.",
  thought_leader:
    "Share a perspective or insight. Position yourself as someone who's done this before. Add value through experience.",
  casual:
    "Natural, conversational. Like talking to a friend who happens to know a lot about this topic.",
};

// Simulated contextual replies based on common Reddit growth patterns
function generateForContext(ctx: GenerateContext): AiSuggestion[] {
  const { subreddit, parentBody, parentAuthor } = ctx;
  const lowerBody = parentBody.toLowerCase();

  // Detect intent from the parent comment
  const isAskingForRecommendation =
    lowerBody.includes("looking for") ||
    lowerBody.includes("recommend") ||
    lowerBody.includes("what do you use") ||
    lowerBody.includes("best") ||
    lowerBody.includes("alternative");

  const isAskingForAdvice =
    lowerBody.includes("how do") ||
    lowerBody.includes("what's your") ||
    lowerBody.includes("any tips") ||
    lowerBody.includes("challenge");

  const isSharingExperience =
    lowerBody.includes("we switched") ||
    lowerBody.includes("i built") ||
    lowerBody.includes("here's what") ||
    lowerBody.includes("our team");

  const isTechnical =
    lowerBody.includes("api") ||
    lowerBody.includes("self-host") ||
    lowerBody.includes("integrate") ||
    lowerBody.includes("open source");

  const suggestions: AiSuggestion[] = [];

  if (isAskingForRecommendation) {
    suggestions.push(
      {
        id: "ai_helpful_rec",
        tone: "helpful",
        body: `Great question! We ran into the same problem at our company. After trying a few options, here are the key things I'd look for:\n\n1. **Ease of setup** — if your team can't get started in under 10 minutes, adoption will suffer\n2. **Pricing that scales** — watch out for per-seat pricing that explodes as you grow\n3. **API access** — you'll want to integrate with your existing stack eventually\n\nHappy to share more specifics about what worked for us if that'd be helpful.`,
        reasoning:
          "Leads with empathy, provides actionable framework, opens door for follow-up without pushing a product.",
      },
      {
        id: "ai_leader_rec",
        tone: "thought_leader",
        body: `I've evaluated dozens of tools in this space over the past 3 years, and the biggest mistake I see teams make is optimizing for features instead of workflow fit.\n\nThe tool that "does everything" usually means nobody on the team uses it consistently. The best tool is the one your team actually opens every day.\n\nMy suggestion: list your 3 non-negotiable workflows first, then evaluate. You'll eliminate 80% of options immediately.`,
        reasoning:
          "Establishes authority through experience, offers a contrarian but useful framework, doesn't mention any specific product.",
      },
      {
        id: "ai_casual_rec",
        tone: "casual",
        body: `Oh man, I feel this so hard. We went through the exact same evaluation last quarter.\n\nThe short answer? There's no perfect option, but the closest thing we found was something that just got out of the way and let us work. No fancy Gantt charts nobody reads, no AI features that hallucinate your deadlines 😅\n\nWhat's your team size? That changes the answer a lot.`,
        reasoning:
          "Relatable, uses humor, asks a follow-up question to keep the conversation going and learn more about their needs.",
      }
    );
  } else if (isAskingForAdvice) {
    suggestions.push(
      {
        id: "ai_helpful_advice",
        tone: "helpful",
        body: `This is something we struggled with too, so sharing what actually moved the needle for us:\n\n**What didn't work:** Over-engineering the solution early on. We spent weeks building something nobody asked for.\n\n**What worked:** Talking to 20 users in the first week. Sounds basic, but 90% of our roadmap came from those conversations.\n\nThe single biggest insight was that users don't want more features — they want fewer decisions. Simplify ruthlessly.`,
        reasoning:
          "Shares concrete experience with before/after framing. Actionable takeaway at the end.",
      },
      {
        id: "ai_leader_advice",
        tone: "thought_leader",
        body: `Having gone through this a few times now, here's the pattern I keep seeing:\n\nMost teams fail here not because of execution, but because they're solving the wrong problem. Before optimizing the solution, make sure you've validated the problem.\n\nI'd recommend spending 80% of your time on discovery and 20% on building. The ratio feels wrong, but it's the fastest path to something people actually want.`,
        reasoning:
          "Reframes the question to a higher-level insight. Positions as someone who's seen this pattern repeatedly.",
      },
      {
        id: "ai_casual_advice",
        tone: "casual",
        body: `Honestly? The thing that helped us the most was embarrassingly simple — we just started shipping faster and stopped overthinking it.\n\nEvery week we'd ask ourselves "what's the smallest thing we can put in front of users today?" and then we'd do that.\n\nNot glamorous, but it works. The fancy strategy stuff came later, once we had actual data to work with.`,
        reasoning:
          "Down-to-earth, removes pressure. Uses self-deprecating honesty that resonates on Reddit.",
      }
    );
  } else if (isSharingExperience) {
    suggestions.push(
      {
        id: "ai_helpful_exp",
        tone: "helpful",
        body: `Really appreciate you sharing this — it mirrors our experience in a lot of ways.\n\nOne thing I'd add: the switching cost is real but often overestimated. We thought migration would take 2 weeks, it took 3 days. The bigger challenge was getting buy-in from the team, which came down to showing them the before/after workflow.\n\nWhat was the hardest part of the transition for your team?`,
        reasoning:
          "Validates their experience, adds complementary insight, asks engaging follow-up.",
      },
      {
        id: "ai_leader_exp",
        tone: "thought_leader",
        body: `This is a great case study. The pattern you're describing — tool bloat leading to team friction — is something I'm seeing across the industry right now.\n\nThere's an emerging trend of teams "downgrading" to simpler tools and seeing productivity go up. The complexity tax is real and most vendors have zero incentive to simplify.\n\nI think we'll see more companies making this move over the next 12 months.`,
        reasoning:
          "Contextualizes their story within a broader trend. Shows pattern recognition and industry awareness.",
      },
      {
        id: "ai_casual_exp",
        tone: "casual",
        body: `YES. We did the exact same thing and it was the best decision we made all year. The productivity jump was almost instant once people stopped fighting with the tool.\n\nFunny how the "boring" simple tools often win over the ones with 500 features and a 45-minute onboarding video 😂\n\nCurious — how long did the switch take you?`,
        reasoning:
          "High energy agreement, humor, keeps conversation going with a question.",
      }
    );
  } else {
    // Generic fallback
    suggestions.push(
      {
        id: "ai_helpful_gen",
        tone: "helpful",
        body: `Thanks for sharing this — really useful perspective.\n\nFrom what I've seen, the key factors to consider are:\n\n1. How this fits your current workflow\n2. The learning curve for your team\n3. Long-term scalability\n\nWould be happy to share more details about our experience if it would help.`,
        reasoning: "Safe, genuinely helpful response that opens door for deeper conversation.",
      },
      {
        id: "ai_leader_gen",
        tone: "thought_leader",
        body: `Interesting point. I've been thinking about this topic a lot lately, and I think the conventional wisdom is starting to shift.\n\nThe teams I see succeeding right now are the ones who optimize for speed of iteration over feature completeness. Ship fast, learn fast, adjust fast.\n\nWould love to hear if others in ${subreddit} are seeing the same pattern.`,
        reasoning: "Adds a perspective, invites broader discussion, shows community awareness.",
      },
      {
        id: "ai_casual_gen",
        tone: "casual",
        body: `Great point — this resonates with what we've been experiencing too.\n\nHonestly, the simpler the approach, the better the results in our case. Overthinking was the real bottleneck, not the technology.\n\nWhat's been your experience?`,
        reasoning: "Short, genuine, conversational. Low-risk engagement.",
      }
    );
  }

  return suggestions;
}

export function getAiSuggestions(ctx: GenerateContext): AiSuggestion[] {
  return generateForContext(ctx);
}

export function getToneDescription(tone: ReplyTone): string {
  return toneDescriptions[tone];
}

export const toneLabels: Record<ReplyTone, string> = {
  helpful: "Helpful",
  thought_leader: "Thought Leader",
  casual: "Casual",
};

export const toneIcons: Record<ReplyTone, string> = {
  helpful: "💡",
  thought_leader: "🎯",
  casual: "💬",
};
