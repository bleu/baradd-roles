export function Closing() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16 text-center">
      <h2 className="font-display text-3xl text-pale">Follow the build</h2>
      <p className="mx-auto mt-3 max-w-md text-mist">The code is open.</p>
      <div className="mt-6 flex justify-center gap-3">
        <a
          href="https://github.com/bleu/baradd-roles"
          target="_blank"
          rel="noreferrer"
          className="btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
        >
          GitHub
        </a>
        <a
          href="https://github.com/bleu/baradd-roles/blob/master/docs/spec.md"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border-[3px] border-line px-5 py-2.5 text-sm text-pale transition hover:border-mist"
        >
          Specification
        </a>
      </div>
    </section>
  );
}
