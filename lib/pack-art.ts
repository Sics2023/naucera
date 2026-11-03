/** Generates a simple illustrated product-pouch SVG, used for sample products until real photos are uploaded. */
export function packArt(opts: { title: string; subtitle: string; color: string; accent: string }) {
  const { title, subtitle, color, accent } = opts;
  const words = title.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 14) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const text = lines
    .slice(0, 3)
    .map(
      (l, i) =>
        `<text x="300" y="${330 + i * 44}" text-anchor="middle" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#fff">${esc(l)}</text>`
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#faf6f0"/><stop offset="1" stop-color="#efe5d6"/></linearGradient>
    <linearGradient id="p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${color}"/><stop offset="0.55" stop-color="${color}"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="545" rx="170" ry="18" fill="#000" opacity="0.08"/>
  <path d="M150 110 L450 110 L470 530 Q300 548 130 530 Z" fill="${color}"/>
  <path d="M150 110 L450 110 L470 530 Q300 548 130 530 Z" fill="url(#p)" opacity="0.6"/>
  <rect x="150" y="96" width="300" height="34" rx="4" fill="${accent}"/>
  <g stroke="#fff" stroke-opacity="0.35" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<line x1="${158 + i * 21}" y1="100" x2="${158 + i * 21}" y2="126"/>`).join("")}</g>
  <text x="300" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="10" fill="#fff" opacity="0.9">NAUCERA</text>
  <line x1="230" y1="222" x2="370" y2="222" stroke="${accent}" stroke-width="3"/>
  <circle cx="300" cy="262" r="20" fill="none" stroke="${accent}" stroke-width="3"/>
  <path d="M290 262 q10 -16 20 0 q-10 16 -20 0" fill="${accent}"/>
  ${text}
  <rect x="200" y="${lines.length > 2 ? 470 : 440}" width="200" height="40" rx="20" fill="${accent}"/>
  <text x="300" y="${lines.length > 2 ? 497 : 467}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="${color}" letter-spacing="2">${esc(subtitle.toUpperCase())}</text>
</svg>`;
}
