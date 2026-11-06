// Tailwind v4's Turbopack loader (wired up in next.config.ts) only applies
// to `next dev`/`next build` without --webpack. Production builds here force
// --webpack (Turbopack has a flaky Google Fonts bug on this Next version),
// so webpack needs its own Tailwind entry point — this PostCSS plugin is it.
// Without this file, a webpack build silently emits only the hand-written
// CSS in globals.css, with none of Tailwind's generated utility classes.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
