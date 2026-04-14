import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { vote } from "@/lib/reddit-api";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as { accessToken?: string } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { fullname, direction } = await req.json();

  if (!fullname || direction === undefined) {
    return NextResponse.json(
      { error: "fullname and direction required" },
      { status: 400 }
    );
  }

  try {
    await vote(session.accessToken, fullname, direction);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}
