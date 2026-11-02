// The hero visual, spec section 6: "one treasury block with a wide opening
// on the left labeled 'Exit: 1 signature' and a narrow gate on the right
// labeled 'Enter: 3 signatures'. Static, readable without animation."
export function TreasuryDiagram() {
  return (
    <svg
      viewBox="0 0 480 300"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="A treasury block with a wide exit on the left requiring 1 signature, and a narrow entry gate on the right requiring 3 signatures."
    >
      {/* masonry courses */}
      {[0, 1, 2, 3, 4].map((row) => (
        <line
          key={row}
          x1="40"
          y1={40 + row * 44}
          x2="440"
          y2={40 + row * 44}
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}
      <rect x="40" y="40" width="400" height="220" fill="none" stroke="var(--ink)" strokeWidth="2" />

      {/* wide exit, left */}
      <rect x="40" y="172" width="110" height="88" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
      {/* narrow entry gate, right */}
      <rect x="380" y="216" width="30" height="44" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />

      <text x="95" y="285" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--ink)">
        Exit: 1 signature
      </text>
      <text x="395" y="285" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--ink)">
        Enter: 3 signatures
      </text>
    </svg>
  );
}
