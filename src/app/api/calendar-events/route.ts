import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { calendarDb } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const events = await calendarDb.getEvents(user.uid);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const event = await req.json();
  await calendarDb.addEvent(user.uid, event);
  const events = await calendarDb.getEvents(user.uid);
  return NextResponse.json({ events });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const { id } = await req.json();
  await calendarDb.deleteEvent(user.uid, id);
  const events = await calendarDb.getEvents(user.uid);
  return NextResponse.json({ events });
} 