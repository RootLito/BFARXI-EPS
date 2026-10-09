import { supabase } from "@/lib/supabase";
import { getEvents } from "@/services/eventService";
import { Event } from "@/types";

export interface HighlightedDateMap {
  [dateString: string]: Event[];
}

/**
 * Fetch all events formatted and grouped by YYYY-MM-DD
 */
export async function getCalendarEvents(): Promise<{
  rawEvents: Event[];
  eventDatesMap: HighlightedDateMap;
  highlightedDates: string[];
}> {
  const events = await getEvents();

  const eventDatesMap: HighlightedDateMap = {};

  events.forEach((event) => {
    if (!event.start_date) return;

    // Extracts YYYY-MM-DD from ISO string
    const dateKey = event.start_date.split("T")[0];

    if (!eventDatesMap[dateKey]) {
      eventDatesMap[dateKey] = [];
    }
    eventDatesMap[dateKey].push(event);
  });

  return {
    rawEvents: events,
    eventDatesMap,
    highlightedDates: Object.keys(eventDatesMap),
  };
}

/**
 * Fetch events specifically for a single selected date (YYYY-MM-DD)
 */
export async function getEventsByDate(dateString: string): Promise<Event[]> {
  const startOfDay = `${dateString}T00:00:00.000Z`;
  const endOfDay = `${dateString}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      venue:venues (*),
      attachments:event_attachments (*)
    `)
    .gte("start_date", startOfDay)
    .lte("start_date", endOfDay)
    .order("start_date", { ascending: true });

  if (error) {
    console.error(`Error fetching events for date ${dateString}:`, error);
    throw error;
  }

  return data as Event[];
}

/**
 * Utility to check if a specific date (YYYY-MM-DD) has scheduled events
 */
export function hasEventOnDate(
  dateString: string,
  eventsMap: HighlightedDateMap
): boolean {
  return Boolean(eventsMap[dateString] && eventsMap[dateString].length > 0);
}