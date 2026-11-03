"use client";

import { useState } from "react";

export default function Gallery({ images, title, tint }: { images: { url: string; alt: string }[]; title: string; tint: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {images.map((img, n) => (
            <button key={img.url} onClick={() => setI(n)} aria-label={`Show image ${n + 1}`}
              className={`size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${n === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
              style={{ background: tint }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-[2rem]" style={{ background: tint }}>
        <div className="absolute inset-x-16 bottom-10 h-8 rounded-[50%] bg-black/10 blur-lg" />
        {cur && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={cur.url} src={cur.url} alt={cur.alt || title} className="relative h-full w-full object-contain p-10 sm:p-14" />
        )}
      </div>
    </div>
  );
}
