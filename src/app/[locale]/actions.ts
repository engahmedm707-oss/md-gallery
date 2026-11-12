"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("wall-images").upload(path, file, { upsert: false });
  if (upErr) throw new Error(upErr.message);
  const { error } = await supabase.from("wall_posts").insert({ user_id: user.id, item_id, image_path: path, caption, status: "pending" });
  if (error) throw new Error(error.message);
  revalidatePath("/en/wall"); revalidatePath("/ar/wall");
}
