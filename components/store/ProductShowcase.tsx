"use client";

import { useState } from "react";

/** Product hero image: large floating pack on a soft halo, with thumbnails to switch images. */
export default function ProductShowcase({ images, title, tint }: { images: { url: string; alt: string }[]; title: string; tint: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div className="flex flex-col items-center">
      <div className="relative grid aspect-square w-full max-w-xl place-items-center">
        <div className="absolute inset-[8%] rounded-full" style={{ background: `radial-gradient(circle at 50% 45%, #fff 0%, ${tint} 55%, transparent 72%)` }} />
        <div className="absolute inset-[14%] animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-forest/15" />
        <div className="absolute bottom-[9%] h-8 w-1/2 rounded-[50%] bg-black/15 blur-xl" />
        {cur && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={cur.url} src={cur.url} alt={cur.alt || title}
            className="float-slow relative max-h-[82%] max-w-[78%] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] animate-[fade-in_0.6s_ease]" />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-3">
          {images.map((img, n) => (
            <button key={img.url} onClick={() => setI(n)} aria-label={`Show image ${n + 1}`}
              className={`size-16 cursor-pointer overflow-hidden rounded-2xl border-2 bg-white/80 p-1 transition ${n === i ? "border-forest shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
