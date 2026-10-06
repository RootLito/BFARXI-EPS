import { UserProfile } from "./user";

export type AttendanceScanType =
  | "time_in"
  | "break_out" | "break_in" | "time_out";

export interface Attendance {
  id: string;
  event_id: string;
  user_id: string;
  scan_type: AttendanceScanType;
  scanned_at: string;

  profile?: UserProfile;
}