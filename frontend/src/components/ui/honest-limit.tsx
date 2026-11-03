// Spec section 9: an "Honest limit" callout used wherever a section states
// what is not done yet. Section 13 acceptance checklist requires it in the
// security section and next to every unfinished feature.
export function HonestLimit({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-gold bg-surface py-2 pl-4 text-sm text-mist">
      <span className="font-medium text-pale">Honest limit. </span>
      {children}
    </div>
  );
}
