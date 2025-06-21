import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/room";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: "public",
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown, context: string) => {
  console.error(`Supabase error in ${context}:`, error);

  if (error && typeof error === "object" && "code" in error) {
    const errorCode = (error as { code: string }).code;
    switch (errorCode) {
      case "PGRST116":
        return "Data tidak ditemukan";
      case "23505":
        return "Data sudah ada";
      case "23503":
        return "Data terkait tidak ditemukan";
      case "42P01":
        return "Tabel tidak ditemukan";
      default:
        return (
          (error as { message?: string }).message ||
          "Terjadi kesalahan pada database"
        );
    }
  }

  return (
    (error as { message?: string })?.message ||
    "Terjadi kesalahan yang tidak diketahui"
  );
};

// Helper function to validate room code format
export const validateRoomCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

// Helper function to generate unique room code
export const generateUniqueRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
