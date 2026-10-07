export interface Venue {
  id?: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
}

export type CreateVenueInput = Omit<Venue, "id" | "created_at">;