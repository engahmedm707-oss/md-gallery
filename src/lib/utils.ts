import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEGP(amount: number, locale: "en" | "ar" = "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calcDiscountedPrice(price: number, type: "none" | "percentage" | "fixed", value: number) {
  if (type === "percentage") return Math.max(0, price - (price * value) / 100);
  if (type === "fixed") return Math.max(0, price - value);
  return price;
}

export function getWhatsAppLink(numberIntl: string, message: string) {
  const digits = numberIntl.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function isRTL(locale: string) {
  return locale === "ar";
}
