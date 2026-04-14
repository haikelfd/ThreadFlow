import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitReply } from "@/lib/reddit-api";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as { accessToken?: string } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { parentFullname, body } = await req.json();

  if (!parentFullname || !body) {
    return NextResponse.json(
      { error: "parentFullname and body required" },
      { status: 400 }
    );
  }

  try {
    const result = await submitReply(session.accessToken, parentFullname, body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Reply error:", err);
    return NextResponse.json(
      { error: "Failed to submit reply" },
      { status: 500 }
    );
  }
}
