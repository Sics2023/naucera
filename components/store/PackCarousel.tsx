"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselPack = { title: string; slug: string; image: string };

/**
 * 3D circular carousel: the centre pack is large and in focus, three packs on each side shrink and
 * turn away along an arc. Rotates automatically (pauses on hover/focus); click a pack or use the arrows.
 */
export default function PackCarousel({ packs, interval = 2600 }: { packs: CarouselPack[]; interval?: number }) {
  const n = packs.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = useCallback((step: number) => setActive((a) => (a + step + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), interval);
    return () => clearInterval(t);
  }, [paused, n, interval, go]);

  if (!n) return null;
  const cur = packs[active];

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="relative mx-auto h-[19rem] [--gap:118px] sm:h-[26rem] sm:[--gap:min(19vw,230px)]" style={{ perspective: "1400px" }} aria-roledescription="carousel" aria-label="Naucera premix packs">
        {/* floor glow under the centre pack */}
        <div className="absolute bottom-2 left-1/2 h-10 w-64 -translate-x-1/2 rounded-[50%] bg-forest/20 blur-2xl" />
        {packs.map((p, i) => {
          // Signed distance from the centre, wrapped so the ring is continuous.
          let off = (i - active + n) % n;
          if (off > n / 2) off -= n;
          const abs = Math.abs(off);
          const visible = abs <= 3;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => (off === 0 ? undefined : go(off))}
              aria-label={off === 0 ? p.title : `Show ${p.title}`}
              tabIndex={visible ? 0 : -1}
              className="absolute top-1/2 left-1/2 h-[15rem] w-[11rem] cursor-pointer sm:h-[22rem] sm:w-[16rem]"
              style={{
                transform: `translate(-50%, -50%) translateX(calc(${off} * var(--gap))) translateZ(${-abs * 170}px) rotateY(${-off * 28}deg) scale(${1 - abs * 0.17})`,
                opacity: visible ? 1 - abs * 0.2 : 0,
                filter: abs ? `saturate(${1 - abs * 0.15}) blur(${abs > 2 ? 1 : 0}px)` : "none",
                zIndex: 10 - abs,
                pointerEvents: visible ? "auto" : "none",
                transition: "transform 0.9s cubic-bezier(0.22, 0.8, 0.22, 1), opacity 0.9s ease, filter 0.9s ease",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" draggable={false}
                className={`h-full w-full object-contain transition duration-700 ${off === 0 ? "drop-shadow-[0_35px_30px_rgba(0,0,0,0.35)]" : "drop-shadow-[0_18px_18px_rgba(0,0,0,0.2)]"}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <button type="button" onClick={() => go(-1)} aria-label="Previous pack"
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-forest/20 bg-white text-forest transition hover:bg-forest hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <Link href={`/products/${cur.slug}`} className="group min-w-48 text-center" aria-live="polite">
          <span key={cur.slug} className="block font-serif text-2xl font-semibold text-forest animate-[fade-in_0.5s_ease]">{cur.title}</span>
          <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:gap-2">View product <ArrowRight size={14} /></span>
        </Link>
        <button type="button" onClick={() => go(1)} aria-label="Next pack"
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-forest/20 bg-white text-forest transition hover:bg-forest hover:text-white">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
