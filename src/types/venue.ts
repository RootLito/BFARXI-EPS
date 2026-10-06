export interface Venue {
  id?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export type CreateVenueInput = Omit<Venue, "id" | "created_at">;