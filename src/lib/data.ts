import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type Category = { id: string; slug: string; name_en: string; name_ar: string; description_en?: string|null; description_ar?: string|null; is_visible: boolean; sort_order: number };
export type ItemImage = { id: string; item_id: string; storage_path: string; sort_order: number; alt_en?: string|null; alt_ar?: string|null };
export type Item = {
  id: string; category_id: string; slug?: string|null; is_visible: boolean; is_featured: boolean;
  name_en: string; name_ar: string; short_description_en?: string|null; short_description_ar?: string|null;
  description_en?: string|null; description_ar?: string|null;
  material_en?: string|null; material_ar?: string|null; dimensions_en?: string|null; dimensions_ar?: string|null;
  color_en?: string|null; color_ar?: string|null; technique_craft_en?: string|null; technique_craft_ar?: string|null;
  care_instructions_en?: string|null; care_instructions_ar?: string|null; availability_note_en?: string|null; availability_note_ar?: string|null;
  notes_en?: string|null; notes_ar?: string|null;
  price_egp: number; currency: string; discount_type: "none"|"percentage"|"fixed"; discount_value: number;
  item_images?: ItemImage[]; categories?: Category;
};

export async function getPublicCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return demoCategories;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("*").eq("is_visible", true).order("sort_order");
    return (data as Category[]) || demoCategories;
  } catch { return demoCategories; }
}

export async function getPublicItems(opts?: { categorySlug?: string; featured?: boolean }): Promise<Item[]> {
  if (!isSupabaseConfigured) return filterDemo(opts);
  try {
    const supabase = await createClient();
    let q = supabase.from("items").select("*, item_images(*), categories(*)").eq("is_visible", true).order("created_at", { ascending: false });
    if (opts?.featured) q = q.eq("is_featured", true);
    const { data } = await q;
    let items = (data as any as Item[]) || [];
    if (opts?.categorySlug) items = items.filter(i => (i as any).categories?.slug === opts.categorySlug);
    return items.length ? items : filterDemo(opts);
  } catch { return filterDemo(opts); }
}

export async function getItemById(id: string): Promise<Item | null> {
  if (!isSupabaseConfigured || id.startsWith("demo-")) return demoItems.find(i => i.id === id) || null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("items").select("*, item_images(*), categories(*)").eq("id", id).single();
    return (data as any as Item) || demoItems.find(i => i.id === id) || null;
  } catch { return demoItems.find(i => i.id === id) || null; }
}

export async function getSiteSettings() {
  const fallback = {
    whatsapp_number: "01151515676",
    whatsapp_number_intl: "201151515676",
    instagram_url: null,
    facebook_url: null,
  };
  if (!isSupabaseConfigured) return fallback;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    return data || fallback;
  } catch { return fallback; }
}

const demoCategories: Category[] = [
  { id: "c1", slug: "paintings", name_en: "Paintings", name_ar: "لوحات", sort_order: 1, is_visible: true },
  { id: "c2", slug: "tables", name_en: "Tables", name_ar: "طاولات", sort_order: 2, is_visible: true },
  { id: "c3", slug: "crochet", name_en: "Crochet Items", name_ar: "مشغولات كروشيه", sort_order: 3, is_visible: true },
  { id: "c4", slug: "handmade-decor", name_en: "Handmade Decor", name_ar: "ديكور يدوي", sort_order: 4, is_visible: true },
];

const demoItems: Item[] = [
  { id: "demo-1", category_id: "c1", is_visible: true, is_featured: true, name_en: "Sunset Canvas", name_ar: "لوحة الغروب", short_description_en: "Warm abstract sunset tones", short_description_ar: "ألوان غروب دافئة وتجريدية", description_en: "A hand-painted canvas bringing warmth to your space.", description_ar: "لوحة مرسومة يدويًا تضيف دفئًا لمساحتك.", material_en: "Acrylic on canvas", material_ar: "أكريليك على قماش", dimensions_en: "60x80 cm", dimensions_ar: "60×80 سم", color_en: "Orange, gold, burgundy", color_ar: "برتقالي، ذهبي، عنابي", technique_craft_en: "Hand-painted", technique_craft_ar: "رسم يدوي", care_instructions_en: "Dust gently", care_instructions_ar: "تنظيف بالغبار بلطف", availability_note_en: "Available", availability_note_ar: "متوفر", notes_en: "Frame optional", notes_ar: "الإطار اختياري", price_egp: 2500, currency: "EGP", discount_type: "percentage", discount_value: 10, item_images: [{ id:"d1i", item_id:"demo-1", storage_path:"/demo/painting.svg", sort_order:0 }], categories: demoCategories[0] },
  { id: "demo-2", category_id: "c2", is_visible: true, is_featured: true, name_en: "Oak Side Table", name_ar: "طاولة جانبية من البلوط", short_description_en: "Minimal handmade side table", short_description_ar: "طاولة جانبية يدوية بسيطة", description_en: "Solid craftsmanship for modern interiors.", description_ar: "حرفة متينة لتصاميم عصرية.", material_en: "Oak wood", material_ar: "خشب بلوط", dimensions_en: "45x45x50 cm", dimensions_ar: "45×45×50 سم", color_en: "Natural oak", color_ar: "بلوط طبيعي", technique_craft_en: "Woodworking", technique_craft_ar: "نجارة", care_instructions_en: "Wipe with dry cloth", care_instructions_ar: "امسح بقطعة قماش جافة", availability_note_en: "Made to order", availability_note_ar: "يصنع حسب الطلب", notes_en: "", notes_ar: "", price_egp: 4200, currency: "EGP", discount_type: "none", discount_value: 0, item_images: [{ id:"d2i", item_id:"demo-2", storage_path:"/demo/table.svg", sort_order:0 }], categories: demoCategories[1] },
  { id: "demo-3", category_id: "c3", is_visible: true, is_featured: false, name_en: "Crochet Throw", name_ar: "بطانية كروشيه", short_description_en: "Cozy handmade throw", short_description_ar: "بطانية يدوية دافئة", description_en: "Soft texture and detailed stitch work, finished by hand in a warm cream palette.", description_ar: "ملمس ناعم وغرز دقيقة، منجزة يدويًا بدرجات كريمية دافئة.", material_en: "Cotton yarn", material_ar: "خيط قطن", dimensions_en: "120x150 cm", dimensions_ar: "120×150 سم", color_en: "Cream, burgundy, brass", color_ar: "كريمي، عنابي، نحاسي", technique_craft_en: "Crochet", technique_craft_ar: "كروشيه", care_instructions_en: "Hand wash cold, dry flat", care_instructions_ar: "غسيل يدوي بماء بارد وتجفيف مسطح", availability_note_en: "Available", availability_note_ar: "متوفر", notes_en: "Made to order in other sizes", notes_ar: "يصنع حسب الطلب بمقاسات أخرى", price_egp: 1800, currency: "EGP", discount_type: "fixed", discount_value: 200, item_images: [{ id:"d3i", item_id:"demo-3", storage_path:"/demo/crochet.svg", sort_order:0 }], categories: demoCategories[2] },
  { id: "demo-4", category_id: "c1", is_visible: true, is_featured: false, name_en: "Blue Hour Canvas", name_ar: "لوحة الساعة الزرقاء", short_description_en: "Deep navy and brass abstract", short_description_ar: "تجريد بالكحلي والنحاسي", description_en: "A composed abstract in deep navy, warm brass and burgundy — an anchor for calm interiors.", description_ar: "تجريد متوازن بدرجات الكحلي والنحاسي والعنابي — نقطة هدوء للمساحات المعاصرة.", material_en: "Acrylic and gold leaf on canvas", material_ar: "أكريليك وورق ذهب على قماش", dimensions_en: "70x90 cm", dimensions_ar: "70×90 سم", color_en: "Navy, brass, burgundy", color_ar: "كحلي، نحاسي، عنابي", technique_craft_en: "Hand-painted", technique_craft_ar: "رسم يدوي", care_instructions_en: "Dust gently with a soft brush", care_instructions_ar: "إزالة الغبار بفرشاة ناعمة", availability_note_en: "One of a kind", availability_note_ar: "قطعة فريدة", notes_en: "Frame optional", notes_ar: "الإطار اختياري", price_egp: 3200, currency: "EGP", discount_type: "none", discount_value: 0, item_images: [{ id:"d4i", item_id:"demo-4", storage_path:"/demo/painting-2.svg", sort_order:0 }], categories: demoCategories[0] },
  { id: "demo-5", category_id: "c4", is_visible: true, is_featured: true, name_en: "Ceramic Olive Vase", name_ar: "مزهرية خزفية", short_description_en: "Hand-thrown stoneware vase", short_description_ar: "مزهرية خزفية مصنوعة يدويًا", description_en: "A hand-thrown stoneware vase in warm ivory and burgundy, finished with a brass line.", description_ar: "مزهرية خزفية مصنوعة يدويًا بدرجات العاجي والعنابي، مع لمسة نحاسية.", material_en: "Glazed stoneware", material_ar: "خزف مزجج", dimensions_en: "18 x 36 cm", dimensions_ar: "18×36 سم", color_en: "Ivory, burgundy, brass", color_ar: "عاجي، عنابي، نحاسي", technique_craft_en: "Wheel-thrown ceramics", technique_craft_ar: "خزف على الدولاب", care_instructions_en: "Wipe with a damp cloth", care_instructions_ar: "مسح بقطعة قماش رطبة", availability_note_en: "Available", availability_note_ar: "متوفر", notes_en: "Each piece varies slightly", notes_ar: "تختلف كل قطعة قليلًا", price_egp: 950, currency: "EGP", discount_type: "none", discount_value: 0, item_images: [{ id:"d5i", item_id:"demo-5", storage_path:"/demo/decor.svg", sort_order:0 }], categories: demoCategories[3] },
];

function filterDemo(opts?: { categorySlug?: string; featured?: boolean }) {
  let items = [...demoItems];
  if (opts?.featured) items = items.filter(i => i.is_featured);
  if (opts?.categorySlug) items = items.filter(i => (i as any).categories?.slug === opts.categorySlug);
  return items;
}
