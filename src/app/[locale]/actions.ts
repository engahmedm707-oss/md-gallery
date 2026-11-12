"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { imageExtension } from "@/lib/uploads";
import { isUuid } from "@/lib/utils";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Login required");
  return { supabase, user };
}

export async function submitReview(formData: FormData) {
  const { supabase, user } = await requireUser();
  const type = String(formData.get("type") || "platform") as "platform" | "product";
  const item_id = (formData.get("item_id") as string) || null;
  const rating = Number(formData.get("rating") || 5);
  const body = String(formData.get("body") || "").trim();
  if (!body) throw new Error("Comment is required");
  if (type === "product" && (!item_id || !isUuid(item_id))) {
    throw new Error("Please choose a product for a product review.");
  }
  const { error } = await supabase.from("reviews").insert({ type, item_id: type === "product" ? item_id : null, user_id: user.id, rating, body, status: "pending" });
  if (error) throw new Error(error.message);
  revalidatePath("/en/reviews"); revalidatePath("/ar/reviews");
}

export async function submitReply(formData: FormData) {
  const { supabase, user } = await requireUser();
  const review_id = String(formData.get("review_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!review_id || !body) throw new Error("Missing fields");
  const { error } = await supabase.from("review_replies").insert({ review_id, user_id: user.id, body, status: "pending" });
  if (error) throw new Error(error.message);
  revalidatePath("/en/reviews"); revalidatePath("/ar/reviews");
}

export async function submitEligibilityRequest(formData: FormData) {
  const { supabase, user } = await requireUser();
  const item_id = String(formData.get("item_id") || "");
  const purchase_reference = String(formData.get("purchase_reference") || "").trim();
  const proof_note = String(formData.get("proof_note") || "").trim() || null;
  if (!item_id || !purchase_reference) throw new Error("Item and purchase reference are required");
  if (!isUuid(item_id)) throw new Error("This piece is not available for eligibility requests. Please refresh the page and choose a catalogue piece.");
  const { error } = await supabase.from("purchase_eligibility_requests").insert({ user_id: user.id, item_id, purchase_reference, proof_note, status: "pending" });
  if (error) throw new Error(error.message);
  revalidatePath("/en/wall"); revalidatePath("/ar/wall");
}

export async function submitWallPost(formData: FormData) {
  const { supabase, user } = await requireUser();
  const item_id = String(formData.get("item_id") || "");
  const caption = String(formData.get("caption") || "").trim() || null;
  const file = formData.get("image") as File | null;
  if (!item_id || !file || file.size === 0) throw new Error("Item and image are required");
  if (!isUuid(item_id)) throw new Error("This piece is not available for wall posts. Please refresh the page and choose a catalogue piece.");

  const { data: eligible } = await supabase
    .from("purchase_eligibility")
    .select("item_id")
    .eq("user_id", user.id)
    .eq("item_id", item_id)
    .maybeSingle();
  if (!eligible) {
    throw new Error("This item needs an approved purchase request before you can post to the wall.");
  }

  const ext = imageExtension(file);
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  // Insert first: RLS verifies the approved purchase eligibility. Only then
  // upload the file, using the service role so storage policy gaps don't
  // break the flow. Remove the row if the upload fails.
  const { data: post, error } = await supabase
    .from("wall_posts")
    .insert({ user_id: user.id, item_id, image_path: path, caption, status: "pending" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage
    .from("wall-images")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) {
    await admin.from("wall_posts").delete().eq("id", post.id);
    throw new Error(upErr.message);
  }

  revalidatePath("/en/wall"); revalidatePath("/ar/wall");
}
