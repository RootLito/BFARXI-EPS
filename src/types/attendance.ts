import { Event } from "./event";
import { UserProfile } from "./user";

export type AttendanceScanType =
  | "time_in"
  | "break_out"
  | "break_in"
  | "time_out";

export interface Attendance {
  id: string;
  event_id: string;
  user_id: string;
  scan_type: AttendanceScanType;
  scanned_at: string;

  profile?: UserProfile;
  event?: Event;
}

export interface AttendanceSummaryRow {
  key: string;
  user_id: string;
  event_id: string;
  event_title: string;
  fullname: string;
  scanned_date: string;
  time_in?: string;
  break_out?: string;
  break_in?: string;
  time_out?: string;
}