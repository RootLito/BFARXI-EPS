import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user";

export interface UpdateProfilePayload {
  fullname: string;
  position: string;
  office: string;
}

export async function updateUserProfile(
  user: UserProfile | null,
  payload: UpdateProfilePayload,
): Promise<UserProfile | null> {
  let query = supabase.from("users").update(payload);

  if (user?.id) {
    query = query.eq("id", user.id);
  } else {
    query = query.eq("code", user?.code);
  }

  const { data, error } = await query.select();

  if (error) throw error;

  if (data && data.length > 0) {
    return data[0] as UserProfile;
  }

  if (user) {
    return { ...user, ...payload } as UserProfile;
  }

  return null;
}
