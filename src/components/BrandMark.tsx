import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "md",
  tone = "dark",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
}) {
  const boxes = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-14 w-14",
  };
  const letters = {
    sm: "text-[17px]",
    md: "text-[23px]",
    lg: "text-[30px]",
  };
  const title = {
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-[13px]",
  };
  const subtitle = {
    sm: "text-[6.5px]",
    md: "text-[7px]",
    lg: "text-[8px]",
  };
  const light = tone === "light";

  return (
    <span className={cn("inline-flex items-center gap-3", className)} aria-label="MD Gallery">
      <span
        className={cn(
          "relative grid shrink-0 place-items-center border",
          light ? "border-brass/60" : "border-brass/50",
          boxes[size],
        )}
      >
        <span className={cn("font-display leading-none tracking-tight", letters[size])}>
          <span className={light ? "text-[#c9848d]" : "text-burgundy"}>M</span>
          <span className={light ? "text-cream" : "text-ink-soft"}>D</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute -end-0.5 -top-0.5 h-1 w-1",
            light ? "bg-brass" : "bg-brass",
          )}
        />
      </span>
      <span className="flex flex-col justify-center gap-1">
        <span
          className={cn(
            "font-semibold uppercase leading-none tracking-[0.28em]",
            title[size],
            light ? "text-cream" : "text-ink",
          )}
        >
          Gallery
        </span>
        <span
          className={cn(
            "uppercase leading-none tracking-[0.22em]",
            subtitle[size],
            light ? "text-cream/45" : "text-muted/80",
          )}
        >
          Art &amp; Objects
        </span>
      </span>
    </span>
  );
}