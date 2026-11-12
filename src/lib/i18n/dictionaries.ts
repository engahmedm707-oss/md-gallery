import type { Locale } from "./config";

const en = {
  brand: "MD Gallery",
  nav: { home: "Home", categories: "Categories", gallery: "Gallery", wall: "Wall", reviews: "Reviews", about: "About", contact: "Contact", admin: "Admin", login: "Login", logout: "Logout", account: "Account", profile: "Profile" },
  hero: { title: "Artistry for Every Space", subtitle: "Discover curated paintings, tables, crochet pieces, and handmade decor. Crafted with care, displayed for you.", cta: "Explore Gallery", whatsapp: "Inquire on WhatsApp" },
  sections: { featured: "Featured Pieces", categories: "Categories", about: "About MD Gallery", aboutText: "MD Gallery showcases handcrafted and curated pieces — from paintings and tables to crochet and decor. Every item tells a story.", wall: "Customer Wall", wallText: "Photos from customers who purchased and loved our pieces.", platformReviews: "Platform Reviews", how: "How to inquire", howText: "Browse the gallery and tap 'Inquire on WhatsApp' on any item. We'll help you with details and availability." },
  item: { price: "Price", details: "Details", material: "Material", dimensions: "Dimensions", color: "Color", technique: "Technique/Craft", care: "Care", availability: "Availability", notes: "Notes", inquire: "Inquire on WhatsApp", discount: "Discount", reviews: "Product Reviews" },
  auth: { login: "Login", signup: "Sign up", email: "Email", password: "Password", displayName: "Display name", needAccount: "Need an account?", haveAccount: "Have an account?", submit: "Submit" },
  review: { leave: "Leave a review", rating: "Rating", comment: "Comment", reply: "Reply", pending: "Submitted for admin approval", loginRequired: "Please log in to post a review or reply." },
  wall: { upload: "Upload to Wall", requestEligibility: "Request wall posting access", purchaseRef: "Purchase details/reference", caption: "Caption", submit: "Submit", pending: "Submitted for admin approval", eligibilityNeeded: "Submit purchase details for admin approval to post a photo of your purchased item." },
  admin: { dashboard: "Admin Dashboard", items: "Items", categories: "Categories", admins: "Admins", moderation: "Moderation", eligibility: "Purchase Eligibility", wall: "Wall Posts", settings: "Settings", add: "Add", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", confirmDelete: "Are you sure? This action is permanent and cannot be undone.", approve: "Approve", reject: "Reject", grant: "Grant eligibility", noData: "No data yet." },
  common: { language: "Language", loading: "Loading...", error: "Something went wrong", search: "Search", all: "All", back: "Back" },
};

const ar: typeof en = {
  brand: "معرض MD",
  nav: { home: "الرئيسية", categories: "الفئات", gallery: "المعرض", wall: "حائط العملاء", reviews: "التقييمات", about: "من نحن", contact: "تواصل", admin: "الإدارة", login: "تسجيل الدخول", logout: "تسجيل الخروج", account: "الحساب", profile: "الملف الشخصي" },
  hero: { title: "فن يليق بكل مساحة", subtitle: "اكتشف لوحات وطاولات ومشغولات كروشيه وديكورات يدوية مختارة بعناية.", cta: "استكشف المعرض", whatsapp: "استفسر عبر واتساب" },
  sections: { featured: "قطع مميزة", categories: "الفئات", about: "عن معرض MD", aboutText: "يعرض معرض MD قطعًا يدوية ومختارة بعناية — من اللوحات والطاولات إلى الكروشيه والديكور. لكل قطعة قصة.", wall: "حائط العملاء", wallText: "صور من عملاء اشتروا قطعنا وأحبوها.", platformReviews: "تقييمات المنصة", how: "كيفية الاستفسار", howText: "تصفح المعرض واضغط على «استفسر عبر واتساب» لأي قطعة، وسنساعدك بالتفاصيل والتوفر." },
  item: { price: "السعر", details: "التفاصيل", material: "الخامة", dimensions: "الأبعاد", color: "اللون", technique: "التقنية/الحرفة", care: "العناية", availability: "التوفر", notes: "ملاحظات", inquire: "استفسر عبر واتساب", discount: "خصم", reviews: "تقييمات المنتج" },
  auth: { login: "تسجيل الدخول", signup: "إنشاء حساب", email: "البريد الإلكتروني", password: "كلمة المرور", displayName: "الاسم", needAccount: "ليس لديك حساب؟", haveAccount: "لديك حساب؟", submit: "إرسال" },
  review: { leave: "أضف تقييماً", rating: "التقييم", comment: "التعليق", reply: "رد", pending: "تم الإرسال بانتظار موافقة الإدارة", loginRequired: "يرجى تسجيل الدخول لإضافة تقييم أو رد." },
  wall: { upload: "ارفع صورة للحائط", requestEligibility: "اطلب صلاحية النشر على الحائط", purchaseRef: "تفاصيل/مرجع الشراء", caption: "وصف الصورة", submit: "إرسال", pending: "تم الإرسال بانتظار موافقة الإدارة", eligibilityNeeded: "أرسل تفاصيل الشراء للحصول على موافقة الإدارة لنشر صورة لقطعتك." },
  admin: { dashboard: "لوحة الإدارة", items: "المنتجات", categories: "الفئات", admins: "المسؤولون", moderation: "المراجعة", eligibility: "أهلية الشراء", wall: "منشورات الحائط", settings: "الإعدادات", add: "إضافة", edit: "تعديل", delete: "حذف", save: "حفظ", cancel: "إلغاء", confirmDelete: "هل أنت متأكد؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.", approve: "موافقة", reject: "رفض", grant: "منح الأهلية", noData: "لا توجد بيانات بعد." },
  common: { language: "اللغة", loading: "جارٍ التحميل...", error: "حدث خطأ ما", search: "بحث", all: "الكل", back: "رجوع" },
};

export const dictionaries = { en, ar } as const;
export type Dictionary = typeof en;
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
