// The hero visual, restyled from the user's art reference (2026-11-03): a
// dark, atmospheric fortress scene rather than a flat diagram, built from
// layered SVG (no raster/photographic assets available) — distant
// mountains, a glow and beacon beam, a spired keep with coursed masonry
// and a hatched shadow side, and a small figure for scale. The doorway
// keeps its job from the original diagram: wide exit on the left (1
// signature), narrow entry on the right (3 signatures). Captions live
// outside the SVG as plain HTML, not <text> — avoids hand-tuning SVG text
// layout to dodge collisions.
const COURSE_ROWS = [170, 195, 220, 245];

export function TreasuryDiagram() {
  return (
    <figure className="w-full max-w-lg">
      <svg
        viewBox="0 0 480 300"
        className="h-auto w-full"
        role="img"
        aria-label="A spired keep at night, lit by a beacon, with a wide exit archway on the left requiring 1 signature and a narrow entry slit on the right requiring 3 signatures."
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--gold-bright)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--gold-bright)" stopOpacity="0" />
          </linearGradient>
          <pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--obsidian)" strokeWidth="1" opacity="0.35" />
          </pattern>
          <clipPath id="keepBody">
            <path d="M170,280 L170,140 L182,110 L192,130 L206,90 L218,130 L240,40 L262,130 L274,90 L288,130 L298,110 L310,140 L310,280 Z" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="480" height="300" fill="url(#glow)" />

        {/* distant mountains */}
        <path
          d="M0,272 L40,234 L90,258 L140,224 L200,254 L260,228 L320,262 L380,234 L430,258 L480,244 L480,300 L0,300 Z"
          fill="var(--surface)"
          opacity="0.7"
        />

        {/* beacon beam, rising from the tallest spire */}
        <path d="M225,40 L255,40 L285,0 L195,0 Z" fill="url(#beam)" />

        {/* keep body: shadow hatch, masonry coursing, silhouette */}
        <rect x="240" y="40" width="70" height="240" fill="url(#hatch)" clipPath="url(#keepBody)" opacity="0.5" />
        {COURSE_ROWS.map((y) => (
          <line key={y} x1="170" y1={y} x2="310" y2={y} stroke="var(--obsidian)" strokeWidth="1" opacity="0.4" clipPath="url(#keepBody)" />
        ))}
        <path
          d="M170,280 L170,140 L182,110 L192,130 L206,90 L218,130 L240,40 L262,130 L274,90 L288,130 L298,110 L310,140 L310,280 Z"
          fill="var(--surface-raised)"
          stroke="var(--pale)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="240" cy="40" r="2" fill="var(--gold-bright)" />

        {/* arrow-slit window, a watchful eye by shape */}
        <path d="M240,160 Q251,172 240,184 Q229,172 240,160 Z" fill="var(--obsidian)" stroke="var(--pale)" strokeWidth="1.3" />
        <circle cx="240" cy="172" r="3" fill="var(--gold)" />

        {/* wide exit archway, left */}
        <path d="M180,280 L180,237 Q200,217 220,237 L220,280 Z" fill="var(--obsidian)" stroke="var(--pale)" strokeWidth="2" />
        {/* narrow entry slit, right */}
        <rect x="270" y="248" width="14" height="32" fill="var(--obsidian)" stroke="var(--pale)" strokeWidth="2" />

        {/* a small figure, for scale */}
        <circle cx="108" cy="252" r="4.5" fill="var(--mist)" />
        <path d="M100,258 L116,258 L111,280 L105,280 Z" fill="var(--mist)" />
      </svg>
      <figcaption className="mt-3 flex justify-between text-sm font-medium text-pale">
        <span>Exit: 1 signature</span>
        <span>Enter: 3 signatures</span>
      </figcaption>
    </figure>
  );
}
