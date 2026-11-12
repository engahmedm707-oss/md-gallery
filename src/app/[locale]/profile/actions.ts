"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signOut(formData: FormData) {
  const locale = formData.get("locale") === "ar" ? "ar" : "en";
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}`);
}