import { LocalCalendarEvent } from "./local-data";
import { promises as fs } from "fs";
import { join } from "path";

const CALENDAR_DATA_FILE = join(process.cwd(), "calendar-events.json");

// Load calendar events from file
export async function loadCalendarEvents(): Promise<LocalCalendarEvent[]> {
  try {
    const data = await fs.readFile(CALENDAR_DATA_FILE, "utf8");
    const events = JSON.parse(data);
    // Convert date strings back to Date objects
    return events.map((event: any) => ({
      ...event,
      date: new Date(event.date)
    }));
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Save calendar events to file
export async function saveCalendarEvents(events: LocalCalendarEvent[]): Promise<void> {
  // Convert Date objects to strings for JSON serialization
  const eventsToSave = events.map(event => ({
    ...event,
    date: event.date.toISOString()
  }));
  await fs.writeFile(CALENDAR_DATA_FILE, JSON.stringify(eventsToSave, null, 2));
}

// Calendar event functions
let calendarEventsCache: LocalCalendarEvent[] | null = null;

export const getLocalCalendarEvents = async (): Promise<LocalCalendarEvent[]> => {
  if (!calendarEventsCache) {
    calendarEventsCache = await loadCalendarEvents();
  }
  return calendarEventsCache;
};

export const addLocalCalendarEvent = async (event: Omit<LocalCalendarEvent, 'id'>): Promise<LocalCalendarEvent[]> => {
  if (!calendarEventsCache) {
    calendarEventsCache = await loadCalendarEvents();
  }
  
  const newEvent: LocalCalendarEvent = {
    ...event,
    id: Math.random().toString(36).substring(2, 9)
  };
  
  calendarEventsCache = [...calendarEventsCache, newEvent];
  await saveCalendarEvents(calendarEventsCache);
  return calendarEventsCache;
};

export const deleteLocalCalendarEvent = async (id: string): Promise<LocalCalendarEvent[]> => {
  if (!calendarEventsCache) {
    calendarEventsCache = await loadCalendarEvents();
  }
  
  calendarEventsCache = calendarEventsCache.filter(event => event.id !== id);
  await saveCalendarEvents(calendarEventsCache);
  return calendarEventsCache;
};

// Initialize with empty file if it doesn't exist
(async () => {
  try {
    await loadCalendarEvents();
  } catch {
    await saveCalendarEvents([]);
  }
})();
