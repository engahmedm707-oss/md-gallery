import { createBrowserClient } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseSetupMessage,
  supabaseUrl,
} from "@/lib/supabase/config";

export { isSupabaseConfigured, supabaseSetupMessage };

export function createClient() {
  if (!isSupabaseConfigured) throw new Error(supabaseSetupMessage);
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}