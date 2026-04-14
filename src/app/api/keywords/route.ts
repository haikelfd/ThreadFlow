import { NextRequest, NextResponse } from "next/server";
import {
  getKeywords,
  getMatches,
  addKeyword,
  removeKeyword,
  toggleKeyword,
  markReplied,
} from "@/lib/keyword-store";

export async function GET(req: NextRequest) {
  const keywordId = req.nextUrl.searchParams.get("keywordId");

  return NextResponse.json({
    keywords: getKeywords(),
    matches: getMatches(keywordId ?? undefined),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case "add": {
      const kw = addKeyword({
        keyword: body.keyword,
        subreddits: body.subreddits ?? [],
        isActive: true,
      });
      return NextResponse.json(kw);
    }
    case "remove":
      removeKeyword(body.id);
      return NextResponse.json({ success: true });
    case "toggle":
      toggleKeyword(body.id);
      return NextResponse.json({ success: true });
    case "replied":
      markReplied(body.matchId);
      return NextResponse.json({ success: true });
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
