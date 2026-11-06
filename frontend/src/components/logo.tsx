/**
 * The official Baradd fortress mark — negative-space twin towers converging
 * to a central spire, with an arched gate cut from the base. From the
 * user-supplied brand asset pack (public/brand/svg/baradd-mark.svg),
 * reproduced here as a path so it inherits currentColor like the rest of
 * the UI rather than being a static asset.
 */
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M12 88 L18 38 L31 32 L31 19 L41 25 L47 8 L53 25 L63 19 L63 32 L76 38 L82 88 L66 88 L62 49 L55 45 L55 35 L51 40 L51 53 L49 53 L49 40 L45 35 L45 45 L38 49 L34 88 Z M42 88 L42 70 Q42 58 50 58 Q58 58 58 70 L58 88 Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
