import type { SignerRole } from "./types";

// Deliberately its own module, not re-exported from a "use client" file:
// a plain object export from a client component isn't reliably passable
// across the server/client boundary (confirmed by a real bug this session —
// a server component importing it from role-groups-editor.tsx silently got
// `undefined`), so anything that needs this from a server component (e.g.
// role-groups-view.tsx) must import it from here instead.
export const ROLE_LABELS: Record<SignerRole, string> = {
  governance: "Governance",
  admin: "Admin",
  operator: "Operator",
};
