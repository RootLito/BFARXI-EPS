import { supabase } from "@/lib/supabase"; // adjust path to your supabase client
import {
    Attendance,
    CreateEventInput,
    Event,
    UpdateEventInput,
} from "@/types";

/**
 * Fetch all events with their associated venue and attachments
 */
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      venue:venues (*),
      attachments:event_attachments (*)
    `)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data as Event[];
}

/**
 * Fetch a single event by ID with venue & attachments
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      venue:venues (*),
      attachments:event_attachments (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event by id:", error);
    throw error;
  }

  return data as Event;
}

/**
 * Create a new Venue + Event + Attachments in order
 */
export async function createEvent(input: CreateEventInput): Promise<Event> {
  // 1. Insert Venue
  const { data: venueData, error: venueError } = await supabase
    .from("venues")
    .insert([
      {
        address: input.venue.address,
        latitude: input.venue.latitude,
        longitude: input.venue.longitude,
      },
    ])
    .select()
    .single();

  if (venueError) {
    console.error("Error creating venue:", venueError);
    throw venueError;
  }

  // 2. Generate unique QR Code identifier
  const qrCode = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 3. Insert Event with Foreign Key to Venue
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .insert([
      {
        title: input.title,
        details: input.details,
        start_date: input.start_date,
        end_date: input.end_date,
        timeline_type: input.timeline_type,
        venue_id: venueData.id,
        qr_code: qrCode,
        status: "upcoming",
      },
    ])
    .select()
    .single();

  if (eventError) {
    console.error("Error creating event:", eventError);
    throw eventError;
  }

  // 4. Insert Attachments if provided
  if (input.attachments && input.attachments.length > 0) {
    const attachmentRecords = input.attachments.map((att) => ({
      event_id: eventData.id,
      file_name: att.file_name,
      file_url: att.file_url,
      size_bytes: att.size_bytes,
    }));

    const { error: attachmentError } = await supabase
      .from("event_attachments")
      .insert(attachmentRecords);

    if (attachmentError) {
      console.error("Error adding attachments:", attachmentError);
    }
  }

  return getEventById(eventData.id) as Promise<Event>;
}

/**
 * Update Event and its Venue
 */
export async function updateEvent(input: UpdateEventInput): Promise<Event> {
  // 1. Update Venue if venue info and venue_id exist
  if (input.venue && input.venue_id) {
    const { error: venueError } = await supabase
      .from("venues")
      .update({
        address: input.venue.address,
        latitude: input.venue.latitude,
        longitude: input.venue.longitude,
      })
      .eq("id", input.venue_id);

    if (venueError) {
      console.error("Error updating venue:", venueError);
      throw venueError;
    }
  }

  // 2. Update Event details
  const { error: eventError } = await supabase
    .from("events")
    .update({
      title: input.title,
      details: input.details,
      start_date: input.start_date,
      end_date: input.end_date,
      timeline_type: input.timeline_type,
    })
    .eq("id", input.id);

  if (eventError) {
    console.error("Error updating event:", eventError);
    throw eventError;
  }

  return getEventById(input.id) as Promise<Event>;
}

/**
 * Delete Event (Cascades to venue and attachments based on DB rules)
 */
export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

/**
 * Fetch attendance logs for a specific event
 */
export async function getEventAttendances(eventId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from("attendances")
    .select(`
      *,
      profile:users (*)
    `)
    .eq("event_id", eventId)
    .order("scanned_at", { ascending: false });

  if (error) {
    console.error("Error fetching attendances:", error);
    throw error;
  }

  return data as Attendance[];
}