"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

async function ensureAdmin() { await requireAdmin(); }

export async function upsertCategory(formData: FormData) {
  await ensureAdmin();
  const supabase = await createClient();
  const id = (formData.get("id") as string) || undefined;
  const payload = {
    slug: String(formData.get("slug") || "").trim(),
    name_en: String(formData.get("name_en") || "").trim(),
    name_ar: String(formData.get("name_ar") || "").trim(),
    description_en: String(formData.get("description_en") || "").trim() || null,
    description_ar: String(formData.get("description_ar") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_visible: formData.get("is_visible") === "on",
  };
  if (!payload.slug || !payload.name_en || !payload.name_ar) throw new Error("Missing required fields");
  const q = id ? supabase.from("categories").update(payload).eq("id", id) : supabase.from("categories").insert(payload);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/en");
  revalidatePath("/ar");
}

export async function deleteCategory(id: string) {
  await ensureAdmin();
  const supabase = await createClient();
  const { count } = await supabase.from("items").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count || 0) > 0) {
    throw new Error("Category has items. Reassign or delete items first (deletion blocked).");
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/en");
  revalidatePath("/ar");
}

export async function deleteItem(id: string) {
  await ensureAdmin();
  const supabase = await createClient();
  // fetch images to remove from storage
  const { data: images } = await supabase.from("item_images").select("storage_path").eq("item_id", id);
  const paths = (images || []).map((i: any) => i.storage_path).filter((p: string) => p && !p.startsWith("http"));
  if (paths.length) {
    await supabase.storage.from("item-images").remove(paths);
  }
  await supabase.from("item_images").delete().eq("item_id", id);
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/items");
  revalidatePath("/en");
  revalidatePath("/ar");
}

export async function upsertItem(formData: FormData) {
  await ensureAdmin();
  const supabase = await createClient();
  const id = (formData.get("id") as string) || undefined;
  const payload: any = {
    category_id: String(formData.get("category_id") || ""),
    sku: String(formData.get("sku") || "") || null,
    slug: String(formData.get("slug") || "") || null,
    is_visible: formData.get("is_visible") === "on",
    is_featured: formData.get("is_featured") === "on",
    name_en: String(formData.get("name_en") || ""),
    name_ar: String(formData.get("name_ar") || ""),
    short_description_en: String(formData.get("short_description_en") || "") || null,
    short_description_ar: String(formData.get("short_description_ar") || "") || null,
    description_en: String(formData.get("description_en") || "") || null,
    description_ar: String(formData.get("description_ar") || "") || null,
    material_en: String(formData.get("material_en") || "") || null,
    material_ar: String(formData.get("material_ar") || "") || null,
    dimensions_en: String(formData.get("dimensions_en") || "") || null,
    dimensions_ar: String(formData.get("dimensions_ar") || "") || null,
    color_en: String(formData.get("color_en") || "") || null,
    color_ar: String(formData.get("color_ar") || "") || null,
    technique_craft_en: String(formData.get("technique_craft_en") || "") || null,
    technique_craft_ar: String(formData.get("technique_craft_ar") || "") || null,
    care_instructions_en: String(formData.get("care_instructions_en") || "") || null,
    care_instructions_ar: String(formData.get("care_instructions_ar") || "") || null,
    availability_note_en: String(formData.get("availability_note_en") || "") || null,
    availability_note_ar: String(formData.get("availability_note_ar") || "") || null,
    notes_en: String(formData.get("notes_en") || "") || null,
    notes_ar: String(formData.get("notes_ar") || "") || null,
    price_egp: Number(formData.get("price_egp") || 0),
    currency: "EGP",
    discount_type: String(formData.get("discount_type") || "none"),
    discount_value: Number(formData.get("discount_value") || 0),
  };
  if (!payload.category_id || !payload.name_en || !payload.name_ar) throw new Error("Category and bilingual names are required");
  let itemId = id;
  if (id) {
    const { error } = await supabase.from("items").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase.from("items").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    itemId = data.id;
  }

  // Image uploads (one or more)
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${itemId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("item-images").upload(path, file, { upsert: false });
    if (upErr) throw new Error(upErr.message);
    await supabase.from("item_images").insert({ item_id: itemId, storage_path: path, sort_order: i });
  }

  revalidatePath("/admin/items");
  revalidatePath("/en"); revalidatePath("/ar");
  return itemId;
}

export async function setRoleByEmail(email: string, role: "admin" | "customer") {
  await ensureAdmin();
  const admin = createAdminClient();
  // find user by email via admin API
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw new Error(listErr.message);
  const user = list.users.find(u => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("User not found. They must sign up first (or be created) before role assignment.");
  // prevent removing last admin when demoting
  if (role === "customer") {
    const supabase = await createClient();
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (prof?.role === "admin" && (count || 0) <= 1) throw new Error("Cannot remove the last admin.");
  }
  const { error } = await admin.from("profiles").upsert({ id: user.id, email: user.email, role }, { onConflict: "id" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/admins");
}

export async function moderate(table: "reviews" | "review_replies" | "wall_posts", id: string, status: "approved" | "rejected") {
  await ensureAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/wall");
  revalidatePath("/en"); revalidatePath("/ar");
}

export async function handleEligibilityRequest(requestId: string, decision: "approved" | "rejected", adminId: string) {
  await ensureAdmin();
  const supabase = await createClient();
  const { data: req, error: rerr } = await supabase.from("purchase_eligibility_requests").select("*").eq("id", requestId).single();
  if (rerr || !req) throw new Error(rerr?.message || "Request not found");
  await supabase.from("purchase_eligibility_requests").update({ status: decision, reviewed_by: adminId, reviewed_at: new Date().toISOString() }).eq("id", requestId);
  if (decision === "approved") {
    await supabase.from("purchase_eligibility").upsert({ user_id: req.user_id, item_id: req.item_id, granted_by: adminId, source_request_id: requestId }, { onConflict: "user_id,item_id" });
  }
  revalidatePath("/admin/eligibility");
}

export async function updateSettings(formData: FormData) {
  await ensureAdmin();
  const supabase = await createClient();
  const payload = {
    whatsapp_number: String(formData.get("whatsapp_number") || "01151515676"),
    whatsapp_number_intl: String(formData.get("whatsapp_number_intl") || "201151515676"),
    instagram_url: String(formData.get("instagram_url") || "") || null,
    facebook_url: String(formData.get("facebook_url") || "") || null,
  };
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...payload });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/en"); revalidatePath("/ar");
}
