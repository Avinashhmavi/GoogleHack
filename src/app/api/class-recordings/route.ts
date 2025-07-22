import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { recordingsDb } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const recordings = await recordingsDb.getRecordings(user.uid);
  return NextResponse.json({ recordings });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const recording = await req.json();
  await recordingsDb.addRecording(user.uid, recording);
  const recordings = await recordingsDb.getRecordings(user.uid);
  return NextResponse.json({ recordings });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const { id } = await req.json();
  await recordingsDb.deleteRecording(user.uid, id);
  const recordings = await recordingsDb.getRecordings(user.uid);
  return NextResponse.json({ recordings });
} 