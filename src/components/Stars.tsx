import { cn } from "@/lib/utils";

export function Stars({
  value,
  className,
  size = "md",
}: {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-[11px]", md: "text-[14px]", lg: "text-[18px]" };
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 tracking-[0.12em]", sizes[size], className)}
      role="img"
      aria-label={`${rounded} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? "text-brass" : "text-line"} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}