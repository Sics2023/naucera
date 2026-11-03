"use client";

import { useState } from "react";

type Point = { date: string; revenue: number; orders: number };

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const short = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `₹${n}`);
const label = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Daily revenue, single series bar chart with hover tooltip. */
export default function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.some((d) => d.revenue > 0)) {
    return (
      <div className="grid h-56 place-items-center rounded-lg border border-dashed border-stone-200 text-center text-sm text-stone-500">
        <div><p className="font-medium text-stone-700">No sales in the last 30 days yet</p><p className="mt-1">Daily revenue will appear here once orders come in.</p></div>
      </div>
    );
  }
  const W = 720, H = 300, padL = 44, padB = 24, padT = 12;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const bw = (W - padL) / data.length;
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const h = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Daily revenue, last 30 days" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="#e7e5e4" strokeDasharray={t === 0 ? undefined : "3 3"} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#78716c">{short(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * bw;
          const barW = Math.max(2, bw - 3);
          const top = y(d.revenue);
          const height = H - padB - top;
          const r = Math.min(4, barW / 2, height);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
              {d.revenue > 0 && (
                <path
                  d={`M${x + 1.5},${H - padB} V${top + r} q0,-${r} ${r},-${r} H${x + 1.5 + barW - r} q${r},0 ${r},${r} V${H - padB} Z`}
                  fill={hover === i ? "#4a2f1c" : "#a8713f"}
                />
              )}
              {(i % 5 === 0 || i === data.length - 1) && (
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#78716c">{label(d.date)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {h && hover != null && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((padL + hover * bw + bw / 2) / W) * 100}%`, transform: `translateX(${hover > data.length * 0.7 ? "-100%" : hover < data.length * 0.2 ? "0" : "-50%"})` }}
        >
          <div className="font-medium text-stone-900">{label(h.date)}</div>
          <div className="text-stone-600">{fmt(h.revenue)} · {h.orders} order{h.orders === 1 ? "" : "s"}</div>
        </div>
      )}
    </div>
  );
}
