"use client";

import Image from "next/image";
import { useState } from "react";
import type { ItemImage } from "@/lib/data";

export function ItemGallery({
  images,
  name,
  badge,
}: {
  images: ItemImage[];
  name: string;
  badge?: string | null;
}) {
  const [active, setActive] = useState(0);
  const list = images.slice().sort((a, b) => a.sort_order - b.sort_order);
  const current = list[active];

  function resolve(path: string) {
    return path.startsWith("http") || path.startsWith("/")
      ? path
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${path}`;
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-sand">
        {current ? (
          <Image
            src={resolve(current.storage_path)}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="ornament absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl tracking-tight text-ink/25">
              <span className="text-burgundy">M</span>
              <span className="text-ink-soft">D</span>
            </span>
          </div>
        )}

        {badge && (
          <span className="absolute start-4 top-4 bg-burgundy px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            {badge}
          </span>
        )}

        {list.length > 1 && (
          <span className="absolute bottom-4 end-4 border border-brass/60 bg-ink/55 px-2.5 py-1 text-[9px] font-medium tracking-[0.16em] text-cream backdrop-blur">
            {String(active + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
          </span>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden border bg-sand transition-colors ${
                index === active ? "border-brass" : "border-line-soft hover:border-brass/60"
              }`}
            >
              <Image
                src={resolve(image.storage_path)}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}