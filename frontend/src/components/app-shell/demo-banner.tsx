// Spec section 6, microcopy for status: "Demo data. No live treasury is
// connected." Section 13 acceptance checklist requires it on every screen
// of the wallet UI.
export function DemoBanner() {
  return (
    <div className="border-b border-line bg-surface px-6 py-2 text-center text-xs text-stone">
      Demo data. No live treasury is connected.
    </div>
  );
}
