export function Closing() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16 text-center">
      <h2 className="font-display text-3xl text-ink">Follow the build</h2>
      <p className="mx-auto mt-3 max-w-md text-stone">
        The code is open. That&apos;s the proof, until there&apos;s more to show.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <a
          href="https://github.com/bleu/barad-stellar-wallet"
          target="_blank"
          rel="noreferrer"
          className="rounded-sm bg-lamp px-5 py-2.5 text-sm font-medium text-lamp-ink transition hover:opacity-90"
        >
          GitHub
        </a>
        <a
          href="https://github.com/bleu/barad-stellar-wallet/blob/master/docs/spec.md"
          target="_blank"
          rel="noreferrer"
          className="rounded-sm border border-line px-5 py-2.5 text-sm text-ink transition hover:border-stone"
        >
          Specification
        </a>
      </div>
    </section>
  );
}
