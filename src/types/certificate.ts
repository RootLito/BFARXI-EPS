import { Event } from "./event";

export interface Certificate {
  id: string;
  event_id: string;
  file_name: string;
  file_url: string;
  size_bytes?: number;
  created_at?: string;
  updated_at?: string;

  event?: Event;
}

export interface CreateCertificateInput {
  event_id: string;
  file_name: string;
  file_url: string;
  size_bytes?: number;
}