"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Storefront scroll motion, mounted once in the store layout.
 * - [data-reveal] / [data-split]: get .is-in when scrolled into view (CSS in globals.css does the animation).
 * - [data-parallax="0.15"]: moved vertically with scroll by that fraction.
 * Content is only hidden while html.reveal-on is set (by an inline script), and a fallback
 * reveals everything after 3 s so nothing can stay invisible.
 */
export default function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in), [data-split]:not(.is-in)");
    if (reduce || !("IntersectionObserver" in window)) {
      targets().forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    const observeAll = () => targets().forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    const fallback = setTimeout(() => targets().forEach((el) => el.getBoundingClientRect().top < innerHeight && el.classList.add("is-in")), 3000);

    let raf = 0;
    // Safety net: anything already on screen is revealed even if the observer missed it.
    let lastCheck = 0;
    const revealVisible = () => {
      const now = Date.now();
      if (now - lastCheck < 120) return;
      lastCheck = now;
      targets().forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    };
    const parallax = () => {
      raf = 0;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.parentElement!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const offset = (r.top + r.height / 2 - innerHeight / 2) * Number(el.dataset.parallax || 0.15);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.15)`;
      });
    };
    const onScroll = () => {
      revealVisible();
      raf ||= requestAnimationFrame(parallax);
    };
    parallax();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    root.classList.add("reveal-on");
    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(fallback);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return null;
}

/** Heading that reveals word by word. */
export function SplitText({ text, as: Tag = "h2", className, delay = 0 }: { text: string; as?: ElementType; className?: string; delay?: number }) {
  return (
    <Tag className={className} data-split="" style={{ "--d": `${delay}ms` } as CSSProperties} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="w"><span style={{ "--i": i } as CSSProperties}>{w}</span></span>{" "}
        </span>
      ))}
    </Tag>
  );
}

/** Number that counts up when it scrolls into view, e.g. "9,000+", "₹120 Cr+", "93.7%". */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const m = /^(\D*)([\d,.]+)(.*)$/.exec(value);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || !m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = Number(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const fmt = (n: number) => pre + n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1800);
        setShown(fmt(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setShown(value);
      };
      setShown(fmt(0));
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => (io.disconnect(), cancelAnimationFrame(raf));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span ref={ref} className={className}>{shown}</span>;
}

/** Endless horizontal strip; children are rendered twice for a seamless loop. */
export function Marquee({ children, speed = 40, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max" style={{ "--speed": `${speed}s` } as CSSProperties}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
