import type { CSSProperties } from "react";

/** Small leaf glyph. */
export function Leaf({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M21 3C11 3 4 8 4 15c0 2 .6 3.7 1.6 5C7 13 12 9 17 7c-4 3-8 7-10 13.5 1.3.6 2.7.9 4.2.9C18 21.4 21 13 21 3Z" fill="currentColor" />
    </svg>
  );
}

/** Eyebrow label followed by a thin rule ending in a leaf, e.g. "OUR STORY ——🍃". */
export function Eyebrow({ children, className = "", tone = "text-brand-700" }: { children: React.ReactNode; className?: string; tone?: string }) {
  return (
    <p data-reveal="" className={`flex items-center gap-4 text-xs font-semibold tracking-[0.3em] uppercase sm:text-sm ${tone} ${className}`}>
      <span>{children}</span>
      <span className="flex items-center">
        <span className="h-px w-16 bg-current opacity-50 sm:w-36" />
        <Leaf className="-ml-0.5 size-4 -rotate-12" />
      </span>
    </p>
  );
}

/** Faint line-art tea sprig used at the edges of cream sections. */
export function Sprig({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  const leaves = [
    { x: 60, y: 40, r: -35, s: 1 }, { x: 95, y: 85, r: 30, s: 0.95 }, { x: 52, y: 125, r: -40, s: 1.1 },
    { x: 92, y: 170, r: 35, s: 1 }, { x: 48, y: 215, r: -30, s: 0.9 }, { x: 86, y: 255, r: 40, s: 0.85 },
  ];
  return (
    <svg viewBox="0 0 140 300" className={`pointer-events-none ${className}`} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
      <path d="M72 300 C70 230 76 150 70 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <path d="M0 0 C14 -16 40 -14 52 0 C40 14 14 16 0 0 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.2" />
          <path d="M0 0 L50 0" stroke="currentColor" strokeWidth="0.9" />
        </g>
      ))}
    </svg>
  );
}

/** Soft double curve at the bottom of a section, sweeping into the colour of the next one. */
export function Wave({ color = "#0f3b33", accent = "#e9dcc0", className = "" }: { color?: string; accent?: string; className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={`block h-16 w-full sm:h-24 ${className}`} aria-hidden="true">
      <path d="M0 40 C 360 120, 900 0, 1440 70 L1440 120 L0 120 Z" fill={accent} />
      <path d="M0 70 C 420 130, 980 30, 1440 95 L1440 120 L0 120 Z" fill={color} />
    </svg>
  );
}
