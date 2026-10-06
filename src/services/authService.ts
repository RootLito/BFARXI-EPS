import { supabase } from "@/lib/supabase";
import { RegisterUserDTO, UserProfile } from "@/types/user";

export const authService = {
  // Check if scanned barcode exists
  async getUserByCode(code: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Register user as client
  async registerClient(payload: RegisterUserDTO): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          ...payload,
          role: "client",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
