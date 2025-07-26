import { NextRequest, NextResponse } from "next/server";
import { getLocalCalendarEvents, addLocalCalendarEvent, deleteLocalCalendarEvent } from "@/lib/calendar-data";

export async function GET(req: NextRequest) {
  try {
    const events = await getLocalCalendarEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    // Remove uid if present since we're not using authentication
    const { uid, ...eventWithoutUid } = event;
    await addLocalCalendarEvent(eventWithoutUid);
    const events = await getLocalCalendarEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add event." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await deleteLocalCalendarEvent(id);
    const events = await getLocalCalendarEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
