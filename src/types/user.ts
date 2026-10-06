export type UserRole = "admin" | "client";

export interface UserProfile {
  id: string;
  code: string;
  fullname: string;
  position: string;
  office: string;
  role: UserRole;
  created_at?: string;
  avatar_url?: string | null;
}

export interface RegisterUserDTO {
  code: string;
  fullname: string;
  position: string;
  office: string;
  avatar_url?: string;
}
