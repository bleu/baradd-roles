// The hero visual, spec section 6: "one treasury block with a wide opening
// on the left labeled 'Exit: 1 signature' and a narrow gate on the right
// labeled 'Enter: 3 signatures'. Static, readable without animation."
// Drawn as a crenellated keep with coursed masonry and a hatched shadow
// side, matching the logo's arrow-slit "eye" window and asymmetric
// doorway — an engineering-manual elevation, not an illustration.
const COURSE_ROWS = [70, 100, 130, 160, 190, 220];
const JOINTS_EVEN = [120, 160, 200, 240, 280, 320, 360];
const JOINTS_ODD = [100, 140, 180, 220, 260, 300, 340, 380];

export function TreasuryDiagram() {
  return (
    <svg
      viewBox="0 0 480 300"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="A crenellated keep with a wide exit archway on the left requiring 1 signature, and a narrow entry slit on the right requiring 3 signatures."
    >
      <defs>
        <pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink)" strokeWidth="1" opacity="0.18" />
        </pattern>
        <clipPath id="towerBody">
          <path d="M100,260 L100,40 L100,20 L140,20 L140,40 L160,40 L160,20 L200,20 L200,40 L220,40 L220,20 L260,20 L260,40 L280,40 L280,20 L320,20 L320,40 L340,40 L340,20 L380,20 L380,40 L380,260 Z" />
        </clipPath>
      </defs>

      {/* shaded side, suggesting light from the upper left */}
      <rect x="280" y="20" width="100" height="240" fill="url(#hatch)" clipPath="url(#towerBody)" />

      {/* masonry coursing */}
      {COURSE_ROWS.map((y) => (
        <line key={y} x1="100" y1={y} x2="380" y2={y} stroke="var(--line)" strokeWidth="1" />
      ))}
      {COURSE_ROWS.map((y, i) => {
        const joints = i % 2 === 0 ? JOINTS_EVEN : JOINTS_ODD;
        const bottom = COURSE_ROWS[i + 1] ?? 250;
        return joints
          .filter((x) => x > 100 && x < 380)
          .map((x) => <line key={`${y}-${x}`} x1={x} y1={y} x2={x} y2={Math.min(bottom, y + 14)} stroke="var(--line)" strokeWidth="1" />);
      })}

      {/* crenellated silhouette */}
      <path
        d="M100,260 L100,40 L100,20 L140,20 L140,40 L160,40 L160,20 L200,20 L200,40 L220,40 L220,20 L260,20 L260,40 L280,40 L280,20 L320,20 L320,40 L340,40 L340,20 L380,20 L380,40 L380,260 Z"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* arrow-slit window, a watchful eye by shape */}
      <path d="M240,85 Q254,100 240,115 Q226,100 240,85 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="240" cy="100" r="4" fill="var(--lamp)" />

      {/* wide exit archway, left */}
      <path d="M100,260 L100,205 Q135,180 170,205 L170,260 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
      {/* narrow entry slit, right */}
      <rect x="355" y="215" width="15" height="45" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />

      <text x="135" y="282" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--ink)">
        Exit: 1 signature
      </text>
      <text x="362" y="282" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--ink)">
        Enter: 3 signatures
      </text>
    </svg>
  );
}
