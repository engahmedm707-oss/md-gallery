import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseSetupMessage,
  supabaseUrl,
} from "@/lib/supabase/config";

export async function createClient() {
  if (!isSupabaseConfigured) throw new Error(supabaseSetupMessage);
  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll from Server Component can be ignored if middleware refreshes sessions
          }
        },
      },
    }
  );
}
